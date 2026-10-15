export interface Ringtone {
  fileId: number
  title: string
  url: string
}

export interface RingtoneSetting {
  defaultRingtone: boolean
  fileId?: number | null
  title?: string | null
  url?: string | null
}
