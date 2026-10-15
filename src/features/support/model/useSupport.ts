import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@shared/api'
import { getPaymentInterest, registerPaymentInterest, sendInquiry } from '../api/supportApi'

/** 문의 입력을 유지하며 전송 결과와 중복 전송을 관리합니다. */
export const useInquiry = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const mutation = useMutation({ mutationFn: sendInquiry, retry: false })
  const canSubmit =
    title.trim().length > 0 &&
    title.trim().length <= 100 &&
    content.trim().length > 0 &&
    content.trim().length <= 3000
  const handleSubmit = () => {
    if (!canSubmit || mutation.isPending || mutation.isSuccess) return
    mutation.mutate({ title: title.trim(), content: content.trim() })
  }
  return {
    title,
    content,
    setTitle,
    setContent,
    canSubmit,
    handleSubmit,
    isSending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.isError
      ? getApiErrorMessage(
          mutation.error,
          '문의를 전송하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.',
        )
      : '',
  }
}

/** 등록 상태를 서버에서 조회하고 등록 성공 응답으로 캐시를 갱신합니다. */
export const usePaymentInterest = () => {
  const queryClient = useQueryClient()
  const queryKey = ['payment-interest'] as const
  const status = useQuery({ queryKey, queryFn: getPaymentInterest })
  const register = useMutation({
    mutationFn: registerPaymentInterest,
    retry: false,
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
  })
  return {
    isLoading: status.isPending,
    isRegistered: status.data?.paymentIntended === true,
    isSaving: register.isPending,
    hasStatus: status.isSuccess,
    error:
      status.isError || register.isError
        ? getApiErrorMessage(
            register.error ?? status.error,
            '관심 등록 상태를 확인하지 못했어요. 다시 시도해 주세요.',
          )
        : '',
    retry: () => void status.refetch(),
    register: () => {
      if (status.isSuccess && !status.data?.paymentIntended && !register.isPending)
        register.mutate()
    },
  }
}
