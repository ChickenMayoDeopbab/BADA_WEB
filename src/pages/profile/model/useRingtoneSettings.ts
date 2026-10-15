import {
  deleteRingtone,
  getRingtone,
  getRingtones,
  getRingtoneSetting,
  ringtoneKeys,
  updateRingtoneSetting,
  uploadRingtone,
} from '@entities/ringtone'
import { getApiErrorMessage } from '@shared/api'
import defaultRingtone from '@shared/assets/scenario-training/ringtone-default.mp3'
import { routePaths } from '@shared/config'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Spring multipart.max-file-size의 10MB 상한과 맞춥니다.
const MAX_RINGTONE_FILE_SIZE = 10 * 1024 * 1024
const MAX_RINGTONE_FILE_SIZE_MB = MAX_RINGTONE_FILE_SIZE / (1024 * 1024)

/** 벨소리 조회·업로드·선택·저장과 단일 음원 미리듣기를 관리합니다. */
export const useRingtoneSettings = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const list = useQuery({
    queryKey: ringtoneKeys.list,
    queryFn: ({ signal }) => getRingtones(signal),
  })
  const setting = useQuery({ queryKey: ringtoneKeys.setting, queryFn: getRingtoneSetting })
  const [selection, setSelection] = useState<number | null>()
  const [previewId, setPreviewId] = useState<number | null | undefined>()
  const [errorMessage, setErrorMessage] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previewVersion = useRef(0)
  const isActive = useRef(true)
  const savedId = setting.data?.defaultRingtone ? null : (setting.data?.fileId ?? null)
  const selectedId = selection === undefined ? savedId : selection

  /** 이전 재생과 대기 중인 미리듣기를 모두 정지합니다. */
  const stopPreview = () => {
    previewVersion.current += 1
    const audio = audioRef.current
    audioRef.current = null
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    setPreviewId(undefined)
  }

  useEffect(() => {
    isActive.current = true
    return () => {
      isActive.current = false
      previewVersion.current += 1
      const audio = audioRef.current
      if (audio) {
        audio.onended = null
        audio.onerror = null
      }
      audio?.pause()
      audio?.removeAttribute('src')
      audio?.load()
    }
  }, [])

  const upload = useMutation({
    mutationFn: uploadRingtone,
    onSuccess: async (ringtone) => {
      setSelection(ringtone.fileId)
      await queryClient.invalidateQueries({ queryKey: ringtoneKeys.list })
    },
  })
  const save = useMutation({
    mutationFn: updateRingtoneSetting,
    onSuccess: (nextSetting) => {
      queryClient.setQueryData(ringtoneKeys.setting, nextSetting)
      if (!isActive.current) return
      stopPreview()
      navigate(routePaths.profile)
    },
  })
  const remove = useMutation({
    mutationFn: deleteRingtone,
    onSuccess: async (_, fileId) => {
      if (selectedId === fileId) setSelection(undefined)
      setDeletingId(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ringtoneKeys.list }),
        queryClient.invalidateQueries({ queryKey: ringtoneKeys.setting }),
      ])
    },
  })

  /** 파일을 업로드하고 새 벨소리를 저장 후보로 선택합니다. */
  const handleUpload = async (file?: File) => {
    if (!file || upload.isPending) return
    setErrorMessage('')
    if (file.size === 0 || (file.type && !file.type.startsWith('audio/'))) {
      setErrorMessage('비어 있지 않은 오디오 파일을 선택해 주세요.')
      return
    }
    if (file.size > MAX_RINGTONE_FILE_SIZE) {
      setErrorMessage(`벨소리는 ${MAX_RINGTONE_FILE_SIZE_MB}MB 이하의 파일만 추가할 수 있어요.`)
      return
    }
    try {
      await upload.mutateAsync(file)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, '벨소리를 추가하지 못했습니다. 다시 시도해 주세요.'),
      )
    }
  }

  /** 사용자가 요청한 음원만 재생하며 늦게 도착한 조회 결과는 무시합니다. */
  const handlePreview = async (fileId: number | null) => {
    const shouldStop = previewId === fileId
    stopPreview()
    if (shouldStop) return
    setErrorMessage('')
    const version = previewVersion.current
    setPreviewId(fileId)
    try {
      const url = fileId === null ? defaultRingtone : (await getRingtone(fileId)).url
      if (version !== previewVersion.current) return
      if (!url) throw new Error('MISSING_RINGTONE_URL')
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = stopPreview
      audio.onerror = () => {
        if (version !== previewVersion.current) return
        stopPreview()
        setErrorMessage('벨소리를 재생하지 못했습니다. 다시 시도해 주세요.')
      }
      await audio.play()
    } catch (error) {
      if (version !== previewVersion.current) return
      stopPreview()
      setErrorMessage(
        getApiErrorMessage(error, '벨소리를 재생하지 못했습니다. 다시 시도해 주세요.'),
      )
    }
  }

  /** 저장 중 중복 요청을 막고 실패 시 현재 선택을 유지합니다. */
  const handleSave = () => {
    if (!setting.data || list.isError || save.isPending || upload.isPending || remove.isPending)
      return
    setErrorMessage('')
    save.mutate(selectedId)
  }

  /** 삭제 확인을 요청하고 재생 중인 음원을 정지합니다. */
  const handleRequestDelete = (fileId: number) => {
    stopPreview()
    remove.reset()
    setDeletingId(fileId)
  }

  /** 확인된 벨소리만 삭제하며 처리 중 중복 요청을 막습니다. */
  const handleDelete = () => {
    if (deletingId !== null && !remove.isPending) remove.mutate(deletingId)
  }

  /** 조회 오류가 발생한 목록과 설정을 다시 불러옵니다. */
  const handleRetry = () => {
    setErrorMessage('')
    void list.refetch()
    void setting.refetch()
  }

  return {
    maxUploadSizeMb: MAX_RINGTONE_FILE_SIZE_MB,
    ringtones: list.data ?? [],
    selectedId,
    previewId,
    deletingId,
    setSelection,
    setDeletingId,
    isLoading: list.isPending || setting.isPending,
    isBusy: upload.isPending || save.isPending || remove.isPending,
    isUploading: upload.isPending,
    isSaving: save.isPending,
    isDeleting: remove.isPending,
    hasLoadedList: list.isSuccess,
    canSave: Boolean(setting.data) && !list.isError && !list.isPending,
    errorMessage:
      errorMessage ||
      (list.isError || setting.isError
        ? '벨소리 설정을 불러오지 못했습니다. 다시 시도해 주세요.'
        : save.isError
          ? getApiErrorMessage(save.error, '벨소리를 저장하지 못했습니다. 다시 시도해 주세요.')
          : ''),
    deleteError: remove.isError
      ? getApiErrorMessage(remove.error, '벨소리를 삭제하지 못했습니다. 다시 시도해 주세요.')
      : undefined,
    handleUpload,
    handlePreview,
    handleSave,
    handleRequestDelete,
    handleDelete,
    handleRetry,
  }
}
