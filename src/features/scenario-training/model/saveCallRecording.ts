/** 사용자가 시작한 녹음을 브라우저 다운로드로 저장하고 임시 URL을 해제합니다. */
export const saveCallRecording = (blob: Blob, sessionId: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `bada-call-${sessionId.replace(/[^a-zA-Z0-9_-]/g, '')}.${blob.type.includes('mp4') ? 'm4a' : 'webm'}`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
