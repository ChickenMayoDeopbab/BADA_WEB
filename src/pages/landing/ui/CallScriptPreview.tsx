import help from '@shared/assets/landing/figma/31777.svg'
import scriptLine from '@shared/assets/landing/figma/30be2.svg'
import type { CallHintMode } from '../model/callHints'

const scriptNodes = { advice: '6097:6878', suggestion: '6097:6850', none: '6097:6825' }

/** Figma의 조언·추천 문장·힌트 없음 세 스크립트 상태를 같은 슬롯에 표시합니다. */
export const CallScriptPreview = ({ hintMode }: { hintMode: CallHintMode }) => (
  <div
    className="app-call-script"
    data-figma-node={scriptNodes[hintMode]}
    data-hint-mode={hintMode}
  >
    <div className="app-call-dialogue">
      <p>상대 : 죄송하지만, 페퍼로니 피자의 재료가 소진되었습니다.</p>
      <p>나 : 저는 페퍼로니 피자가 아니면 먹지 못합니다.</p>
      <p>상대 : 손님 죄송합니다만 다른 메뉴로 주문 부탁드립니다.</p>
    </div>
    {hintMode !== 'none' && (
      <div className="app-call-hint">
        <img src={scriptLine} alt="" />
        {hintMode === 'advice' ? (
          <p>
            <img src={help} alt="" />
            상대방의 마음을 헤아리며 대답해볼까요?
          </p>
        ) : (
          <p className="app-call-suggestion">추천 : 그러면 (메뉴명)으로 주문하겠습니다.</p>
        )}
      </div>
    )}
  </div>
)
