import {
  trainingPeriodOptions,
  type TrainingFeedback,
  type TrainingRecord,
} from '@entities/training-record'
import audioMarker from '@shared/assets/training-records/audio-marker.svg'
import audioProgressLine from '@shared/assets/training-records/audio-progress-line.svg'
import backArrow from '@shared/assets/training-records/back-arrow.svg'
import calendarIcon from '@shared/assets/training-records/calendar.svg'
import feedbackArrow from '@shared/assets/training-records/feedback-arrow.svg'
import feedbackArrowOpen from '@shared/assets/training-records/feedback-arrow-open.svg'
import menuDots from '@shared/assets/training-records/menu-dots.svg'
import rowArrow from '@shared/assets/training-records/row-arrow.svg'
import searchIcon from '@shared/assets/training-records/search.svg'
import summaryArrow from '@shared/assets/training-records/summary-arrow.svg'
import tabLineActive from '@shared/assets/training-records/tab-line-active.svg'
import timelineLine from '@shared/assets/training-records/timeline-line.svg'
import timelinePoint from '@shared/assets/training-records/timeline-point.svg'
import waveform from '@shared/assets/training-records/waveform.svg'
import { useTrainingRecords } from '../model/useTrainingRecords'

interface RecordRowProps {
  record: TrainingRecord
  onOpen: (recordId: string) => void
}

// 목록에서 하나의 훈련 기록을 표시합니다.
const RecordRow = ({ record, onOpen }: RecordRowProps) => (
  <button
    type="button"
    className="px-5 hover:shadow-sm grid h-[88px] w-full grid-cols-[minmax(250px,1fr)_160px_160px_140px_10px] items-center rounded-[14px] border border-[#eaeaea] bg-[#fefefe] text-left transition hover:border-[#d8d8d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09c357]"
    onClick={() => onOpen(record.id)}
    aria-label={`${record.title} 기록 상세 보기`}
  >
    <span className="flex items-center gap-[15px]">
      <span className="size-12 rounded-xl text-lg flex items-center justify-center bg-[#f8f8f8]">
        {record.emoji}
      </span>
      <span className="text-lg font-bold tracking-[-0.36px] text-[#0d0d0e]">{record.title}</span>
    </span>
    <span className="text-sm tracking-[-0.28px] text-[#bdbebe]">{record.duration}</span>
    <span className="text-sm tracking-[-0.28px] text-[#bdbebe]">
      피드백 {record.feedbackCount}개
    </span>
    <span className="text-sm tracking-[-0.28px] text-[#bdbebe]">{record.startedAt}</span>
    <img src={rowArrow} alt="" />
  </button>
)

interface AudioPreviewProps {
  isPlaying: boolean
  onToggle: () => void
}

