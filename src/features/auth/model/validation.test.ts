import { describe, expect, it } from 'vitest'
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirm,
  validateUsername,
} from './validation'

describe('auth validation', () => {
  it('이메일 형식을 검증한다', () => {
    expect(validateEmail('')).toBe('이메일을 입력해주세요.')
    expect(validateEmail('bada')).toBe('올바른 이메일 형식이 아닙니다.')
    expect(validateEmail('bada@example.com')).toBe('')
  })

  it('이름과 아이디는 2자 이상이어야 한다', () => {
    expect(validateName(' 김 ')).toBe('이름은 2자 이상이어야 합니다.')
    expect(validateName('김바다')).toBe('')
    expect(validateUsername('a')).toBe('아이디는 2자 이상이어야 합니다.')
    expect(validateUsername('bada')).toBe('')
  })

  it('비밀번호는 8자 이상이며 영문과 숫자를 포함해야 한다', () => {
    expect(validatePassword('')).toBe('비밀번호를 입력해주세요.')
    expect(validatePassword('abc123')).toBe('비밀번호는 8자 이상이어야 합니다.')
    expect(validatePassword('abcdefgh')).toBe('영문, 숫자를 포함해야 합니다.')
    expect(validatePassword('abcd1234')).toBe('')
  })

  it('비밀번호 확인 값이 일치하는지 검증한다', () => {
    expect(validatePasswordConfirm('', 'abcd1234')).toBe('비밀번호 확인을 입력해주세요.')
    expect(validatePasswordConfirm('abcd1235', 'abcd1234')).toBe('비밀번호가 일치하지 않습니다.')
    expect(validatePasswordConfirm('abcd1234', 'abcd1234')).toBe('')
  })
})
