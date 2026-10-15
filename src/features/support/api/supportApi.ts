import { aiHttpClient, httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

/** 제목과 내용을 고객 문의 API에 전달합니다. */
export const sendInquiry = async (input: { title: string; content: string }) =>
  (await aiHttpClient.post<{ message: string }>('/api/v1/inquiries', input)).data

/** 결제가 발생하지 않는 유료 서비스 관심 등록 여부를 조회합니다. */
export const getPaymentInterest = async () =>
  (await httpClient.get<ApiResponse<{ paymentIntended: boolean }>>('/api/v1/payment-intents/me'))
    .data.data

/** 실제 결제 없이 유료 서비스 이용 의향을 등록합니다. */
export const registerPaymentInterest = async () =>
  (await httpClient.post<ApiResponse<{ paymentIntended: boolean }>>('/api/v1/payment-intents')).data
    .data
