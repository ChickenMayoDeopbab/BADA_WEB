/* Vite emits this self-contained module for the AudioWorklet global scope. */
class BadaPcmProcessor extends AudioWorkletProcessor {
  /** 실제 입력 샘플레이트를 16kHz로 변환할 필터와 청크를 준비합니다. */
  constructor() {
    super()
    this.isEnabled = false
    this.ratio = sampleRate / 16000
    this.chunk = new ArrayBuffer(640) // 320 samples = 20ms PCM16 LE
    this.view = new DataView(this.chunk)
    this.chunkIndex = 0
    this.inputIndex = 0
    this.nextOutput = 0
    this.history = new Float32Array(63)
    const cutoff = Math.min(0.45, 7200 / sampleRate)
    let total = 0
    this.filter = Float32Array.from({ length: 63 }, (_, index) => {
      const position = index - 31
      const sinc =
        position === 0
          ? 2 * cutoff
          : Math.sin(2 * Math.PI * cutoff * position) / (Math.PI * position)
      const weight = sinc * (0.54 - 0.46 * Math.cos((2 * Math.PI * index) / 62))
      total += weight
      return weight
    })
    this.filter = this.filter.map((weight) => weight / total)
    this.previousFiltered = 0
    this.port.onmessage = ({ data }) => {
      this.isEnabled = data.enabled === true
      // 차단된 구간의 잔여 입력은 다시 켰을 때 절대 전송하지 않습니다.
      this.chunkIndex = 0
      this.inputIndex = 0
      this.nextOutput = 0
      this.previousFiltered = 0
      this.history.fill(0)
    }
  }

  /** FIR 저역통과 후 연속적인 리샘플링과 PCM 변환을 수행합니다. */
  process(inputs) {
    const channels = inputs[0]
    if (!this.isEnabled || !channels?.[0]) return true
    for (let index = 0; index < channels[0].length; index += 1) {
      let mono = 0
      for (const channel of channels) mono += channel[index] / channels.length
      this.history[this.inputIndex % 63] = mono
      let filtered = 0
      for (let tap = 0; tap < 63; tap += 1) {
        filtered += this.history[(this.inputIndex - tap + 63) % 63] * this.filter[tap]
      }
      while (this.nextOutput <= this.inputIndex) {
        const fraction = this.inputIndex - this.nextOutput
        const value = Math.max(
          -1,
          Math.min(1, filtered * (1 - fraction) + this.previousFiltered * fraction),
        )
        this.view.setInt16(
          this.chunkIndex * 2,
          Math.round(value * (value < 0 ? 32768 : 32767)),
          true,
        )
        this.chunkIndex += 1
        this.nextOutput += this.ratio
        if (this.chunkIndex === 320) {
          this.port.postMessage(this.chunk, [this.chunk])
          this.chunk = new ArrayBuffer(640)
          this.view = new DataView(this.chunk)
          this.chunkIndex = 0
        }
      }
      this.previousFiltered = filtered
      this.inputIndex += 1
    }
    // 출력은 항상 무음입니다. 마이크를 스피커로 되돌리지 않습니다.
    return true
  }
}

registerProcessor('bada-pcm', BadaPcmProcessor)
