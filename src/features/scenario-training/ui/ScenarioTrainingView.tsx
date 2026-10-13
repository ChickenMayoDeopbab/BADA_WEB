import { useScenarioCatalog, type ScenarioTab } from '../model/useScenarioCatalog'
import { useScenarioExampleAudio } from '../model/useScenarioExampleAudio'
import type { Scenario, ScenarioCategory } from '@entities/scenario'
import customBannerBulb from '@shared/assets/scenario-training/custom-banner-bulb.svg'
import customBannerChevron from '@shared/assets/scenario-training/custom-banner-chevron.svg'
import dailyImage from '@shared/assets/scenario-training/daily.png'
import otherImage from '@shared/assets/scenario-training/other.png'
import recommendationImage from '@shared/assets/scenario-training/recommendation.png'
import schoolImage from '@shared/assets/scenario-training/school.png'
import workImage from '@shared/assets/scenario-training/work.png'
import backArrow from '@shared/assets/training-records/back-arrow.svg'
import menuDots from '@shared/assets/training-records/menu-dots.svg'
import { routePaths } from '@shared/config'
import {
  IoChevronForward,
  IoHeadset,
  IoPause,
  IoPlay,
  IoRefresh,
  IoSearch,
  IoTimeOutline,
} from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'

const tabGap = 15

const tabs: Array<{ value: ScenarioTab; label: string; width: number }> = [
  { value: 'basic', label: '기본 제공', width: 92 },
  { value: 'custom', label: '커스텀', width: 66 },
  { value: 'shared', label: '공유됨', width: 66 },
]

const categories: Array<{ value: ScenarioCategory | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'work', label: '업무' },
  { value: 'daily', label: '일상' },
  { value: 'school', label: '학교' },
  { value: 'other', label: '기타' },
]

const fallbackImages: Record<ScenarioCategory, string> = {
  work: workImage,
  daily: dailyImage,
  school: schoolImage,
  other: otherImage,
}

