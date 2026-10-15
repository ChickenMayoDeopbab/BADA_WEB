import type { CommunityReportTarget } from './report'
import { useToast } from '@shared/ui'
import { useState } from 'react'

/** 신고 창과 접수 완료 메시지의 표시 수명을 분리해 관리합니다. */
export const useCommunityReports = () => {
  const [reportTarget, setReportTarget] = useState<CommunityReportTarget | null>(null)
  const toast = useToast()

  /** 사유 선택 창을 닫습니다. */
  const handleCloseReport = () => setReportTarget(null)

  /** 서버 접수 성공 시 창을 닫고 잠시 완료 메시지를 표시합니다. */
  const handleReportSuccess = () => {
    setReportTarget(null)
    toast({ message: '신고가 접수되었습니다.', position: 'top-right' })
  }

  return {
    reportTarget,
    handleOpenReport: setReportTarget,
    handleCloseReport,
    handleReportSuccess,
  }
}
