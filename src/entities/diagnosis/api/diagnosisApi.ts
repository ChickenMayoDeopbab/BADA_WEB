import type {
  DiagnosisQuestion,
  DiagnosisResult,
  DiagnosisSubmitRequest,
  DiagnosisType,
} from '../model/types'
import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'

const DIAGNOSIS_PATH = '/api/diagnosis'

/** 유형에 맞는 자가진단 문항 목록을 조회합니다. */
export const getDiagnosisQuestions = async (type: DiagnosisType) => {
  const { data } = await httpClient.get<ApiResponse<DiagnosisQuestion[]>>(
    `${DIAGNOSIS_PATH}/questions`,
    { params: { type } },
  )

  return data.data
}

/** 자가진단 응답을 제출하고 콜포비아 레벨 결과를 받습니다. */
export const submitDiagnosis = async (request: DiagnosisSubmitRequest) => {
  const { data } = await httpClient.post<ApiResponse<DiagnosisResult>>(
    `${DIAGNOSIS_PATH}/submit`,
    request,
  )

  return data.data
}
