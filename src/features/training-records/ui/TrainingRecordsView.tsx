import {
  trainingPeriodOptions,
  type TrainingFeedback,
  type TrainingPeriod,
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
import timelineLine from '@shared/assets/training-records/timeline-line.svg'
import timelinePoint from '@shared/assets/training-records/timeline-point.svg'
import waveform from '@shared/assets/training-records/waveform.svg'
import { formatTrainingRecordDateRange } from '../model/formatTrainingRecordDateRange'
import { useDragScroll } from '../model/useDragScroll'
import { useTrainingRecordCalendar } from '../model/useTrainingRecordCalendar'
import { useTrainingRecords } from '../model/useTrainingRecords'
import { TrainingRecordCalendar } from './TrainingRecordCalendar'

interface RecordRowProps {
  record: TrainingRecord
  onOpen: (recordId: string) => void
}

// 목록에서 하나의 훈련 기록을 표시합니다.
const RecordRow = ({ record, onOpen }: RecordRowProps) => (
  <button
    type="button"
    className="px-5 flex h-[88px] w-full items-center rounded-component border border-line-alternative bg-background-normal text-left transition hover:border-line-neutral hover:shadow-subtle-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-normal"
    onClick={() => onOpen(record.id)}
    aria-label={`${record.title} 기록 상세 보기`}
  >
    <span className="flex items-center gap-[15px]">
      <span className="size-12 flex items-center justify-center rounded-component bg-fill-normal text-headline2">
        {record.emoji}
      </span>
      <span className="text-headline2 font-bold text-label-normal">{record.title}</span>
    </span>
    <span className="gap-5 px-4 py-2 ml-auto flex items-center rounded-control bg-fill-normal text-label text-label-alternative">
      <span>{record.duration}</span>
      <span className="h-4 w-px bg-line-neutral" aria-hidden="true" />
      <span>피드백 {record.feedbackCount}개</span>
      <span className="h-4 w-px bg-line-neutral" aria-hidden="true" />
      <span>{record.startedAt}</span>
    </span>
    <img className="ml-4" src={rowArrow} alt="" />
  </button>
)

interface RecordPaginationProps {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}

// 열 개 단위로 나뉜 훈련 기록 페이지를 이동합니다.
const RecordPagination = ({ currentPage, totalPages, onChange }: RecordPaginationProps) => (
  <nav className="gap-2 pt-2 flex items-center justify-center" aria-label="훈련 기록 페이지">
    <button
      type="button"
      className="h-9 px-3 rounded-control border border-line-alternative bg-background-normal text-label font-medium text-label-alternative transition-colors hover:bg-fill-normal disabled:cursor-not-allowed disabled:text-label-disabled"
      disabled={currentPage === 1}
      onClick={() => onChange(currentPage - 1)}
    >
      이전
    </button>
    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
      const isActive = page === currentPage

      return (
        <button
          key={page}
          type="button"
          className={`size-9 rounded-control text-label font-bold transition-colors ${
            isActive
              ? 'bg-primary-normal text-label-button-text'
              : 'bg-background-normal text-label-alternative hover:bg-fill-normal'
          }`}
          aria-current={isActive ? 'page' : undefined}
          onClick={() => onChange(page)}
        >
          {page}
        </button>
      )
    })}
    <button
      type="button"
      className="h-9 px-3 rounded-control border border-line-alternative bg-background-normal text-label font-medium text-label-alternative transition-colors hover:bg-fill-normal disabled:cursor-not-allowed disabled:text-label-disabled"
      disabled={currentPage === totalPages}
      onClick={() => onChange(currentPage + 1)}
    >
      다음
    </button>
  </nav>
)

interface AudioPreviewProps {
  isPlaying: boolean
  isEnabled?: boolean
  onToggle: () => void
}

