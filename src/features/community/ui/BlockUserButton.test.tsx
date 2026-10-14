import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { BlockUserButton } from './BlockUserButton'
const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))
vi.mock('@entities/user-block', () => ({ useBlockUser: () => ({ mutate, isPending: false, isError: false }) }))
afterEach(() => { cleanup(); vi.restoreAllMocks(); mutate.mockClear() })
it('취소하면 차단하지 않고 확인하면 대상 ID를 차단한다', () => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true }
  HTMLDialogElement.prototype.close = vi.fn()
  render(<BlockUserButton id={23} name="사용자" />)
  fireEvent.click(screen.getByRole('button', { name: '사용자 사용자 메뉴' }))
  fireEvent.click(screen.getByRole('button', { name: '사용자 차단하기' }))
  fireEvent.click(screen.getByRole('button', { name: '취소' }))
  expect(mutate).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '사용자 사용자 메뉴' }))
  fireEvent.click(screen.getByRole('button', { name: '사용자 차단하기' }))
  fireEvent.click(screen.getByRole('button', { name: '차단하기' }))
  expect(mutate).toHaveBeenCalledWith(23, expect.objectContaining({ onSuccess: expect.any(Function) }))
})
it('외부 클릭과 Escape로 메뉴를 닫는다', () => {
  render(<BlockUserButton id={23} name="사용자" />)
  fireEvent.click(screen.getByRole('button', { name: '사용자 사용자 메뉴' }))
  fireEvent.mouseDown(document.body)
  expect(screen.queryByRole('button', { name: '사용자 차단하기' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '사용자 사용자 메뉴' }))
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('button', { name: '사용자 차단하기' })).not.toBeInTheDocument()
})
