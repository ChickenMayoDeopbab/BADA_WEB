/** 내부 오류값만 사용자 안내로 매핑하며 토큰이나 서버 원문을 노출하지 않습니다. */
export const getCallErrorMessage = (error: unknown): string => {
  const code = error instanceof Error ? error.message : ''
  const name = error instanceof Error ? error.name : ''
  if (['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(name))
    return '마이크 권한을 허용해야 통화할 수 있어요. 브라우저의 사이트 권한을 확인해 주세요.'
  if (['NotFoundError', 'DevicesNotFoundError'].includes(name))
    return '사용할 수 있는 마이크가 없어요. 마이크를 연결한 뒤 다시 시도해 주세요.'
  if (name === 'NotReadableError')
    return '마이크를 사용할 수 없어요. 다른 프로그램의 마이크 사용을 확인해 주세요.'
  if (['AUTH_REQUIRED', 'TOKEN_EXPIRED', 'AUTH_INVALID', 'TOKEN_INVALID'].includes(code))
    return '로그인 인증이 만료되었어요. 다시 로그인한 뒤 훈련을 시작해 주세요.'
  if (['SENSITIVE_INFO_CONSENT_REQUIRED', 'SENSITIVE_INFORMATION_CONSENT_REQUIRED'].includes(code))
    return '훈련에 필요한 정보 처리 동의가 필요해요. 계정의 동의 설정을 확인해 주세요.'
  if (code === 'UNSUPPORTED_BROWSER')
    return '이 브라우저는 실시간 음성을 지원하지 않아요. 최신 Chrome, Edge, Firefox 또는 Safari를 사용해 주세요.'
  if (code === 'INSECURE_AUDIO') return '마이크 통화에는 HTTPS 연결이 필요해요.'
  if (code === 'MICROPHONE_ENDED')
    return '마이크 연결이 끊어졌어요. 장치를 확인한 뒤 새 훈련을 시작해 주세요.'
  if (code === 'AUDIO_PREPARE_TIMEOUT')
    return '마이크 또는 오디오 준비가 지연되고 있어요. 권한을 확인한 뒤 다시 시도해 주세요.'
  if (code === 'AUDIO_RESUME_REQUIRED')
    return '브라우저가 음성 재생을 일시정지했어요. 음성 활성화 버튼을 눌러 주세요.'
  if (code === 'WS_TIMEOUT')
    return '통화 서버 연결 시간이 초과되었어요. 네트워크를 확인한 뒤 다시 시도해 주세요.'
  if (code === 'WS_END_TIMEOUT')
    return '통화는 종료됐지만 훈련 결과 확인이 지연되고 있어요. 훈련 기록에서 저장 여부를 확인해 주세요.'
  if (code.startsWith('WS_'))
    return '통화 서버와 연결이 끊어졌어요. 네트워크를 확인한 뒤 새 훈련을 시작해 주세요.'
  if (code.includes('PCM') || code === 'AUDIO_PLAYBACK_FAILED')
    return 'AI 음성을 재생하지 못했어요. 새 훈련을 시작해 주세요.'
  return '통화를 진행하지 못했어요. 잠시 후 새 훈련을 시작해 주세요.'
}
