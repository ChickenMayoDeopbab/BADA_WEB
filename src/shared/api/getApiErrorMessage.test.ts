import { expect, it } from 'vitest'
import { getApiErrorMessage } from './getApiErrorMessage'

/** 네트워크 없이 서버 오류 본문 형식만 검사합니다. */
const responseError = (data: unknown) => ({ isAxiosError: true, response: { data } })

it('Spring 메시지를 우선하고 FastAPI 문자열 detail도 표시한다', () => {
  expect(
    getApiErrorMessage(
      responseError({
        error: { message: 'Spring 오류' },
        message: '일반 오류',
        detail: 'FastAPI 오류',
      }),
      '기본 안내',
    ),
  ).toBe('Spring 오류')
  expect(
    getApiErrorMessage(responseError({ detail: '문의 제목을 확인해 주세요.' }), '기본 안내'),
  ).toBe('문의 제목을 확인해 주세요.')
})

it('FastAPI 검증 오류는 메시지만 표시하고 입력값과 객체를 노출하지 않는다', () => {
  const detail = [
    { msg: '제목이 너무 길어요.', input: 'private input' },
    { msg: '제목이 너무 길어요.' },
    { msg: '내용이 필요해요.' },
    { msg: { unexpected: true } },
  ]
  expect(getApiErrorMessage(responseError({ detail }), '기본 안내')).toBe(
    '제목이 너무 길어요.\n내용이 필요해요.',
  )
  expect(
    getApiErrorMessage(
      responseError({ error: { message: {} }, message: [], detail: { input: 'private input' } }),
      '기본 안내',
    ),
  ).toBe('기본 안내')
  expect(getApiErrorMessage(new Error('internal error'), '기본 안내')).toBe('기본 안내')
})
