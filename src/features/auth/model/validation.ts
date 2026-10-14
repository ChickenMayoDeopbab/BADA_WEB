// BADA 앱의 인증 입력 규칙과 같은 기준으로 값을 검증합니다.
// 각 함수는 오류가 없으면 빈 문자열을 반환합니다.

const EMAIL_PATTERN = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
const PASSWORD_MIN_LENGTH = 8

/** 이메일 입력값을 검증합니다. */
export const validateEmail = (value: string) => {
  if (!value.trim()) return '이메일을 입력해주세요.'
  if (!EMAIL_PATTERN.test(value.trim())) return '올바른 이메일 형식이 아닙니다.'
  return ''
}

/** 인증코드 입력값을 검증합니다. */
export const validateAuthCode = (value: string) => (value.trim() ? '' : '인증코드를 입력해주세요.')

/** 로그인 아이디 입력값을 검증합니다. */
export const validateLoginUsername = (value: string) =>
  value.trim() ? '' : '아이디를 입력해주세요.'

/** 로그인 비밀번호 입력값을 검증합니다. */
export const validateLoginPassword = (value: string) => (value ? '' : '비밀번호를 입력해주세요.')

/** 회원가입 이름 입력값을 검증합니다. */
export const validateName = (value: string) => {
  if (!value.trim()) return '이름을 입력해주세요.'
  if (value.trim().length < 2) return '이름은 2자 이상이어야 합니다.'
  return ''
}

/** 회원가입 아이디 입력값을 검증합니다. */
export const validateUsername = (value: string) => {
  if (!value.trim()) return '아이디를 입력해주세요.'
  if (value.trim().length < 2) return '아이디는 2자 이상이어야 합니다.'
  return ''
}

/** 새로 설정할 비밀번호를 검증합니다. */
export const validatePassword = (value: string, requiredMessage = '비밀번호를 입력해주세요.') => {
  if (!value) return requiredMessage
  if (value.length < PASSWORD_MIN_LENGTH) return '비밀번호는 8자 이상이어야 합니다.'
  if (!PASSWORD_PATTERN.test(value)) return '영문, 숫자를 포함해야 합니다.'
  return ''
}

/** 비밀번호 확인 입력값이 원래 비밀번호와 같은지 검증합니다. */
export const validatePasswordConfirm = (
  value: string,
  password: string,
  requiredMessage = '비밀번호 확인을 입력해주세요.',
) => {
  if (!value) return requiredMessage
  if (value !== password) return '비밀번호가 일치하지 않습니다.'
  return ''
}