// 선택한 피드백의 음성 미리보기 컨트롤을 표시합니다.
const AudioPreview = ({ isPlaying, isEnabled = true, onToggle }: AudioPreviewProps) => (
  <div className="py-3 relative flex w-full items-center justify-between overflow-hidden rounded-control bg-primary-alternative px-[13px]">
    <button
      type="button"
      onClick={onToggle}
      disabled={!isEnabled}
      className="size-9 relative z-10 flex shrink-0 items-center justify-center rounded-pill bg-primary-normal"
      aria-label={isPlaying ? '음성 미리보기 일시정지' : '음성 미리보기 재생'}
    >
      <span
        className={`size-3.5 bg-common-0 ${isPlaying ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
    </button>
    <div className="h-8 w-40 relative shrink-0">
      <img src={waveform} alt="음성 파형" />
    </div>
    <span className="text-label font-medium text-primary-normal">0:04</span>
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
      <p className="h-7 flex items-center text-headline2 font-medium text-label-neutral">
        {feedback.time}
      </p>
      <div className="px-3 py-4 overflow-hidden rounded-component bg-background-normal shadow-subtle-card">
        <button
          type="button"
          onClick={() => onToggle(feedback.id)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={isExpanded}
        >
          <span
            className={`text-body text-label-neutral ${isExpanded ? 'font-bold' : 'font-medium'}`}
          >
            {feedback.title}
          </span>
          <span className="h-3 w-6 flex items-center justify-center">
            <img
              className={`ease-out transition-transform duration-300 ${isExpanded ? 'rotate-90' : '-rotate-90'}`}
              src={isExpanded ? feedbackArrowOpen : feedbackArrow}
              alt=""
            />
          </span>
        </button>
        {feedback.description && (
          <div
            className={`ease-out grid transition-[grid-template-rows,opacity,margin] duration-300 motion-reduce:transition-none ${
              isExpanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
            }`}
            aria-hidden={!isExpanded}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-2">
                <AudioPreview
                  isPlaying={isAudioPlaying}
                  isEnabled={isExpanded}
                  onToggle={onToggleAudio}
                />
                <p className="text-body font-medium whitespace-pre-line text-label-neutral">
                  {feedback.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)

interface RecordDetailPanelProps {
  record: TrainingRecord
  isOpen: boolean
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
  isOpen,
  expandedFeedbackId,
  isMenuOpen,
  isAudioPlaying,
  onClose,
  onToggleFeedback,
  onToggleMenu,
  onDelete,
  onToggleAudio,
}: RecordDetailPanelProps) => {
  const { scrollRef, isDragging, dragScrollHandlers } = useDragScroll()

  return (
    <>
      <button
        type="button"
        className={`inset-0 fixed z-20 cursor-default bg-common-100/10 ${
          isOpen
            ? 'animate-[record-backdrop-enter_320ms_ease-out]'
            : 'animate-[record-backdrop-exit_260ms_ease-in] opacity-0'
        } motion-reduce:animate-none`}
        aria-label="훈련 기록 상세 닫기"
        onClick={onClose}
        disabled={!isOpen}
      />
      <aside
        className={`bottom-4 right-4 top-4 fixed z-30 w-[540px] max-w-[calc(100%-32px)] overflow-hidden rounded-dialog bg-background-normal p-[30px] shadow-elevated-card ${
          isOpen
            ? 'animate-[record-detail-enter_320ms_cubic-bezier(0.22,1,0.36,1)]'
            : 'pointer-events-none animate-[record-detail-exit_260ms_cubic-bezier(0.4,0,1,1)]'
        } motion-reduce:animate-none`}
        aria-label="훈련 기록 상세"
        aria-hidden={!isOpen}
      >
        <div className="gap-5 min-h-0 relative flex h-full flex-col">
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
              className="size-8 flex items-center justify-center rounded-control hover:bg-fill-normal"
              aria-label="기록 메뉴 열기"
              aria-expanded={isMenuOpen}
            >
              <img src={menuDots} alt="" />
            </button>
          </div>

          {isMenuOpen && (
            <div className="top-7 w-40 absolute right-[14px] z-20 overflow-hidden rounded-component bg-background-normal shadow-elevated-card">
              <button
                type="button"
                onClick={onDelete}
                className="p-3 flex h-[52px] w-full items-center text-left text-headline2 font-medium text-label-normal hover:bg-fill-normal"
              >
                기록 삭제하기
              </button>
            </div>
          )}

          <section className="p-5 flex h-[190px] shrink-0 items-start justify-between overflow-hidden rounded-component bg-linear-[52.82deg] from-record-summary-gradient-start to-record-summary-gradient-end text-common-0 shadow-elevated-card">
            <div className="py-2.5 flex h-full flex-col justify-between">
              <div>
                <p className="text-body font-medium text-common-0/60">시나리오명</p>
                <p className="text-title2 font-bold">{record.title}</p>
              </div>
              <div>
                <p className="text-body font-medium text-common-0/60">훈련시간</p>
                <p className="text-title2 font-bold">2분 13초</p>
              </div>
            </div>
            <div className="flex h-full flex-col items-end justify-center">
              <p className="text-body font-medium text-common-0/60">불안 점수</p>
              <p className="text-display1 font-bold">{record.anxietyScore}</p>
            </div>
          </section>

          <section className="p-5 min-h-0 relative flex flex-1 flex-col overflow-hidden rounded-component bg-fill-field">
            <p className="mb-2.5 text-label font-medium text-label-alternative">통화 타임라인</p>
            <div
              ref={scrollRef}
              className={`gap-4 min-h-0 -mr-3 pr-3 relative flex flex-1 flex-col overflow-y-auto overscroll-contain select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              {...dragScrollHandlers}
            >
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
    </>
  )
}

