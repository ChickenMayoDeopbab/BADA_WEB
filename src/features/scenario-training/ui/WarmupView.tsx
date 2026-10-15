import { useTranslation } from '@shared/lib'
import { Link } from 'react-router-dom'
import type { ScenarioPersonality } from '@entities/scenario'
import { routePaths } from '@shared/config'
import { ConfirmDialog, PrimaryButton, ServicePageContent } from '@shared/ui'
import { useWarmup } from '../model/useWarmup'

/** 간단한 통화 조건으로 30초 워밍업을 시작합니다. */
export const WarmupView = () => {
  const { t } = useTranslation()

  const warmup = useWarmup()
  const inputClass =
    'w-full rounded-control border border-line-normal bg-fill-field p-3 text-body text-label-normal focus:border-primary-normal focus:outline-none'
  return (
    <ServicePageContent>
      <Link className="text-label text-label-alternative" to={routePaths.dashboard}>
        {t('대시보드로 돌아가기')}
      </Link>
      <h1 className="mt-5 text-title1 font-bold text-label-normal">{t('통화 전 워밍업')}</h1>
      <p className="mt-2 text-body text-label-alternative">
        {t('부담 없는 30초 통화로 몸을 풀어 보세요.')}
      </p>
      <form
        className="mt-6 max-w-2xl space-y-5 p-6 rounded-card bg-background-normal"
        onSubmit={(event) => {
          event.preventDefault()
          warmup.handleStart()
        }}
      >
        <label className="space-y-2 block text-label text-label-normal">
          <span>{t('통화 상대')}</span>
          <input
            className={inputClass}
            required
            minLength={2}
            maxLength={100}
            placeholder={t('예: 카페 직원')}
            disabled={warmup.isStarting}
            value={warmup.target}
            onChange={(event) => warmup.setTarget(event.target.value)}
          />
        </label>
        <label className="space-y-2 block text-label text-label-normal">
          <span>{t('통화 목적')}</span>
          <textarea
            className={`${inputClass} min-h-28`}
            required
            minLength={5}
            maxLength={200}
            placeholder={t('예: 카페 영업시간 물어보기')}
            disabled={warmup.isStarting}
            value={warmup.purpose}
            onChange={(event) => warmup.setPurpose(event.target.value)}
          />
        </label>
        <label className="space-y-2 block text-label text-label-normal">
          <span>{t('상대방의 성격')}</span>
          <select
            className={inputClass}
            disabled={warmup.isStarting}
            value={warmup.personality}
            onChange={(event) => warmup.setPersonality(event.target.value as ScenarioPersonality)}
          >
            <option value="KIND">{t('친절한')}</option>
            <option value="NORMAL">{t('보통')}</option>
            <option value="TOUGH">{t('무뚝뚝한')}</option>
            <option value="RUDE">{t('까칠한')}</option>
          </select>
        </label>
        {warmup.error && (
          <p role="alert" className="text-label text-status-error">
            {warmup.error}
          </p>
        )}
        <PrimaryButton type="submit" disabled={!warmup.canStart || warmup.isStarting}>
          {warmup.isStarting ? t('워밍업 준비 중') : t('30초 워밍업 시작')}
        </PrimaryButton>
      </form>
      {warmup.consent.isDialogOpen && (
        <ConfirmDialog
          title={t('민감정보 처리 동의가 필요해요')}
          description={t(
            '통화불안 진단 답변과 점수, 음성 분석 결과, 훈련 분석 및 피드백을 제공하기 위해 민감정보를 처리합니다. 동의하지 않아도 일반 서비스는 이용할 수 있어요.',
          )}
          confirmLabel={t('동의하기')}
          pending={warmup.consent.isSaving}
          error={warmup.consent.error}
          onClose={warmup.consent.handleDecline}
          onConfirm={() => void warmup.consent.handleAccept()}
        />
      )}
    </ServicePageContent>
  )
}
