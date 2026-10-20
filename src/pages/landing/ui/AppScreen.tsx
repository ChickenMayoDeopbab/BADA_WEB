import cellular from '@shared/assets/landing/figma/c3074.svg'
import wifi from '@shared/assets/landing/figma/bbd1e.svg'
import battery from '@shared/assets/landing/figma/cbc74.svg'
import avatarBase from '@shared/assets/landing/figma/7c765.png'
import pizza from '@shared/assets/scenario-training/recommendation.png'
import hospital from '@shared/assets/scenario-training/work.png'
import delivery from '@shared/assets/scenario-training/daily.png'
import parcel from '@shared/assets/scenario-training/school.png'
import school from '@shared/assets/scenario-training/other.png'
import callStatus from '@shared/assets/landing/figma/cb93d.svg'
import callEnd from '@shared/assets/landing/figma/1c24a.svg'
import search from '@shared/assets/landing/figma/29853.svg'
import activeTab from '@shared/assets/landing/figma/f47a9.svg'
import history from '@shared/assets/landing/figma/61721.svg'
import cardCall from '@shared/assets/landing/figma/a68b9.svg'
import cardCallAlternate from '@shared/assets/landing/figma/2aacc.svg'
import arrow from '@shared/assets/landing/figma/c2d1c.svg'
import home from '@shared/assets/landing/figma/ebd1d.svg'
import call from '@shared/assets/landing/figma/04840.svg'
import records from '@shared/assets/landing/figma/ca3ae.svg'
import community from '@shared/assets/landing/figma/5efa7.svg'
import profile from '@shared/assets/landing/figma/69fcf.svg'
import timeline from '@shared/assets/landing/figma/d48e7.svg'
import dot from '@shared/assets/landing/figma/ba46a.svg'
import reportUp from '@shared/assets/landing/figma/12471.svg'
import reportDown from '@shared/assets/landing/figma/37e83.svg'
import waveform from '@shared/assets/landing/figma/1d556.svg'
import playhead from '@shared/assets/landing/figma/2aba8.svg'
import marker from '@shared/assets/training-records/audio-marker.svg'
import applause from '@shared/assets/landing/figma/01a2d.svg'
import { AppSettingsScreen } from './AppSettingsScreen'
import { CallScriptPreview } from './CallScriptPreview'
import {
  callHintOptions,
  type CallHintMode,
  type PracticePreviewSelection,
} from '../model/practicePreview'
import './appScreen.css'

export type AppScreenVariant = 'call' | 'scenario' | 'report' | 'settings'

interface AppScreenProps {
  variant: AppScreenVariant
  className?: string
  hintMode?: CallHintMode
  settings?: PracticePreviewSelection
}

const screenLabels = {
  call: 'BADA 앱 AI 통화 화면: 배준하 피자와 통화하며 스크립트로 연습해요.',
  scenario: 'BADA 앱 시나리오 화면: 피자 주문, 병원 예약, 배달 문의 등 상황을 선택해요.',
  report: 'BADA 앱 훈련 리포트: 통화 타임라인과 구간별 음성 분석, 피드백을 확인해요.',
  settings: 'BADA 앱 훈련 설정: 난이도와 상대의 태도를 내게 맞게 선택해요.',
}

/** Figma의 상태 표시줄을 원본 아이콘 크기로 구성합니다. */
const ScreenStatus = () => (
  <div className="app-status">
    <span>9:41</span>
    <div>
      <img src={cellular} alt="" />
      <img src={wifi} alt="" />
      <img src={battery} alt="" />
    </div>
  </div>
)

/** 앱 하단 메뉴의 실제 Figma 에셋을 원래 슬롯에 배치합니다. */
const ScreenNavigation = () => (
  <div className="app-screen-navigation">
    {[
      [home, '홈'],
      [call, '훈련'],
      [records, '기록'],
      [community, '커뮤니티'],
      [profile, '프로필'],
    ].map(([src, label]) => (
      <div key={label}>
        <img src={src} alt="" />
        <span className={label === '훈련' ? 'text-primary-normal' : ''}>{label}</span>
      </div>
    ))}
  </div>
)

/** 5932:8139 통화 화면을 402×874 디자인 좌표계 안에 구현합니다. */
const CallScreen = ({ hintMode }: { hintMode: CallHintMode }) => (
  <>
    <div className="app-call-timer">
      <img src={callStatus} alt="" />
      00:42
    </div>
    <div className="app-call-partner">
      <p className="text-display1 font-bold">배준하 피자</p>
      <p className="text-body text-label-neutral">폰 010-0000-0000</p>
    </div>
    <div className="app-call-avatar">
      <div>
        <img src={avatarBase} alt="" />
        <img src={pizza} alt="" />
      </div>
    </div>
    <div className="app-call-script-label">스크립트 가리기</div>
    <CallScriptPreview hintMode={hintMode} />
    <div className="app-call-end">
      <img src={callEnd} alt="" />
    </div>
  </>
)

