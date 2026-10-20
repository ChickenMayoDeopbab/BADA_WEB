/** 스크롤에 따른 차분함과 작은 유기적 흔들림을 같은 좌표의 음성 선에 합칩니다. */
export const buildVoicePath = (calm = 0, phase = 0) =>
  Array.from({ length: 161 }, (_, index) => {
    const t = index / 160
    const envelope = Math.sin(Math.PI * t) ** 2
    const restless = Math.sin(t * Math.PI * 24) * 70 + Math.sin(t * Math.PI * 42) * 24
    const settled = Math.sin(t * Math.PI * 6) * 50
    const wiggle =
      (Math.sin(t * Math.PI * 10 + phase) - Math.sin(t * Math.PI * 10)) * 8 +
      (Math.sin(t * Math.PI * 18 - phase * 0.65) - Math.sin(t * Math.PI * 18)) * 5
    const wave = restless * (1 - calm) + settled * calm + wiggle * (1 - calm * 0.6)
    return `${index === 0 ? 'M' : 'L'}${(t * 1440).toFixed(2)},${(140 + wave * envelope).toFixed(2)}`
  }).join(' ')
