/** 같은 개수의 좌표로 긴장된 목소리와 편안한 목소리의 파형을 만듭니다. */
export const buildVoicePath = (isCalm = false) =>
  Array.from({ length: 161 }, (_, index) => {
    const t = index / 160
    const envelope = Math.sin(Math.PI * t) ** 2
    const wave = isCalm
      ? Math.sin(t * Math.PI * 6) * 50
      : Math.sin(t * Math.PI * 24) * 70 + Math.sin(t * Math.PI * 42) * 24
    return `${index === 0 ? 'M' : 'L'}${(t * 1440).toFixed(2)},${(140 + wave * envelope).toFixed(2)}`
  }).join(' ')