/** 초 단위 시간을 분:초 표기로 변환합니다. */
const formatAudioDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.round(seconds))
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`
}

interface ScenarioImageProps {
  scenario: Scenario
  className?: string
}

/** 서버 이미지가 없을 때 카테고리별 Figma 이미지를 사용합니다. */
const ScenarioImage = ({ scenario, className = '' }: ScenarioImageProps) => (
  <img
    src={scenario.imageUrl ?? fallbackImages[scenario.category]}
    alt=""
    className={`h-full w-full object-cover ${className}`}
  />
)

interface ScenarioCardProps {
  scenario: Scenario
  onClick: () => void
}

/** 실제 API 시나리오 한 건을 목록 카드로 표시합니다. */
const ScenarioCard = ({ scenario, onClick }: ScenarioCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group min-w-0 p-4 hover:-translate-y-1 focus-visible:-translate-y-1 relative flex h-[220px] w-full items-end justify-between overflow-hidden rounded-control border border-line-alternative bg-fill-neutral text-left transition duration-200 hover:shadow-elevated-card focus-visible:outline-2 focus-visible:outline-primary-normal"
    aria-label={`${scenario.title} 상세 보기`}
  >
    <div className="inset-0 absolute">
      <ScenarioImage scenario={scenario} className="transition group-hover:scale-[1.02]" />
    </div>
    <span className="inset-x-0 bottom-0 absolute h-[106px] bg-gradient-to-b from-transparent to-common-100" />
    <div className="min-w-0 relative text-common-0">
      <h3 className="max-w-[145px] truncate text-headline1 font-bold">{scenario.title}</h3>
      <div className="mt-0.5 gap-1 flex items-center text-label font-medium">
        <IoTimeOutline size={17} aria-hidden="true" />
        <span>{scenario.practiceCount}회</span>
      </div>
    </div>
    <span className="size-10 backdrop-blur-sm relative flex items-center justify-center rounded-pill border border-common-0/30 bg-common-0/10 text-common-0">
      <IoChevronForward size={22} aria-hidden="true" />
    </span>
  </button>
)

interface ScenarioExampleAudioProps {
  audioUrl?: string
}

/** 훈련 기록과 같은 파형 UI로 시나리오 예시 음성만 재생합니다. */
const ScenarioExampleAudio = ({ audioUrl }: ScenarioExampleAudioProps) => {
  const {
    audioRef,
    isPlaying,
    duration,
    progress,
    waveformHeights,
    hasPlaybackError,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    handlePlaybackError,
    handleToggle,
  } = useScenarioExampleAudio(audioUrl)

  return (
    <div className="gap-3 px-3 flex h-[72px] w-full items-center overflow-hidden rounded-component bg-green-90">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handlePlaybackError}
      />
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={!audioUrl}
        className="size-12 flex shrink-0 items-center justify-center rounded-pill bg-green-40 text-common-0 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line-normal"
        aria-label={isPlaying ? '예시 음성 일시정지' : '예시 음성 재생'}
      >
        {isPlaying ? (
          <IoPause className="size-6" aria-hidden="true" />
        ) : (
          <IoPlay className="size-6 translate-x-px" aria-hidden="true" />
        )}
      </button>
      <div
        className="h-12 min-w-0 gap-0.5 flex flex-1 items-center justify-center overflow-hidden"
        role="img"
        aria-label="예시 음성 파형"
      >
        {waveformHeights.map((heightRatio, index) => {
          const barProgress = Math.min(1, Math.max(0, progress * waveformHeights.length - index))

          return (
            <span
              key={index}
              className="relative h-[var(--waveform-height)] w-[3px] shrink-0 overflow-hidden rounded-pill bg-line-normal"
              style={
                {
                  '--waveform-height': `${Math.round(heightRatio * 44)}px`,
                } as CSSProperties
              }
            >
              <span
                className="inset-y-0 left-0 absolute bg-green-40"
                style={{ width: `${barProgress * 100}%` }}
              />
            </span>
          )
        })}
      </div>
      <span className="shrink-0 text-body font-medium text-label-alternative tabular-nums">
        {!audioUrl ? '음성 없음' : hasPlaybackError ? '재생 실패' : formatAudioDuration(duration)}
      </span>
    </div>
  )
}

interface ScenarioDetailPanelProps {
  scenario: Scenario
  isOpen: boolean
  isMenuOpen: boolean
  example: ReturnType<typeof useScenarioCatalog>['example']
  isExampleLoading: boolean
  exampleErrorMessage: string
  onClose: () => void
  onStart: () => void
  onToggleMenu: () => void
  onOpenDeleteDialog: () => void
}

/** 기록 상세 보기와 같은 우측 슬라이드 패널로 시나리오 상세를 표시합니다. */
const ScenarioDetailPanel = ({
  scenario,
  isOpen,
  isMenuOpen,
  example,
  isExampleLoading,
  exampleErrorMessage,
  onClose,
  onStart,
  onToggleMenu,
  onOpenDeleteDialog,
}: ScenarioDetailPanelProps) => (
  <>
    <button
      type="button"
      className={`inset-0 fixed z-40 cursor-default bg-common-100/10 ${
        isOpen
          ? 'animate-[record-backdrop-enter_320ms_ease-out]'
          : 'animate-[record-backdrop-exit_260ms_ease-in] opacity-0'
      } motion-reduce:animate-none`}
      aria-label="시나리오 상세 닫기"
      onClick={onClose}
      disabled={!isOpen}
    />
    <aside
      role="dialog"
      aria-modal="true"
      aria-label={`${scenario.title} 상세`}
      aria-hidden={!isOpen}
      className={`bottom-4 right-4 top-4 fixed z-50 w-[540px] max-w-[calc(100%-32px)] overflow-hidden rounded-dialog bg-background-normal p-[30px] shadow-elevated-card ${
        isOpen
          ? 'animate-[record-detail-enter_320ms_cubic-bezier(0.22,1,0.36,1)]'
          : 'pointer-events-none animate-[record-detail-exit_260ms_cubic-bezier(0.4,0,1,1)]'
      } motion-reduce:animate-none`}
    >
      <div className="gap-5 min-h-0 relative flex h-full flex-col">
        <div className="h-10 flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-5 flex items-center justify-center"
            aria-label="시나리오 상세 닫기"
          >
            <img src={backArrow} alt="" />
          </button>
          {scenario.isCustom && !scenario.isCopied && (
            <button
              type="button"
              onClick={onToggleMenu}
              className="size-8 flex items-center justify-center rounded-control hover:bg-fill-normal"
              aria-label="시나리오 메뉴 열기"
              aria-expanded={isMenuOpen}
            >
              <img src={menuDots} alt="" />
            </button>
          )}
        </div>

        {isMenuOpen && (
          <div className="top-7 w-44 absolute right-[14px] z-20 overflow-hidden rounded-component bg-background-normal shadow-elevated-card">
            <button
              type="button"
              onClick={onOpenDeleteDialog}
              className="p-3 flex h-[52px] w-full items-center text-left text-headline2 font-medium text-label-normal hover:bg-fill-normal"
            >
              시나리오 삭제하기
            </button>
          </div>
        )}

        <div className="relative h-[260px] w-full shrink-0 overflow-hidden rounded-component bg-fill-neutral shadow-subtle-card">
          <ScenarioImage scenario={scenario} />
          <span className="inset-x-0 top-0 pointer-events-none absolute h-[104px] bg-gradient-to-b from-common-100/40 to-transparent" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="gap-3 flex flex-col">
            <section className="px-6 py-3">
              <p className="text-body font-medium text-label-alternative">
                {scenario.isCopied
                  ? '공유 시나리오'
                  : scenario.isCustom
                    ? '커스텀 시나리오'
                    : '기본 제공 시나리오'}
              </p>
              <h2 className="mt-0.5 text-title1 font-bold text-label-normal">{scenario.title}</h2>
              <div className="mt-1 gap-0.5 flex items-center text-headline2 font-medium text-label-alternative">
                <IoTimeOutline size={28} aria-hidden="true" />
                <span>{scenario.practiceCount}회</span>
              </div>
            </section>

            <section className="px-6">
              <p className="leading-7 text-body font-medium whitespace-pre-wrap text-label-neutral">
                {scenario.content}
              </p>
            </section>

            <section className="px-6 pb-5">
              <div className="mb-2 gap-1.5 flex items-center text-label font-bold text-primary-normal">
                <IoHeadset aria-hidden="true" />
                예시 음성
              </div>
              {isExampleLoading && (
                <p className="py-5 text-body text-label-alternative">불러오는 중...</p>
              )}
              {exampleErrorMessage && (
                <p className="py-5 text-body text-status-error">{exampleErrorMessage}</p>
              )}
              {!isExampleLoading && !exampleErrorMessage && (
                <ScenarioExampleAudio audioUrl={example?.audioUrl} />
              )}
            </section>
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onStart}
            className="flex h-[52px] w-full items-center justify-center rounded-component bg-primary-normal text-headline2 font-bold text-label-button-text transition hover:brightness-95"
          >
            훈련 시작하기
          </button>
        </div>
      </div>
    </aside>
  </>
)

interface ScenarioDeleteDialogProps {
  scenario: Scenario
  isDeleting: boolean
  errorMessage: string
  onClose: () => void
  onDelete: () => void
}

/** 커스텀 시나리오 삭제 전 복구 불가 안내와 확인 동작을 표시합니다. */
const ScenarioDeleteDialog = ({
  scenario,
  isDeleting,
  errorMessage,
  onClose,
  onDelete,
}: ScenarioDeleteDialogProps) => (
  <div
    className="inset-0 px-6 fixed z-[60] flex items-center justify-center bg-common-100/30"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}
  >
    <section
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="scenario-delete-title"
      aria-describedby="scenario-delete-description"
      className="p-7 w-full max-w-[420px] rounded-dialog bg-background-normal shadow-elevated-card"
    >
      <h2 id="scenario-delete-title" className="text-title2 font-bold text-label-normal">
        {scenario.title} 시나리오를 삭제할까요?
      </h2>
      <p id="scenario-delete-description" className="mt-2 text-body text-label-alternative">
        삭제한 커스텀 시나리오는 다시 복구할 수 없어요.
      </p>
      {errorMessage && <p className="mt-3 text-body text-status-error">{errorMessage}</p>}
      <div className="mt-6 gap-3 flex">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="h-12 flex flex-1 items-center justify-center rounded-component bg-fill-normal text-headline2 font-bold text-label-normal disabled:cursor-not-allowed disabled:text-label-disabled"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-12 flex flex-1 items-center justify-center rounded-component bg-status-error text-headline2 font-bold text-common-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </section>
  </div>
)

/** Figma 시나리오 훈련 목록과 상세 탐색 화면을 표시합니다. */
export const ScenarioTrainingView = () => {
  const navigate = useNavigate()
  const catalog = useScenarioCatalog()
  const activeTabIndex = tabs.findIndex((tab) => tab.value === catalog.selectedTab)
  const activeTab = tabs[activeTabIndex]
  const activeTabOffset = tabs
    .slice(0, activeTabIndex)
    .reduce((offset, tab) => offset + tab.width + tabGap, 0)

  /** 선택한 시나리오 설정 화면으로 이동합니다. */
  const handleStartScenario = (scenario: Scenario) => {
    navigate(`/training/${scenario.scenarioId}/settings`, { state: { scenario } })
  }

  return (
    <main className="min-w-0 px-10 pt-6 flex-1">
      <header className="gap-3 flex items-baseline">
        <h1 className="text-title1 font-bold text-label-neutral">시나리오 훈련</h1>
        <p className="text-body font-medium text-neutral-60">
          AI와 함께 실제와 같은 전화 통화를 연습해 보세요.
        </p>
      </header>

      <div className="mt-4 h-12 gap-6 flex items-center justify-between">
        <nav
          className="pb-2 relative flex items-center gap-[15px]"
          aria-label="시나리오 분류"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={catalog.selectedTab === tab.value}
              onClick={() => catalog.handleTabChange(tab.value)}
              className={`ease-out text-center text-title2 font-bold transition-colors duration-[420ms] motion-reduce:transition-none ${
                catalog.selectedTab === tab.value
                  ? 'text-primary-normal'
                  : 'text-neutral-70 hover:text-label-neutral'
              }`}
              style={{ width: tab.width }}
            >
              {tab.label}
            </button>
          ))}
          <span
            className="bottom-0 left-0 h-0.5 ease-out pointer-events-none absolute bg-primary-normal transition-[transform,width] duration-[420ms] motion-reduce:transition-none"
            style={{
              width: activeTab.width,
              transform: `translateX(${activeTabOffset}px)`,
            }}
            aria-hidden="true"
          />
        </nav>

        <label className="h-12 gap-2 px-4 flex w-[300px] items-center rounded-component bg-fill-alternative text-label-alternative focus-within:outline-2 focus-within:outline-primary-normal">
          <input
            type="search"
            value={catalog.searchQuery}
            onChange={(event) => catalog.setSearchQuery(event.target.value)}
            placeholder="제목 또는 설명으로 검색"
            className="min-w-0 flex-1 bg-transparent text-body text-label-normal outline-none placeholder:text-neutral-70"
          />
          <IoSearch size={22} aria-hidden="true" />
        </label>
      </div>

      <section className="mt-4 px-9 py-8 min-h-[calc(100vh-140px)] rounded-dialog bg-background-normal">
        {catalog.selectedTab === 'custom' && !catalog.searchQuery && (
          <button
            type="button"
            onClick={() => navigate(routePaths.trainingCustomNew)}
            className="group mb-7 px-7 py-6 hover:-translate-y-1 focus-visible:-translate-y-1 flex min-h-[100px] w-full items-center justify-between overflow-hidden rounded-component bg-gradient-to-r from-train-custom-banner-gradient-start to-train-custom-banner-gradient-end text-left transition duration-200 hover:shadow-elevated-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-normal"
          >
            <span className="gap-4 flex items-center">
              <img src={customBannerBulb} alt="" />
              <span className="gap-0.5 flex flex-col text-common-0">
                <strong className="text-headline1 font-bold">나만의 시나리오 만들기</strong>
                <span className="text-label font-medium">
                  내가 원하는 상황에서 전화를 훈련해 보세요!
                </span>
              </span>
            </span>
            <img
              src={customBannerChevron}
              alt=""
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </button>
        )}

        {catalog.selectedTab === 'basic' && catalog.recommendedScenario && !catalog.searchQuery && (
          <div className="mb-7">
            <p className="mb-1.5 text-body font-medium text-label-normal">이 시나리오 어때요?</p>
            <button
              type="button"
              onClick={() => {
                if (catalog.recommendedScenario)
                  catalog.handleOpenDetail(catalog.recommendedScenario)
              }}
              className="group p-4 hover:-translate-y-1 focus-visible:-translate-y-1 relative flex h-[200px] w-full items-end justify-between overflow-hidden rounded-component text-left shadow-elevated-card transition duration-200 focus-visible:outline-2 focus-visible:outline-primary-normal"
            >
              <img
                src={catalog.recommendedScenario.imageUrl ?? recommendationImage}
                alt=""
                className="inset-0 absolute size-full object-cover transition group-hover:scale-[1.01]"
              />
              <span className="inset-x-0 bottom-0 absolute h-[111px] bg-gradient-to-b from-transparent to-common-100" />
              <div className="relative text-common-0">
                <p className="text-caption">기본 제공 시나리오</p>
                <h2 className="text-headline1 font-bold">{catalog.recommendedScenario.title}</h2>
              </div>
              <span className="gap-2 px-2.5 backdrop-blur-sm relative flex h-[30px] items-center rounded-control border border-common-0/30 bg-common-0/10 text-body font-medium text-common-0">
                자세히 보기
                <IoChevronForward size={18} aria-hidden="true" />
              </span>
            </button>
          </div>
        )}

        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-title2 font-bold text-label-normal">시나리오</h2>
          {catalog.selectedTab === 'basic' && (
            <div className="gap-1 flex flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => catalog.setSelectedCategory(category.value)}
                  className={`px-3.5 h-[30px] rounded-control border text-body transition ${
                    catalog.selectedCategory === category.value
                      ? 'border-primary-normal bg-background-alternative font-medium text-primary-normal'
                      : 'border-transparent bg-background-alternative text-label-normal'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {catalog.isLoading ? (
          <div className="gap-3 flex min-h-[360px] flex-col items-center justify-center text-label-alternative">
            <span className="size-9 animate-spin rounded-pill border-4 border-fill-alternative border-t-primary-normal" />
            시나리오를 불러오는 중입니다.
          </div>
        ) : catalog.errorMessage ? (
          <div className="gap-4 flex min-h-[360px] flex-col items-center justify-center text-center">
            <p className="text-body text-label-alternative">{catalog.errorMessage}</p>
            <button
              type="button"
              onClick={() => catalog.refetch()}
              disabled={catalog.isRefreshing}
              className="gap-2 px-5 py-3 flex items-center rounded-component bg-secondary-normal text-body font-bold text-common-0 disabled:opacity-50"
            >
              <IoRefresh aria-hidden="true" />
              다시 불러오기
            </button>
          </div>
        ) : catalog.scenarios.length > 0 ||
          (catalog.selectedTab === 'custom' && !catalog.searchQuery) ? (
          <div className="gap-3 grid grid-cols-4 items-start">
            {catalog.scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.scenarioId}
                scenario={scenario}
                onClick={() => catalog.handleOpenDetail(scenario)}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="mb-4 size-16 flex items-center justify-center rounded-pill bg-fill-neutral text-label-alternative">
              <IoSearch size={28} aria-hidden="true" />
            </div>
            <h2 className="text-headline1 font-bold text-label-normal">
              표시할 시나리오가 없어요.
            </h2>
            <p className="mt-2 text-body text-label-alternative">
              검색어 또는 선택한 분류를 바꿔보세요.
            </p>
          </div>
        )}
      </section>

      {catalog.selectedScenario && (
        <ScenarioDetailPanel
          scenario={catalog.selectedScenario}
          isOpen={catalog.isDetailOpen}
          isMenuOpen={catalog.isDetailMenuOpen}
          example={catalog.example}
          isExampleLoading={catalog.isExampleLoading}
          exampleErrorMessage={catalog.exampleErrorMessage}
          onClose={catalog.handleCloseDetail}
          onStart={() => handleStartScenario(catalog.selectedScenario as Scenario)}
          onToggleMenu={catalog.handleToggleDetailMenu}
          onOpenDeleteDialog={() => catalog.handleOpenDeleteDialog()}
        />
      )}

      {catalog.deleteTarget && (
        <ScenarioDeleteDialog
          scenario={catalog.deleteTarget}
          isDeleting={catalog.isDeleting}
          errorMessage={catalog.deleteErrorMessage}
          onClose={catalog.handleCloseDeleteDialog}
          onDelete={catalog.handleDeleteScenario}
        />
      )}
    </main>
  )
}