// 훈련 기록 목록과 상세 패널을 포함한 화면 본문을 표시합니다.
export const TrainingRecordsView = () => {
  const {
    isCalendarOpen,
    visibleMonth,
    appliedRange,
    draftRange,
    handleOpenCalendar,
    handleCancelCalendar,
    handleSelectDate,
    handleApplyCalendar,
    handleApplyPeriodRange,
    handlePreviousMonth,
    handleNextMonth,
  } = useTrainingRecordCalendar()
  const {
    filteredRecords,
    paginatedRecords,
    period,
    searchQuery,
    currentPage,
    totalPages,
    selectedRecord,
    isDetailOpen,
    expandedFeedbackId,
    isMenuOpen,
    isAudioPlaying,
    handlePeriodChange,
    handleSearchQueryChange,
    handlePageChange,
    handleOpenRecord,
    handleCloseRecord,
    handleToggleFeedback,
    handleToggleMenu,
    handleDeleteRecord,
    handleToggleAudio,
  } = useTrainingRecords(appliedRange)

  // 기간 탭과 오늘 기준 날짜 범위를 함께 변경합니다.
  const handleSelectPeriod = (nextPeriod: TrainingPeriod) => {
    handlePeriodChange(nextPeriod)
    handleApplyPeriodRange(nextPeriod)
  }

  // 선택된 기간 탭의 인디케이터 위치를 계산합니다.
  const activePeriodIndex = trainingPeriodOptions.findIndex(
    (periodOption) => periodOption.id === period,
  )

  return (
    <main className="min-w-0 flex-1 overflow-hidden">
      <div className="ml-16 mt-9 flex w-[1024px] max-w-[calc(100%-96px)] flex-col gap-[18px]">
        <header className="gap-3 flex items-center">
          <h1 className="text-title1 font-bold text-label-normal">훈련 기록</h1>
          <p className="text-body font-medium text-neutral-60">
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
                  onClick={() => handleSelectPeriod(periodOption.id)}
                  className={`ease-out w-[42px] text-center text-title2 font-medium transition-colors duration-[420ms] motion-reduce:transition-none ${
                    isActive ? 'text-primary-normal' : 'text-neutral-70'
                  }`}
                >
                  {periodOption.label}
                </button>
              )
            })}
            <span
              className="bottom-0 left-0 h-0.5 ease-out pointer-events-none absolute w-[42px] bg-primary-normal transition-transform duration-[420ms] motion-reduce:transition-none"
              style={{ transform: `translateX(${activePeriodIndex * 57}px)` }}
              aria-hidden="true"
            />
          </div>

          <label className="h-12 px-2.5 flex w-[300px] items-center justify-between overflow-hidden rounded-component bg-fill-alternative">
            <span className="sr-only">훈련 기록 검색</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchQueryChange(event.target.value)}
              placeholder="제목 또는 설명으로 검색"
              className="min-w-0 flex-1 bg-transparent text-headline2 font-medium text-label-neutral outline-none placeholder:text-neutral-70"
            />
            <span className="size-10 flex shrink-0 items-center justify-center">
              <img src={searchIcon} alt="" />
            </span>
          </label>
        </div>

        <section className="px-7 flex h-[136px] items-center justify-between rounded-card border border-line-alternative bg-background-normal">
          <div className="gap-2 flex flex-col">
            <button
              type="button"
              className="gap-2 px-1 py-0.5 flex items-center rounded-control text-left transition-colors hover:bg-fill-normal"
              onClick={handleOpenCalendar}
              aria-haspopup="dialog"
              aria-expanded={isCalendarOpen}
            >
              <span className="size-4 flex items-center justify-center">
                <img src={calendarIcon} alt="" />
              </span>
              <span className="text-label text-label-alternative">
                {formatTrainingRecordDateRange(appliedRange)}
              </span>
              <img className="rotate-180" src={summaryArrow} alt="" />
            </button>
            <strong className="text-title1 font-bold text-primary-normal">10분 43초</strong>
          </div>
          <dl className="gap-14 flex whitespace-nowrap">
            <div className="space-y-1.5">
              <dt className="text-label text-label-alternative">훈련</dt>
              <dd className="text-title2 font-bold text-label-normal">
                {filteredRecords.length}회
              </dd>
            </div>
            <div className="space-y-1.5">
              <dt className="text-label text-label-alternative">피드백</dt>
              <dd className="text-title2 font-bold text-label-normal">13개</dd>
            </div>
            <div className="space-y-1.5">
              <dt className="text-label text-label-alternative">평균 시간</dt>
              <dd className="text-title2 font-bold text-label-normal">3분 34초</dd>
            </div>
          </dl>
        </section>

        <section className="gap-3 flex flex-col">
          <h2 className="text-title2 font-bold text-label-normal">최근 기록</h2>
          <p className="pl-3 text-body font-medium text-label-normal">
            {paginatedRecords[0]?.date ?? formatTrainingRecordDateRange(appliedRange)}
          </p>
          <div className="gap-2.5 flex flex-col">
            {paginatedRecords.map((record) => (
              <RecordRow key={record.id} record={record} onOpen={handleOpenRecord} />
            ))}
            {filteredRecords.length === 0 && (
              <div className="flex h-[88px] items-center justify-center rounded-component border border-line-alternative bg-background-normal text-body text-neutral-60">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
          {filteredRecords.length > 0 && totalPages > 1 && (
            <RecordPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          )}
        </section>
      </div>

      <TrainingRecordCalendar
        isOpen={isCalendarOpen}
        visibleMonth={visibleMonth}
        range={draftRange}
        onCancel={handleCancelCalendar}
        onApply={handleApplyCalendar}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onSelectDate={(date) => handleSelectDate(date, period)}
      />

      {selectedRecord && (
        <RecordDetailPanel
          record={selectedRecord}
          isOpen={isDetailOpen}
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
