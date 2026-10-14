import { createPortal } from 'react-dom'
import type { PropsWithChildren } from 'react'

/** 고정 오버레이를 페이지의 변형·스크롤·쌓임 맥락에서 분리합니다. */
export const OverlayPortal = ({ children }: PropsWithChildren) =>
  createPortal(children, document.body)
