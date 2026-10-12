/** Spring Data 페이지 응답 중 화면에서 사용하는 필드입니다. */
export type PageResponse<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}
