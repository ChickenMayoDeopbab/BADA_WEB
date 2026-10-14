import type { ScriptHint } from '../model/voiceProtocol'
import { IoHelpCircle } from 'react-icons/io5'

interface ScriptHintBarProps {
  hint: ScriptHint | null
}

/** 앱 PR #186과 같이 추천·조언을 하단에 표시하고 힌트 없음이나 빈 문장은 숨깁니다. */
export const ScriptHintBar = ({ hint }: ScriptHintBarProps) => {
  const text = typeof hint?.text === 'string' ? hint.text.trim() : ''
  if (!hint || !text || (hint.level !== 1 && hint.level !== 2)) return null

  return (
    <div
      role="status"
      aria-label={hint.level === 1 ? '추천 문장' : '대답 조언'}
      className="mt-4 pt-4 shrink-0 border-t border-line-neutral"
    >
      {hint.level === 1 ? (
        <p className="text-body font-bold whitespace-pre-wrap text-label-strong">추천 : {text}</p>
      ) : (
        <div className="gap-2 flex items-start">
          <IoHelpCircle size={24} className="shrink-0 text-label-alternative" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-body font-medium whitespace-pre-wrap text-label-alternative">
            {text}
          </p>
        </div>
      )}
    </div>
  )
}