// 선택한 피드백의 음성 미리보기 컨트롤을 표시합니다.
const AudioPreview = ({ isPlaying, onToggle }: AudioPreviewProps) => (
  <div className="rounded-lg py-3 relative flex w-full items-center justify-between overflow-hidden bg-[#e6f7ed] px-[13px]">
    <button
      type="button"
      onClick={onToggle}
      className="size-9 relative z-10 flex shrink-0 items-center justify-center rounded-full bg-[#09c357]"
      aria-label={isPlaying ? '음성 미리보기 일시정지' : '음성 미리보기 재생'}
    >
      <span
        className={`size-3.5 bg-white rounded-[1px] ${isPlaying ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
    </button>
    <div className="h-8 w-40 relative shrink-0">
      <img src={waveform} alt="음성 파형" />
    </div>
    <span className="text-sm font-medium tracking-[-0.28px] text-[#09c357]">0:04</span>
    <div className={`top-0 absolute left-[162px] h-full w-px ${isPlaying ? 'animate-pulse' : ''}`}>
      <img className="top-0 absolute -left-[3px] max-w-none" src={audioMarker} alt="" />
      <img
        className="absolute -bottom-px -left-[3px] max-w-none rotate-180"
        src={audioMarker}
        alt=""
      />
      <img
        className="left-0 top-0 absolute max-w-none origin-top-left rotate-90"
        src={audioProgressLine}
        alt=""
      />
    </div>
  </div>
)

interface TimelineItemProps {
  feedback: TrainingFeedback
  isExpanded: boolean
  isAudioPlaying: boolean
  onToggle: (feedbackId: string) => void
  onToggleAudio: () => void
}

// 통화 타임라인의 피드백 항목을 표시합니다.
const TimelineItem = ({
  feedback,
  isExpanded,
  isAudioPlaying,
  onToggle,
  onToggleAudio,
}: TimelineItemProps) => (
  <div className="gap-1.5 relative z-10 flex w-full items-start">
    <img src={timelinePoint} alt="" />
    <div className="min-w-0 flex-1">
      <p className="h-7 text-lg flex items-center font-medium tracking-[-0.36px] text-[#3b3d3e]">
        {feedback.time}
      </p>
      <div
        className={`rounded-xl px-3 py-4 overflow-hidden bg-[#fefefe] shadow-[0_2px_5.3px_rgba(0,0,0,0.04)] ${
          isExpanded ? 'space-y-2' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => onToggle(feedback.id)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={isExpanded}
        >
          <span
            className={`text-base tracking-[-0.32px] text-[#3b3d3e] ${
              isExpanded ? 'font-bold' : 'font-medium'
            }`}
          >
            {feedback.title}
          </span>
          <span className="h-3 w-6 flex items-center justify-center">
            <img
              className={isExpanded ? 'rotate-90' : '-rotate-90'}
              src={isExpanded ? feedbackArrowOpen : feedbackArrow}
              alt=""
            />
          </span>
        </button>
        {isExpanded && feedback.description && (
          <>
            <AudioPreview isPlaying={isAudioPlaying} onToggle={onToggleAudio} />
            <p className="text-base leading-[1.3] font-medium tracking-[-0.32px] whitespace-pre-line text-[#3b3d3e]">
              {feedback.description}
            </p>
          </>
        )}
      </div>
    </div>
  </div>
)

interface RecordDetailPanelProps {
  record: TrainingRecord
  expandedFeedbackId: string | null
  isMenuOpen: boolean
  isAudioPlaying: boolean
  onClose: () => void
  onToggleFeedback: (feedbackId: string) => void
  onToggleMenu: () => void
  onDelete: () => void
  onToggleAudio: () => void
}

// 선택한 훈련 기록의 상세 정보와 피드백을 표시합니다.
const RecordDetailPanel = ({
  record,
  expandedFeedbackId,
  isMenuOpen,
  isAudioPlaying,
  onClose,
  onToggleFeedback,
  onToggleMenu,
  onDelete,
  onToggleAudio,
}: RecordDetailPanelProps) => (
  <aside
    className="bottom-0 top-0 bg-white fixed right-[7px] z-30 w-[540px] max-w-full overflow-y-auto p-[30px] shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
    aria-label="훈련 기록 상세"
  >
    <div className="gap-5 relative flex min-h-full flex-col">
      <div className="h-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-5 flex items-center justify-center"
          aria-label="훈련 기록 상세 닫기"
        >
          <img src={backArrow} alt="" />
        </button>
        <button
          type="button"
          onClick={onToggleMenu}
          className="size-8 rounded-md flex items-center justify-center hover:bg-[#f8f8f8]"
          aria-label="기록 메뉴 열기"
          aria-expanded={isMenuOpen}
        >
          <img src={menuDots} alt="" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="top-7 w-40 rounded-xl absolute right-[14px] z-20 overflow-hidden bg-[#fefefe] shadow-[0_0_4.3px_rgba(0,0,0,0.12)]">
          <button
            type="button"
            onClick={onDelete}
            className="p-3 text-lg flex h-[52px] w-full items-center text-left font-medium tracking-[-0.36px] text-[#0d0d0e] hover:bg-[#f8f8f8]"
          >
            기록 삭제하기
          </button>
        </div>
      )}

      <section className="rounded-xl p-5 text-white flex h-[190px] shrink-0 items-start justify-between overflow-hidden bg-[linear-gradient(52.82deg,#092ec3_0%,#44aab7_98.95%)] shadow-[0_2px_5.3px_rgba(0,0,0,0.12)]">
        <div className="py-2.5 flex h-full flex-col justify-between">
          <div>
            <p className="text-base text-white/60 font-medium tracking-[-0.32px]">시나리오명</p>
            <p className="text-2xl font-bold tracking-[-0.48px]">{record.title}</p>
          </div>
          <div>
            <p className="text-base text-white/60 font-medium tracking-[-0.32px]">훈련시간</p>
            <p className="text-2xl font-bold tracking-[-0.48px]">2분 13초</p>
          </div>
        </div>
        <div className="flex h-full flex-col items-end justify-center">
          <p className="text-base text-white/60 font-medium tracking-[-0.32px]">불안 점수</p>
          <p className="text-4xl font-bold tracking-[-0.72px]">{record.anxietyScore}</p>
        </div>
      </section>

      <section className="rounded-xl p-5 relative min-h-[404px] shrink-0 bg-[#f3f4f6]">
        <p className="mb-2.5 text-sm font-medium tracking-[-0.28px] text-[#5c5e5e]">
          통화 타임라인
        </p>
        <div className="gap-4 relative flex flex-col">
          <img
            className="absolute top-[35px] left-[13px] origin-top-left rotate-90"
            src={timelineLine}
            alt=""
          />
          {record.feedbacks.map((feedback) => (
            <TimelineItem
              key={feedback.id}
              feedback={feedback}
              isExpanded={expandedFeedbackId === feedback.id}
              isAudioPlaying={isAudioPlaying && expandedFeedbackId === feedback.id}
              onToggle={onToggleFeedback}
              onToggleAudio={onToggleAudio}
            />
          ))}
        </div>
      </section>
    </div>
  </aside>
)

