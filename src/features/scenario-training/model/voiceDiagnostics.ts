/** 개발 통화 검사에 필요한 수치만 기록하고 토큰·URL·음성 내용은 포함하지 않습니다. */
export const reportVoiceDiagnostic = (
  event:
    | 'microphone_ready'
    | 'authenticated'
    | 'capture_gate'
    | 'microphone_sent'
    | 'playback_stats'
    | 'call_ended',
  metrics: Record<string, number | boolean | string>,
) => {
  if (import.meta.env.DEV) console.info('[BADA voice]', event, JSON.stringify(metrics))
}
