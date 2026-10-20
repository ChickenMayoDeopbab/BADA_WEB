import type { CSSProperties } from 'react'
import help from '@shared/assets/landing/figma/0df77.svg'
import back from '@shared/assets/landing/figma/fc0ea.svg'
import tick from '@shared/assets/landing/figma/a2605.svg'
import thumb from '@shared/assets/landing/figma/ba3e2.svg'
import {
  previewDifficulties,
  previewPersonalities,
  type PracticePreviewSelection,
} from '../model/practicePreview'

interface SettingsScaleProps {
  label: string
  options: readonly string[]
  value: number
  className: string
}

/** 3765:2869의 눈금·손잡이 에셋을 고정된 앱 좌표 안에서 이동시킵니다. */
const SettingsScale = ({ label, options, value, className }: SettingsScaleProps) => (
  <div className={`app-settings-field ${className}`}>
    <p>
      {label} <img src={help} alt="" />
    </p>
    <div className="app-settings-rail">
      {options.map((option) => (
        <img key={option} src={tick} alt="" />
      ))}
      <img
        className="app-settings-thumb"
        src={thumb}
        alt=""
        style={{ '--preview-position': value / (options.length - 1) } as CSSProperties}
      />
    </div>
    <div className="app-settings-labels">
      {options.map((option, index) => (
        <span key={option} data-selected={index === value}>
          {option}
        </span>
      ))}
    </div>
  </div>
)

/** Figma 훈련 설정 화면의 402×874 레이아웃을 실제 선택값으로 표시합니다. */
export const AppSettingsScreen = ({ difficulty, personality }: PracticePreviewSelection) => (
  <>
    <div className="app-settings-header">
      <img src={back} alt="" />
      <strong>훈련 설정</strong>
    </div>
    <div className="app-settings-progress">
      <span />
      <span />
    </div>
    <SettingsScale
      label="난이도"
      options={previewDifficulties}
      value={difficulty}
      className="app-settings-difficulty"
    />
    <SettingsScale
      label="상대의 태도"
      options={previewPersonalities}
      value={personality}
      className="app-settings-personality"
    />
    <div className="app-settings-next">다음으로</div>
  </>
)
