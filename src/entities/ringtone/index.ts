export {
  deleteRingtone,
  getRingtone,
  getRingtones,
  getRingtoneSetting,
  updateRingtoneSetting,
  uploadRingtone,
} from './api/ringtoneApi'
export type { Ringtone, RingtoneSetting } from './model/types'

export const ringtoneKeys = {
  list: ['ringtones', 'list'] as const,
  setting: ['ringtones', 'setting'] as const,
}