// 훈련 기록 목록과 상세 패널을 포함한 화면 본문을 표시합니다.
export const TrainingRecordsView = () => {
  const {
    records,
    filteredRecords,
    period,
    searchQuery,
    selectedRecord,
    expandedFeedbackId,
    isMenuOpen,
    isAudioPlaying,
    setPeriod,
    setSearchQuery,
    handleOpenRecord,
    handleCloseRecord,
    handleToggleFeedback,
    handleToggleMenu,
    handleDeleteRecord,
    handleToggleAudio,
  } = useTrainingRecords()

  // 선택된 기간에 맞는 요약 정보와 탭 인디케이터 위치를 계산합니다.
  const selectedPeriod =
    trainingPeriodOptions.find((periodOption) => periodOption.id === period) ??
    trainingPeriodOptions[1]
  const activePeriodIndex = trainingPeriodOptions.findIndex(
    (periodOption) => periodOption.id === period,
  )

  return (
    <main className="min-w-0 flex-1 overflow-hidden">
      <div className="ml-16 mt-9 flex w-[1024px] max-w-[calc(100%-96px)] flex-col gap-[18px]">
        <header className="gap-3 flex items-center">
          <h1 className="text-[28px] leading-[1.3] font-bold tracking-[-0.56px] text-[#2f2f2f]">
            훈련 기록
          </h1>
          <p className="text-base font-medium tracking-[-0.32px] text-[#989898]">
            훈련 정보와 피드백을 다시 확인해 보세요.
          </p>
        </header>

        <div className="flex items-end justify-between">
          <div
            className="pb-2 relative flex items-center gap-[15px]"
            role="tablist"
            aria-label="훈련 기록 기간"
          >
            {trainingPeriodOptions.map((periodOption) => {
              const isActive = periodOption.id === period

              return (
                <button
                  key={periodOption.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setPeriod(periodOption.id)}
                  className={`text-2xl ease-out w-[42px] text-center font-medium tracking-[-0.48px] transition-colors duration-[420ms] motion-reduce:transition-none ${
                    isActive ? 'text-[#09c357]' : 'text-[#b2b2b2]'
                  }`}
                >
                  {periodOption.label}
                </button>
              )
            })}
            <img
              className="bottom-0 left-0 ease-out pointer-events-none absolute max-w-none transition-transform duration-[420ms] motion-reduce:transition-none"
              style={{ transform: `translateX(${activePeriodIndex * 57}px)` }}
              src={tabLineActive}
              alt=""
            />
          </div>

          <label className="h-12 rounded-xl px-2.5 flex w-[300px] items-center justify-between overflow-hidden bg-[#e5e6e7]">
            <span className="sr-only">훈련 기록 검색</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="제목 또는 설명으로 검색"
              className="min-w-0 text-lg flex-1 bg-transparent font-medium tracking-[-0.36px] text-[#3b3d3e] outline-none placeholder:text-[#b5b5b5]"
            />
            <span className="size-10 flex shrink-0 items-center justify-center">
              <img src={searchIcon} alt="" />
            </span>
          </label>
        </div>

        <section className="rounded-2xl px-7 flex h-[136px] items-center justify-between border border-[#eaeaea] bg-[#fefefe]">
          <div className="gap-2 flex flex-col">
            <div className="gap-2 flex items-center">
              <span className="size-4 flex items-center justify-center">
                <img src={calendarIcon} alt="" />
              </span>
              <span className="text-sm tracking-[-0.28px] text-[#5c5e5e]">
                {selectedPeriod.range}
              </span>
              <img className="rotate-180" src={summaryArrow} alt="" />
            </div>
            <strong className="leading-9 text-[28px] font-bold tracking-[-0.56px] text-[#09c357]">
              10분 43초
            </strong>
          </div>
          <dl className="gap-14 flex whitespace-nowrap">
            <div className="space-y-1.5">
              <dt className="text-sm tracking-[-0.28px] text-[#5c5e5e]">훈련</dt>
              <dd className="text-2xl font-bold tracking-[-0.48px] text-[#0d0d0e]">
                {records.length}회
              </dd>
            </div>
            <div className="space-y-1.5">
              <dt className="text-sm tracking-[-0.28px] text-[#5c5e5e]">피드백</dt>
              <dd className="text-2xl font-bold tracking-[-0.48px] text-[#0d0d0e]">13개</dd>
            </div>
            <div className="space-y-1.5">
              <dt className="text-sm tracking-[-0.28px] text-[#5c5e5e]">평균 시간</dt>
              <dd className="text-2xl font-bold tracking-[-0.48px] text-[#0d0d0e]">3분 34초</dd>
            </div>
          </dl>
        </section>

        <section className="gap-3 flex flex-col">
          <h2 className="text-2xl font-bold tracking-[-0.48px] text-[#0d0d0e]">최근 기록</h2>
          <p className="pl-3 text-base font-medium tracking-[-0.32px] text-[#0d0d0e]">8월 16일</p>
          <div className="gap-2.5 flex flex-col">
            {filteredRecords.map((record) => (
              <RecordRow key={record.id} record={record} onOpen={handleOpenRecord} />
            ))}
            {filteredRecords.length === 0 && (
              <div className="text-base flex h-[88px] items-center justify-center rounded-[14px] border border-[#eaeaea] bg-[#fefefe] text-[#989898]">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedRecord && (
        <RecordDetailPanel
          record={selectedRecord}
          expandedFeedbackId={expandedFeedbackId}
          isMenuOpen={isMenuOpen}
          isAudioPlaying={isAudioPlaying}
          onClose={handleCloseRecord}
          onToggleFeedback={handleToggleFeedback}
          onToggleMenu={handleToggleMenu}
          onDelete={handleDeleteRecord}
          onToggleAudio={handleToggleAudio}
        />
      )}
    </main>
  )
}
