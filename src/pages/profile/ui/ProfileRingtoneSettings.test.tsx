import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ringtoneKeys } from '@entities/ringtone'
import { ProfileRingtoneSettings } from './ProfileRingtoneSettings'

const { get, post, put, remove } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('@shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/api')>()),
  httpClient: { get, post, put, delete: remove },
}))

const savedRingtone = {
  fileId: 9,
  title: '내 파도 소리',
  url: 'https://audio.example.test/wave.mp3',
}
let list = [savedRingtone]
let setting: { defaultRingtone: boolean; fileId: number | null } = {
  defaultRingtone: false,
  fileId: 9,
}
const play = vi.fn().mockResolvedValue(undefined)
const pause = vi.fn()
let audios: Array<{
  src: string
  play: typeof play
  pause: typeof pause
  onended?: () => void
  onerror?: () => void
}> = []

/** 실제 조회와 변경 훅을 프로필 라우트 안에서 실행합니다. */
const renderSettings = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/profile/ringtone']}>
        <Routes>
          <Route path="/profile/ringtone" element={<ProfileRingtoneSettings />} />
          <Route path="/profile" element={<h1>프로필로 이동</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { ...view, client }
}

beforeEach(() => {
  vi.clearAllMocks()
  list = [savedRingtone]
  setting = { defaultRingtone: false, fileId: 9 }
  audios = []
  get.mockImplementation(async (path: string) => ({
    data: {
      data: path.endsWith('/settings') ? setting : path.endsWith('/9') ? savedRingtone : list,
    },
  }))
  post.mockImplementation(async () => {
    const uploaded = {
      fileId: 10,
      title: '추가 음원.mp3',
      url: 'https://audio.example.test/new.mp3',
    }
    list = [...list, uploaded]
    return { data: { data: uploaded } }
  })
  put.mockImplementation(async (_path: string, body: { fileId: number | null }) => ({
    data: { data: { defaultRingtone: body.fileId === null, ...body } },
  }))
  remove.mockImplementation(async () => {
    list = []
    setting = { defaultRingtone: true, fileId: null }
  })
  vi.stubGlobal(
    'Audio',
    class {
      src: string
      play = play
      pause = pause
      removeAttribute = vi.fn()
      load = vi.fn()
      constructor(src: string) {
        this.src = src
        audios.push(this)
      }
    },
  )
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('서버 벨소리 설정', () => {
  it('10MB를 초과하면 전송하지 않고 상한 크기의 오디오 파일은 업로드한다', async () => {
    renderSettings()
    await screen.findByRole('radio', { name: /내 파도 소리/ })
    const input = screen.getByLabelText('벨소리 파일')
    fireEvent.change(input, {
      target: {
        files: [
          new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.mp3', { type: 'audio/mpeg' }),
        ],
      },
    })
    expect(await screen.findByRole('alert')).toHaveTextContent('10MB 이하')
    expect(post).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: /내 파도 소리/ })).toBeChecked()
    fireEvent.change(input, {
      target: {
        files: [new File([new Uint8Array(10 * 1024 * 1024)], 'limit.mp3', { type: 'audio/mpeg' })],
      },
    })
    expect(await screen.findByRole('radio', { name: /추가 음원.mp3/ })).toBeChecked()
    expect(post).toHaveBeenCalledOnce()
  })

  it('저장된 선택을 복원하고 업로드한 음원을 선택한 뒤 저장한다', async () => {
    const { client } = renderSettings()
    expect(await screen.findByRole('radio', { name: /내 파도 소리/ })).toBeChecked()
    expect(screen.queryByText('잔잔한 파도')).not.toBeInTheDocument()
    const file = new File(['audio'], '추가 음원.mp3', { type: 'audio/mpeg' })
    fireEvent.change(screen.getByLabelText('벨소리 파일'), { target: { files: [file] } })
    expect(await screen.findByRole('radio', { name: /추가 음원.mp3/ })).toBeChecked()
    expect(post.mock.calls[0][0]).toBe('/api/v1/ringtones')
    expect((post.mock.calls[0][1] as FormData).get('file')).toBe(file)
    await waitFor(() => expect(screen.getByRole('button', { name: '저장' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByRole('heading', { name: '프로필로 이동' })).toBeInTheDocument()
    expect(put).toHaveBeenCalledWith('/api/v1/ringtones/settings', { fileId: 10 })
    expect(client.getQueryData(ringtoneKeys.setting)).toMatchObject({ fileId: 10 })
  })

  it('기본 벨소리는 null로 저장하고 실패하면 선택을 유지해 재시도한다', async () => {
    put.mockRejectedValueOnce(new Error('network'))
    renderSettings()
    await screen.findByRole('radio', { name: /내 파도 소리/ })
    fireEvent.click(screen.getByRole('radio', { name: /기본 벨소리/ }))
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('벨소리를 저장하지 못했습니다.')
    expect(screen.getByRole('radio', { name: /기본 벨소리/ })).toBeChecked()
    expect(put).toHaveBeenCalledWith('/api/v1/ringtones/settings', { fileId: null })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByRole('heading', { name: '프로필로 이동' })).toBeInTheDocument()
  })

  it('삭제를 확인한 경우에만 요청하고 서버에서 바뀐 기본 선택을 반영한다', async () => {
    renderSettings()
    fireEvent.click(await screen.findByRole('button', { name: '내 파도 소리 삭제' }))
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(remove).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '내 파도 소리 삭제' }))
    fireEvent.click(screen.getByRole('button', { name: '삭제' }))
    await waitFor(() =>
      expect(screen.queryByRole('radio', { name: /내 파도 소리/ })).not.toBeInTheDocument(),
    )
    expect(remove).toHaveBeenCalledWith('/api/v1/ringtones/9')
    expect(screen.getByRole('radio', { name: /기본 벨소리/ })).toBeChecked()
  })

  it('정지 후 늦게 도착한 미리듣기 응답은 재생하지 않고 화면을 떠나면 음원을 해제한다', async () => {
    let resolvePreview!: (value: unknown) => void
    get.mockImplementation(async (path: string) => {
      if (path.endsWith('/9'))
        return new Promise((resolve) => {
          resolvePreview = resolve
        })
      return { data: { data: path.endsWith('/settings') ? setting : list } }
    })
    const { unmount } = renderSettings()
    fireEvent.click(await screen.findByRole('button', { name: '내 파도 소리 미리듣기' }))
    fireEvent.click(screen.getByRole('button', { name: '내 파도 소리 정지' }))
    await act(async () => resolvePreview({ data: { data: savedRingtone } }))
    expect(play).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '기본 벨소리 미리듣기' }))
    await waitFor(() => expect(play).toHaveBeenCalledOnce())
    unmount()
    expect(pause).toHaveBeenCalled()
  })

  it('오디오가 아닌 파일은 전송하지 않고 조회 실패 시 저장을 막는다', async () => {
    const view = renderSettings()
    await screen.findByRole('radio', { name: /내 파도 소리/ })
    fireEvent.change(screen.getByLabelText('벨소리 파일'), {
      target: { files: [new File(['text'], 'memo.txt', { type: 'text/plain' })] },
    })
    expect(await screen.findByRole('alert')).toHaveTextContent('오디오 파일')
    expect(post).not.toHaveBeenCalled()
    view.unmount()
    get.mockRejectedValue(new Error('offline'))
    renderSettings()
    expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })
})
