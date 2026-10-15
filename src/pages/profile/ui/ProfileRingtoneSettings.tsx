import { useRingtoneSettings } from '../model/useRingtoneSettings'
import { routePaths } from '@shared/config'
import { ConfirmDialog } from '@shared/ui'
import { useId, useRef } from 'react'
import { FiPlay, FiSquare, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'

/** 서버에 보관된 기본·사용자 벨소리 선택과 미리듣기 작업을 표시합니다. */
export const ProfileRingtoneSettings = () => {
  const settings = useRingtoneSettings()
  const inputRef = useRef<HTMLInputElement>(null)
  const groupId = useId()
  const options = [
    { fileId: null, title: '기본 벨소리', description: '서비스에서 제공하는 기본 벨소리' },
    ...settings.ringtones.map((ringtone) => ({ ...ringtone, description: '직접 추가한 벨소리' })),
  ]

  return (
    <section className="p-7 max-sm:p-4 max-w-[1024px] rounded-card border border-line-alternative bg-background-normal shadow-subtle-card">
      <h2 className="text-headline1 font-bold text-label-normal">벨소리 설정</h2>
      <p className="mt-1 text-label text-label-alternative">
        훈련 중 사용할 벨소리를 선택하거나 직접 추가하세요.
      </p>
      <div className="mt-5 gap-3 flex items-center justify-between">
        <p className="text-body font-bold text-label-normal">벨소리 목록</p>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          aria-label="벨소리 파일"
          className="hidden"
          disabled={settings.isBusy}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void settings.handleUpload(file)
          }}
        />
        <button
          type="button"
          disabled={settings.isBusy || settings.isLoading}
          onClick={() => inputRef.current?.click()}
          className="h-11 px-5 rounded-component bg-primary-normal text-label font-bold text-label-strong disabled:opacity-50"
        >
          {settings.isUploading ? '추가 중...' : '＋ 벨소리 추가'}
        </button>
      </div>
      {settings.isLoading && (
        <p role="status" className="mt-4 text-label text-label-alternative">
          벨소리를 불러오는 중이에요.
        </p>
      )}
      {settings.errorMessage && (
        <div className="mt-4" role="alert">
          <p className="text-label text-status-error">{settings.errorMessage}</p>
          <button
            type="button"
            onClick={settings.handleRetry}
            className="mt-2 text-label font-bold text-primary-normal"
          >
            다시 불러오기
          </button>
        </div>
      )}
      <fieldset disabled={settings.isBusy || settings.isLoading} className="mt-3 space-y-3">
        <legend className="sr-only">통화 훈련 벨소리</legend>
        {options.map((option) => (
          <div
            key={option.fileId ?? 'default'}
            className={`px-5 py-4 min-h-20 gap-3 ux-accordion ease-out flex flex-wrap items-center rounded-component transition-colors motion-reduce:transition-none ${settings.selectedId === option.fileId ? 'bg-primary-alternative hover:bg-primary-alternative/80' : 'bg-fill-normal hover:bg-fill-pressed'}`}
          >
            <label className="min-w-0 gap-4 flex flex-1 cursor-pointer items-center">
              <input
                type="radio"
                name={groupId}
                value={option.fileId ?? 'default'}
                checked={settings.selectedId === option.fileId}
                onChange={() => settings.setSelection(option.fileId)}
                className="size-5 accent-primary-normal"
              />
              <span className="min-w-0">
                <span className="block text-body font-bold break-all text-label-normal">
                  {option.title}
                </span>
                <span className="mt-1 block text-caption text-label-alternative">
                  {option.description}
                </span>
              </span>
            </label>
            <button
              type="button"
              aria-label={`${option.title} ${settings.previewId === option.fileId ? '정지' : '미리듣기'}`}
              aria-pressed={settings.previewId === option.fileId}
              onClick={() => void settings.handlePreview(option.fileId)}
              className="gap-2 p-2 flex items-center rounded-control text-label font-bold text-primary-normal"
            >
              {settings.previewId === option.fileId ? (
                <FiSquare aria-hidden="true" />
              ) : (
                <FiPlay aria-hidden="true" />
              )}
              {settings.previewId === option.fileId ? '정지' : '미리듣기'}
            </button>
            {option.fileId !== null && (
              <button
                type="button"
                aria-label={`${option.title} 삭제`}
                onClick={() => settings.handleRequestDelete(option.fileId!)}
                className="p-2 rounded-control text-status-error hover:bg-fill-pressed"
              >
                <FiTrash2 aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </fieldset>
      {settings.hasLoadedList && settings.ringtones.length === 0 && (
        <p className="mt-4 text-label text-label-alternative">추가한 벨소리가 없어요.</p>
      )}
      <div className="mt-8 gap-3 pt-5 flex items-center justify-end border-t border-line-alternative">
        <Link
          to={routePaths.profile}
          className="h-12 px-6 flex items-center rounded-component border border-line-neutral text-body font-bold text-label-normal"
        >
          취소
        </Link>
        <button
          type="button"
          onClick={settings.handleSave}
          disabled={!settings.canSave || settings.isBusy}
          className="h-12 px-6 rounded-component bg-primary-normal text-body font-bold text-label-strong disabled:opacity-50"
        >
          {settings.isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
      {settings.deletingId !== null && (
        <ConfirmDialog
          title="벨소리를 삭제할까요?"
          description="추가한 벨소리 파일이 삭제됩니다."
          confirmLabel="삭제"
          danger
          pending={settings.isDeleting}
          error={settings.deleteError}
          onClose={() => settings.setDeletingId(null)}
          onConfirm={settings.handleDelete}
        />
      )}
    </section>
  )
}