/** 5932:8231의 시나리오 카드와 추천 배너를 원본 이미지 크롭으로 재현합니다. */
const ScenarioScreen = () => (
  <>
    <div className="app-scenario-title">
      <p className="text-title2 font-bold">시나리오 훈련</p>
      <img src={search} alt="" />
    </div>
    <div className="app-scenario-tabs">
      <span>
        기본 제공
        <img src={activeTab} alt="" />
      </span>
      <span>커스텀</span>
      <span>공유됨</span>
    </div>
    <div className="app-scenario-recommend">
      <p>이 시나리오 어때요?</p>
      <div className="app-scenario-banner">
        <img src={pizza} alt="" />
        <div>
          <p>
            <small>기본 제공 시나리오</small>
            <strong>피자 주문하기</strong>
          </p>
          <span>
            자세히 보기 <img src={arrow} alt="" />
          </span>
        </div>
      </div>
    </div>
    <div className="app-scenario-list">
      <p className="text-headline2 font-bold">시나리오</p>
      <div className="app-scenario-filters">
        {['전체', '업무', '일상', '학교', '기타'].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="app-scenario-grid">
        {[
          [hospital, '병원 예약', '5회'],
          [delivery, '배달 문의', '2회'],
          [parcel, '제품 환불', '2회'],
          [school, '식당 예약', '3회'],
        ].map(([src, title, count], index) => (
          <div key={title} className={`app-scenario-card app-scenario-card-${index}`}>
            <div className="app-scenario-card-image">
              <img src={src} alt="" />
            </div>
            <div className="app-scenario-card-copy">
              <p className="text-headline2 font-bold">{title}</p>
              <span>
                <img src={history} alt="" />
                {count}
              </span>
            </div>
            <div className="app-scenario-card-action">
              <img src={index < 2 ? cardCall : cardCallAlternate} alt="" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <ScreenNavigation />
  </>
)

/** 5932:8425의 리포트·타임라인·파형을 디자인 에셋 그대로 조합합니다. */
const ReportScreen = () => (
  <>
    <p className="app-report-title text-headline1 font-bold">훈련 리포트</p>
    <div className="app-report-summary">
      <div>
        <img src={applause} alt="" />
        <p className="text-title2 font-bold">많이 좋아졌는걸요?</p>
      </div>
      <div>
        <p>
          <span>시나리오명</span>
          <strong>피자 주문하기</strong>
        </p>
        <p>
          <span>훈련시간</span>
          <strong>2분 13초</strong>
        </p>
      </div>
    </div>
    <div className="app-report-timeline">
      <p className="text-label text-label-alternative">통화 타임라인</p>
      <img className="app-timeline-line" src={timeline} alt="" />
      {['1:31', '4:12', '5:13', '5:45'].map((time, index) => (
        <div className="app-report-entry" key={time}>
          <img src={dot} alt="" />
          <div>
            <p className="text-headline2">{time}</p>
            <div className="app-report-feedback">
              <div>
                <p className={index === 0 ? 'font-bold' : ''}>
                  {index === 0 ? '상대 입장을 잘 공감했어요.' : '감사 인사를 전하는 건 어떨까요?'}
                </p>
                <span>
                  <img src={index === 0 ? reportUp : reportDown} alt="" />
                </span>
              </div>
              {index === 0 && (
                <>
                  <div className="app-report-audio">
                    <span />
                    <img src={waveform} alt="" />
                    <small>0:04</small>
                    <div className="app-report-playhead">
                      <img src={playhead} alt="" />
                      <img src={marker} alt="" />
                      <img src={marker} alt="" />
                    </div>
                  </div>
                  <p>
                    상대의 상황을 먼저 인정하는 한마디로 대화 분위기를 부드럽게 만들었어요.
                    <br />
                    이런 공감 표현이 신뢰를 높입니다.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="app-report-fade" />
    <div className="app-report-save text-headline2 font-bold">저장하고 끝내기</div>
    <ScreenNavigation />
  </>
)

/** 스크린샷 대신 실제 레이아웃과 로컬 Figma 에셋으로 만든 앱 화면 목업입니다. */
export const AppScreen = ({
  variant,
  className = '',
  hintMode = 'advice',
  settings = { difficulty: 0, personality: 0 },
}: AppScreenProps) => (
  <div
    className={`app-device ${className}`}
    role="img"
    aria-label={`${screenLabels[variant]}${variant === 'call' ? ` ${callHintOptions.find((option) => option.id === hintMode)!.label} 미리보기.` : ''}`}
    data-app-screen={variant}
  >
    <div
      className={`app-screen app-screen-${variant}`}
      aria-hidden="true"
      data-figma-node={
        variant === 'call'
          ? '5932:8139'
          : variant === 'scenario'
            ? '5932:8231'
            : variant === 'settings'
              ? '3765:2869'
              : '5932:8425'
      }
    >
      <ScreenStatus />
      {variant === 'call' ? (
        <CallScreen hintMode={hintMode} />
      ) : variant === 'scenario' ? (
        <ScenarioScreen />
      ) : variant === 'settings' ? (
        <>
          <AppSettingsScreen {...settings} />
          <ScreenNavigation />
        </>
      ) : (
        <ReportScreen />
      )}
      <div className="app-home-indicator" />
    </div>
  </div>
)
