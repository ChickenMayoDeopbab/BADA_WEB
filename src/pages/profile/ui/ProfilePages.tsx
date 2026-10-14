import { ProfileSkeleton } from './ProfileSkeleton'
import { useDialogFocus } from '@shared/lib'
import defaultRingtone from '@shared/assets/scenario-training/ringtone-default.mp3'
import defaultProfileLarge from '@shared/assets/profile/default-profile-large.svg'
import { ProfileBackLink } from './ProfileBackLink'
import { ProfileImageConsentDialog } from './ProfileImageConsentDialog'
import { useProfileImageConsent } from '../model/useProfileImageConsent'
import defaultProfileSummary from '@shared/assets/profile/default-profile-summary.svg'
import { clearAuthSession, LogoutButton } from '@features/auth'
import { getApiErrorMessage } from '@shared/api'
import { routePaths } from '@shared/config'
import {
  LoadingRegion,
  Skeleton,
  ListSkeleton,
  StatusState,
  LoadingSpinner,
  ServicePageContent,
} from '@shared/ui'
import {
  useCheckUsername,
  useMyPage,
  useNotificationSettings,
  useProfileImage,
  useRecentTrainings,
  useUpdateMyPage,
  useUpdateNotificationSettings,
  useUploadProfileImage,
  useWithdrawAccount,
} from '../model/useProfile'
import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { FiChevronRight, FiPlay } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

const EMPTY_VALUE = '-'

interface PageFrameProps {
  title: string
  description: string
  showBack?: boolean
  action?: ReactNode
  children: ReactNode
}

const PageFrame = ({ title, description, children, showBack = false, action }: PageFrameProps) => (
  <ServicePageContent className="pb-10">
    <header className="gap-3 mb-[18px] flex flex-wrap items-center">
      {showBack && <ProfileBackLink />}
      <h1 className="text-title1 font-bold text-label-normal">{title}</h1>
      <p className="text-body font-medium text-neutral-60">{description}</p>
      {action}
    </header>
    {children}
  </ServicePageContent>
)

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section
    className={`rounded-[18px] border border-line-alternative bg-common-0 shadow-subtle-card ${className}`}
  >
    {children}
  </section>
)

const PrimaryButton = ({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`h-12 px-6 rounded-component bg-primary-normal text-body font-bold text-common-0 transition-opacity hover:opacity-90 ${className}`}
    {...props}
  >
    {children}
  </button>
)

const SecondaryButton = ({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`h-12 px-6 rounded-component border border-line-neutral bg-common-0 text-body font-bold text-label-normal hover:bg-fill-normal ${className}`}
    {...props}
  >
    {children}
  </button>
)

const quickSettings = [
  { title: '벨소리', value: EMPTY_VALUE, to: routePaths.profileRingtone },
  { title: '알림', value: EMPTY_VALUE, to: routePaths.profileNotifications },
  { title: '개인정보 관리', value: '약관 및 민감정보 동의', to: routePaths.profilePrivacy },
  { title: '차단 사용자 관리', value: '차단 목록 및 해제', to: routePaths.profileBlockedUsers },
]

const formatTrainingDate = (date: string, includeYear = true) => {
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return '-'

  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  return includeYear ? `${parsedDate.getFullYear()}.${month}.${day}` : `${month}.${day}`
}

interface AccountWithdrawalDialogProps {
  isOpen: boolean
  onClose: () => void
}

const AccountWithdrawalDialog = ({ isOpen, onClose }: AccountWithdrawalDialogProps) => {
  const navigate = useNavigate()
  const withdrawAccount = useWithdrawAccount()
  const [withdrawError, setWithdrawError] = useState('')

  const dialogRef = useDialogFocus(isOpen, onClose, withdrawAccount.isPending)

  if (!isOpen) return null

  const confirmWithdrawal = async () => {
    setWithdrawError('')

    try {
      await withdrawAccount.mutateAsync()
      clearAuthSession()
      navigate(routePaths.login, { replace: true })
    } catch (error) {
      setWithdrawError(
        getApiErrorMessage(error, '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.'),
      )
    }
  }

  return (
    <div
      className="inset-0 fixed z-50 flex items-center justify-center bg-common-100/30"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !withdrawAccount.isPending) onClose()
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="ux-overlay p-10 max-sm:p-6 w-[500px] max-w-[calc(100%-32px)] rounded-card bg-common-0 shadow-[0_14px_36px_rgba(0,0,0,0.16)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-dialog-title"
        aria-describedby="withdraw-dialog-description"
      >
        <h2
          id="withdraw-dialog-title"
          className="text-center text-headline1 font-bold text-label-normal"
        >
          정말 회원 탈퇴할까요?
        </h2>
        <p
          id="withdraw-dialog-description"
          className="mt-6 text-center text-body text-label-normal"
        >
          탈퇴하면 프로필과 훈련 기록이 삭제되며
          <br />
          복구할 수 없습니다.
        </p>
        <p className="mt-7 rounded-[10px] bg-red-90/20 py-[17px] text-center text-[13px] font-bold text-status-error">
          삭제 후에는 계정을 복구할 수 없습니다.
        </p>
        {withdrawError && (
          <p className="mt-3 text-center text-caption text-status-error" role="alert">
            {withdrawError}
          </p>
        )}
        <div className="gap-5 mt-7 flex">
          <button
            className="h-[52px] flex-1 rounded-component bg-fill-normal text-body font-bold text-label-normal disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={withdrawAccount.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="h-[52px] flex-1 rounded-component bg-status-error text-body font-bold text-common-0 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={withdrawAccount.isPending}
            onClick={() => void confirmWithdrawal()}
          >
            {withdrawAccount.isPending ? '탈퇴 중' : '회원 탈퇴'}
          </button>
        </div>
      </section>
    </div>
  )
}

export const ProfileOverviewPage = () => {
  const profileQuery = useMyPage()
  const trainingQuery = useRecentTrainings()
  const notificationQuery = useNotificationSettings()
  const profileData = profileQuery.data
  const recentTrainings = trainingQuery.data ?? []
  const profileImageQuery = useProfileImage(profileQuery.data?.s3Key)
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false)

  const mobileLogout = (
    <div className="md:hidden ml-auto">
      <LogoutButton />
    </div>
  )

  const summaryCards = [
    [
      '총 훈련 횟수',
      profileData?.trainCount == null ? EMPTY_VALUE : `${profileData.trainCount}회`,
      '누적 완료한 훈련',
    ],
    [
      '최근 훈련',
      recentTrainings[0] ? formatTrainingDate(recentTrainings[0].trainedAt, false) : EMPTY_VALUE,
      '마지막 훈련 날짜',
    ],
    ['콜포비아 레벨', profileData?.levelName || EMPTY_VALUE, '최근 자가진단 결과'],
  ]

  const quickSettingsWithApiState = quickSettings.map((item) =>
    item.title === '알림'
      ? {
          ...item,
          value: notificationQuery.data
            ? notificationQuery.data.trainingEnabled || notificationQuery.data.communityEnabled
              ? '주요 알림 켜짐'
              : '주요 알림 꺼짐'
            : EMPTY_VALUE,
        }
      : item,
  )

  if (profileQuery.isPending && !profileData)
    return (
      <PageFrame
        title="프로필"
        description="계정 정보와 서비스 설정을 관리하세요."
        action={mobileLogout}
      >
        <ProfileSkeleton />
      </PageFrame>
    )
  if (profileQuery.isError && !profileData)
    return (
      <PageFrame
        title="프로필"
        description="계정 정보와 서비스 설정을 관리하세요."
        action={mobileLogout}
      >
        <StatusState
          isError
          title="프로필 정보를 불러오지 못했어요."
          onRetry={() => void profileQuery.refetch()}
          isRetrying={profileQuery.isFetching}
        />
      </PageFrame>
    )

  return (
    <PageFrame
      title="프로필"
      description="계정 정보와 서비스 설정을 관리하세요."
      action={mobileLogout}
    >
      <div className="gap-4 max-sm:grid-cols-1 grid grid-cols-3">
        <Card className="gap-6 p-6 max-sm:gap-4 max-sm:p-4 max-sm:flex-wrap max-sm:col-span-1 col-span-3 flex items-center">
          <div className="size-20 flex shrink-0 items-center justify-center rounded-pill bg-fill-normal">
            <img
              className={
                profileImageQuery.data
                  ? 'size-full rounded-pill object-cover'
                  : 'size-[54px] rounded-pill'
              }
              src={profileImageQuery.data ?? defaultProfileSummary}
              alt={`${profileData?.name || EMPTY_VALUE} 프로필`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-title2 font-bold text-label-normal">
              {profileData?.name || EMPTY_VALUE}
            </h2>
            <p className="mt-1 text-[15px] font-medium text-label-alternative">
              {profileData?.username ? `@${profileData.username}` : EMPTY_VALUE}
            </p>
            <p className="mt-2 text-label break-all text-label-alternative">
              {profileData?.email || EMPTY_VALUE}
            </p>
          </div>
          <Link
            className="h-12 px-6 flex shrink-0 items-center justify-center rounded-component bg-primary-normal text-body font-bold text-common-0"
            to={routePaths.profileEdit}
          >
            프로필 수정
          </Link>
        </Card>

        {summaryCards.map(([label, value, note]) => (
          <Card className="h-32 p-6" key={label}>
            <div className="gap-2 flex items-center justify-between">
              <p className="text-label font-medium text-label-alternative">{label}</p>
              {label === '콜포비아 레벨' && (
                <Link
                  className="shrink-0 rounded-control text-caption font-bold text-primary-normal hover:underline"
                  to={routePaths.welcome}
                >
                  자가진단 다시 하기
                </Link>
              )}
            </div>
            <p className="mt-1 text-title2 font-bold text-label-normal">{value}</p>
            <p className="mt-1 text-[13px] text-label-alternative">{note}</p>
          </Card>
        ))}

        <Card className="p-5 max-sm:col-span-1 col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-headline1 font-bold text-label-normal">최근 훈련</h2>
              <p className="mt-1 text-label text-label-alternative">
                최근 진행한 훈련을 빠르게 확인하세요.
              </p>
            </div>
            <Link className="text-label font-bold text-primary-normal" to={routePaths.records}>
              전체 기록 보기
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {recentTrainings.map((training) => (
              <li key={training.recordId}>
                <Link
                  className="gap-3 px-4 py-3 max-sm:flex-wrap min-h-16 flex items-center rounded-component border border-line-alternative bg-background-normal transition-colors hover:border-line-neutral hover:bg-fill-normal"
                  to={`${routePaths.records}?recordId=${training.recordId}&trainedAt=${encodeURIComponent(training.trainedAt)}`}
                  aria-label={`${training.scenarioName} 기록 보기`}
                >
                  <span
                    className="size-10 flex shrink-0 items-center justify-center rounded-component bg-fill-normal text-headline2"
                    aria-hidden="true"
                  >
                    {training.thumbnailUrl ? (
                      <img
                        className="size-full rounded-component object-cover"
                        src={training.thumbnailUrl}
                        alt=""
                      />
                    ) : (
                      training.detail?.emoji
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-headline2 font-bold text-label-normal">
                    {training.scenarioName}
                  </span>
                  <span className="px-3 py-2 w-64 max-sm:order-last max-sm:w-full gap-2 grid shrink-0 grid-cols-[1fr_auto_1fr_auto_1fr] items-center rounded-control bg-fill-normal text-center text-caption text-label-alternative">
                    <span>{training.detail?.duration ?? '-'}</span>
                    <span className="h-3 w-px bg-line-neutral" aria-hidden="true" />
                    <span>피드백 {training.detail?.feedbackCount ?? '-'}개</span>
                    <span className="h-3 w-px bg-line-neutral" aria-hidden="true" />
                    <span>{formatTrainingDate(training.trainedAt)}</span>
                  </span>
                  <FiChevronRight className="shrink-0 text-label-normal" aria-hidden="true" />
                </Link>
              </li>
            ))}
            {trainingQuery.isPending && (
              <li>
                <ListSkeleton label="최근 훈련을 불러오는 중" />
              </li>
            )}
            {trainingQuery.isError && (
              <li>
                <StatusState
                  isError
                  title="최근 훈련을 불러오지 못했어요."
                  onRetry={() => void trainingQuery.refetch()}
                  isRetrying={trainingQuery.isFetching}
                />
              </li>
            )}
            {!trainingQuery.isPending && !trainingQuery.isError && recentTrainings.length === 0 && (
              <li className="py-10 flex items-center justify-center text-label text-label-alternative">
                최근 훈련 기록이 없습니다.
              </li>
            )}
          </ul>
        </Card>

        <Card className="gap-6 p-5 max-xl:flex-col max-xl:items-stretch max-sm:col-span-1 col-span-3 flex items-center">
          <div className="shrink-0">
            <h2 className="text-headline1 font-bold text-label-normal">빠른 설정</h2>
            <p className="mt-1 text-label whitespace-nowrap text-label-alternative">
              자주 사용하는 설정을 관리하세요.
            </p>
          </div>
          <div className="gap-3 min-w-0 max-lg:grid-cols-2 max-sm:grid-cols-1 grid flex-1 grid-cols-4">
            {quickSettingsWithApiState.map((item) => (
              <Link
                className="px-4 py-3 min-h-16 flex items-center justify-between rounded-component bg-fill-normal hover:bg-fill-pressed"
                key={item.title}
                to={item.to}
              >
                <span>
                  <span className="block text-[15px] font-bold text-label-normal">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-caption text-label-alternative">
                    {item.value}
                  </span>
                </span>
                <FiChevronRight className="text-label-alternative" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Card>
        <Card className="p-6 max-sm:col-span-1 gap-4 max-sm:flex-col max-sm:items-start col-span-3 flex items-center justify-between">
          <div>
            <h2 className="text-headline1 font-bold text-label-normal">계정 관리</h2>
            <p className="mt-1 text-label text-label-alternative">
              더 이상 Bada를 이용하지 않는다면 계정을 삭제할 수 있습니다.
            </p>
          </div>
          <button
            className="px-5 h-11 flex items-center justify-center rounded-component border border-status-error text-label font-bold text-status-error hover:bg-red-90/20"
            type="button"
            onClick={() => setIsWithdrawalDialogOpen(true)}
          >
            회원 탈퇴
          </button>
        </Card>
      </div>
      <AccountWithdrawalDialog
        isOpen={isWithdrawalDialogOpen}
        onClose={() => setIsWithdrawalDialogOpen(false)}
      />
    </PageFrame>
  )
}

interface FieldProps {
  label: string
  htmlFor: string
  description: string
  children: ReactNode
}

const Field = ({ label, htmlFor, description, children }: FieldProps) => (
  <div>
    <label htmlFor={htmlFor} className="block text-body font-bold text-label-normal">
      {label}
    </label>
    <div className="mt-2">{children}</div>
    <p className="mt-2 text-caption text-label-alternative">{description}</p>
  </div>
)

const inputClass =
  'h-12 min-w-0 w-full rounded-control border border-line-alternative bg-fill-field px-4 text-body text-label-normal outline-none focus:border-primary-normal'

export const ProfileEditPage = () => {
  const consent = useProfileImageConsent()
  const navigate = useNavigate()
  const inputId = useId()
  const uploadImage = useUploadProfileImage()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [useDefaultImage, setUseDefaultImage] = useState(false)
  const profileQuery = useMyPage()
  const profileImageQuery = useProfileImage(profileQuery.data?.s3Key)
  const updateProfile = useUpdateMyPage()
  const checkUsername = useCheckUsername()
  const [name, setName] = useState<string>()
  const [username, setUsername] = useState<string>()
  const [usernameMessage, setUsernameMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const profileData = profileQuery.data
  const displayedName = name ?? profileData?.name ?? EMPTY_VALUE
  const displayedUsername = username ?? profileData?.username ?? EMPTY_VALUE
  const displayedImage = useDefaultImage
    ? defaultProfileLarge
    : (preview ?? profileImageQuery.data ?? defaultProfileLarge)
  const hasPhoto = !useDefaultImage && Boolean(preview || profileImageQuery.data)

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setSubmitError('JPG 또는 PNG 형식의 5MB 이하 파일을 선택해 주세요.')
      return
    }
    setSubmitError('')
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setUseDefaultImage(false)
  }

  const handleUsernameCheck = async () => {
    if (!profileData) {
      setUsernameMessage('프로필 정보를 불러온 뒤 다시 시도해 주세요.')
      return
    }

    if (!displayedUsername.trim()) {
      setUsernameMessage('아이디를 입력해 주세요.')
      return
    }

    try {
      const available = await checkUsername.mutateAsync(displayedUsername.trim())
      setUsernameMessage(
        available ? '사용할 수 있는 아이디입니다.' : '이미 사용 중인 아이디입니다.',
      )
    } catch {
      setUsernameMessage('중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  const handleSubmit = async () => {
    if (consent.isChecking || uploadImage.isPending || updateProfile.isPending || !profileData)
      return
    setSubmitError('')
    try {
      if (selectedFile && !(await consent.ensureConsent())) return
      const uploaded = selectedFile ? await uploadImage.mutateAsync(selectedFile) : undefined
      await updateProfile.mutateAsync({
        name: displayedName.trim(),
        username: displayedUsername.trim(),
        s3Key: useDefaultImage ? '' : (uploaded?.s3Key ?? profileQuery.data?.s3Key),
      })
      navigate(routePaths.profile)
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, '프로필을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'),
      )
    }
  }

  if (profileQuery.isPending && !profileData)
    return (
      <PageFrame title="프로필 수정" description="계정에 표시되는 정보를 변경하세요.">
        <ProfileSkeleton isEditing />
      </PageFrame>
    )
  if (profileQuery.isError && !profileData)
    return (
      <PageFrame title="프로필 수정" description="계정에 표시되는 정보를 변경하세요.">
        <StatusState
          isError
          title="프로필 정보를 불러오지 못했어요."
          onRetry={() => void profileQuery.refetch()}
          isRetrying={profileQuery.isFetching}
        />
      </PageFrame>
    )

  return (
    <PageFrame title="프로필 수정" description="계정에 표시되는 정보를 변경하세요.">
      <Card className="max-lg:flex-col flex min-h-[720px] max-w-[1024px] overflow-hidden">
        <aside className="p-6 max-sm:p-4 max-lg:w-full max-lg:flex-row max-lg:justify-center gap-6 max-lg:gap-16 max-sm:gap-6 flex w-[300px] shrink-0 flex-col items-center bg-fill-normal">
          <div className="min-w-0 flex flex-col items-center">
            <div className="flex size-[92px] items-center justify-center rounded-pill bg-label-disabled">
              <img
                className={
                  hasPhoto ? 'size-full rounded-pill object-cover' : 'size-[54px] rounded-pill'
                }
                src={displayedImage}
                alt="현재 프로필"
              />
            </div>
            <p className="mt-4 max-w-full truncate text-headline1 font-bold text-label-normal">
              {displayedName}
            </p>
            <p className="mt-1 max-w-full truncate text-label font-medium text-label-alternative">
              @{displayedUsername}
            </p>
          </div>
          <div className="max-sm:w-40 flex w-[204px] shrink-0 flex-col items-center">
            <label
              className="h-12 max-sm:h-10 flex w-full cursor-pointer items-center justify-center rounded-component bg-primary-alternative text-label font-bold text-primary-normal"
              htmlFor={inputId}
            >
              프로필 사진 변경
            </label>
            <input
              id={inputId}
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg"
              onChange={choosePhoto}
            />
            <SecondaryButton
              className="mt-3 max-sm:h-10 max-sm:px-2 max-sm:text-label w-full"
              type="button"
              onClick={() => {
                setSelectedFile(null)
                setPreview(null)
                setUseDefaultImage(true)
                setSubmitError('')
              }}
            >
              기본 이미지로 변경
            </SecondaryButton>
            <p className="mt-3 text-caption text-label-alternative">JPG, PNG · 최대 5MB</p>
          </div>
        </aside>
        <form
          className="min-w-0 px-12 max-xl:px-6 max-sm:px-4 py-7 flex flex-1 flex-col"
          onSubmit={async (event) => {
            event.preventDefault()
            await handleSubmit()
          }}
        >
          <h2 className="text-[22px] font-bold text-label-normal">기본 정보</h2>
          <p className="mt-1 text-label text-label-alternative">
            계정에 표시되는 프로필 정보를 수정하세요.
          </p>
          <div className="mt-7 gap-x-6 gap-y-6 max-sm:grid-cols-1 grid grid-cols-2">
            <Field
              htmlFor={`${inputId}-name`}
              label="이름"
              description="서비스에 표시되는 이름입니다."
            >
              <input
                className={inputClass}
                id={`${inputId}-name`}
                autoComplete="name"
                disabled={uploadImage.isPending || updateProfile.isPending || consent.isChecking}
                value={displayedName}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field
              htmlFor={`${inputId}-username`}
              label="아이디"
              description="영문과 숫자를 사용할 수 있습니다."
            >
              <div className="gap-2 flex">
                <input
                  className={inputClass}
                  id={`${inputId}-username`}
                  autoComplete="username"
                  disabled={uploadImage.isPending || updateProfile.isPending || consent.isChecking}
                  value={displayedUsername}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    setUsernameMessage('')
                  }}
                />
                <PrimaryButton
                  className="w-28 px-3 shrink-0 whitespace-nowrap"
                  type="button"
                  disabled={
                    checkUsername.isPending || uploadImage.isPending || updateProfile.isPending
                  }
                  aria-busy={checkUsername.isPending}
                  onClick={handleUsernameCheck}
                >
                  {checkUsername.isPending ? '확인 중' : '중복 확인'}
                </PrimaryButton>
              </div>
              {usernameMessage && (
                <p className="mt-2 text-caption text-label-alternative" role="status">
                  {usernameMessage}
                </p>
              )}
            </Field>
            <div className="max-sm:col-span-1 col-span-2">
              <Field
                htmlFor={`${inputId}-email`}
                label="이메일"
                description="인증 및 알림에 사용되는 이메일입니다."
              >
                <input
                  id={`${inputId}-email`}
                  aria-label="이메일"
                  className={`${inputClass} cursor-not-allowed disabled:bg-fill-normal disabled:text-label-alternative`}
                  value={profileData?.email || EMPTY_VALUE}
                  disabled
                />
              </Field>
            </div>
            <div className="pt-6 max-sm:col-span-1 col-span-2 border-t border-line-alternative">
              <p className="text-body font-bold text-label-normal">비밀번호</p>
              <p className="mt-2 text-caption text-label-alternative">
                보안을 위해 주기적으로 비밀번호를 변경해 주세요.
              </p>
              <SecondaryButton
                className="mt-5 w-[220px]"
                type="button"
                onClick={() => navigate(routePaths.resetPassword)}
              >
                비밀번호 변경
              </SecondaryButton>
            </div>
          </div>
          {submitError && (
            <p className="mt-4 text-label text-status-error" role="alert">
              {submitError}
            </p>
          )}
          <div className="gap-3 mt-auto flex justify-end">
            <SecondaryButton type="button" onClick={() => navigate(routePaths.profile)}>
              취소
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              aria-busy={updateProfile.isPending || uploadImage.isPending || consent.isChecking}
              disabled={
                updateProfile.isPending ||
                uploadImage.isPending ||
                consent.isChecking ||
                !profileData ||
                !displayedName.trim() ||
                !displayedUsername.trim()
              }
            >
              {(updateProfile.isPending || uploadImage.isPending || consent.isChecking) && (
                <LoadingSpinner className="mr-2" />
              )}
              {updateProfile.isPending || uploadImage.isPending || consent.isChecking
                ? '저장 중'
                : '변경사항 저장'}
            </PrimaryButton>
          </div>
        </form>
      </Card>
      <ProfileImageConsentDialog consent={consent} />
    </PageFrame>
  )
}

interface SelectRowProps {
  className?: string
  selected: boolean
  title: string
  description: string
  onSelect: () => void
  action?: ReactNode
}

const SelectRow = ({
  className = '',
  selected,
  title,
  description,
  onSelect,
  action,
}: SelectRowProps) => (
  <div
    className={`flex items-center rounded-component ${selected ? 'bg-primary-alternative' : 'bg-fill-normal'}`}
  >
    <button
      className={`px-5 ux-accordion ease-out min-w-0 flex min-h-[82px] flex-1 items-center rounded-component text-left transition-colors motion-reduce:transition-none ${selected ? 'bg-primary-alternative hover:bg-primary-alternative/80' : 'bg-fill-normal hover:bg-fill-pressed'} ${className}`}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span
        className={`mr-5 size-5 ux-accordion ease-out flex items-center justify-center rounded-pill border-2 transition-colors motion-reduce:transition-none ${selected ? 'border-primary-normal' : 'border-line-normal'}`}
      >
        <span
          className={`size-2.5 ux-accordion ease-out rounded-pill bg-primary-normal transition-[opacity,scale] motion-reduce:transition-none ${selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body font-bold text-label-normal">{title}</span>
        <span className="mt-1 block text-[13px] text-label-alternative">{description}</span>
      </span>
      {!action && selected && (
        <span className="text-caption font-bold text-primary-normal">선택됨</span>
      )}
    </button>
    {action && <div className="pr-4 shrink-0">{action}</div>}
  </div>
)

export const ProfileRingtonePage = () => {
  const navigate = useNavigate()
  const [ringtone, setRingtone] = useState('기본 벨소리')
  const [playing, setPlaying] = useState(false)
  const previewRef = useRef<HTMLAudioElement>(null)
  const [previewError, setPreviewError] = useState('')
  const handlePreview = async () => {
    const audio = previewRef.current
    if (!audio) return
    setPreviewError('')
    if (!audio.paused) {
      audio.pause()
      setPlaying(false)
      return
    }
    try {
      await audio.play()
      setPlaying(true)
    } catch {
      setPreviewError('벨소리를 재생하지 못했어요. 다시 시도해 주세요.')
    }
  }

  const options = [
    ['기본 벨소리', '서비스에서 제공하는 기본 벨소리'],
    ['잔잔한 파도', '벨소리 선택 예시 · 저장 기능 준비 중'],
    ['맑은 알림음', '벨소리 선택 예시 · 저장 기능 준비 중'],
    ['무음', '벨소리를 재생하지 않음'],
  ]

  return (
    <PageFrame title="벨소리" description="통화 훈련에 사용할 벨소리를 선택하세요." showBack>
      <Card className="p-7 max-sm:p-4 relative min-h-[672px] max-w-[1024px] overflow-hidden">
        <h2 className="text-[22px] font-bold text-label-normal">벨소리 설정</h2>
        <p className="mt-1 text-label text-label-alternative">
          벨소리 선택을 미리 확인할 수 있어요. 저장과 추가 기능은 준비 중이에요.
        </p>
        <audio
          ref={previewRef}
          src={defaultRingtone}
          preload="none"
          onEnded={() => setPlaying(false)}
          onError={() => {
            setPlaying(false)
            setPreviewError('벨소리를 불러오지 못했어요. 다시 시도해 주세요.')
          }}
        />
        {previewError && (
          <p role="alert" className="mt-3 text-label text-status-error">
            {previewError}
          </p>
        )}
        <p className="mt-7 text-body font-bold text-label-normal">기본 벨소리</p>
        <div className="mt-3">
          <SelectRow
            className="min-h-[68px]"
            title={options[0][0]}
            description={options[0][1]}
            selected={ringtone === options[0][0]}
            onSelect={() => setRingtone(options[0][0])}
            action={
              <button
                type="button"
                aria-label={playing ? '기본 벨소리 정지' : '기본 벨소리 미리듣기'}
                aria-pressed={playing}
                className="gap-2 py-3 flex items-center text-caption font-bold text-primary-normal"
                onClick={() => void handlePreview()}
              >
                <FiPlay aria-hidden="true" />
                {playing ? '정지' : '미리듣기'}
              </button>
            }
          />
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-body font-bold text-label-normal">추가 벨소리</p>
          <PrimaryButton
            className="h-11 w-[192px] disabled:opacity-50"
            disabled
            title="벨소리 추가 기능을 준비하고 있어요."
          >
            ＋ 벨소리 추가
          </PrimaryButton>
        </div>
        <div className="mt-1 space-y-3">
          {options.slice(1).map(([title, description]) => (
            <SelectRow
              className="min-h-[68px]"
              key={title}
              title={title}
              description={description}
              selected={ringtone === title}
              onSelect={() => setRingtone(title)}
              action={<span className="text-caption text-label-alternative">준비 중</span>}
            />
          ))}
        </div>
        <div className="right-0 bottom-0 gap-3 pr-7 absolute flex h-[94px] w-full items-center justify-end bg-fill-normal">
          <SecondaryButton onClick={() => navigate(routePaths.profile)}>취소</SecondaryButton>
          <PrimaryButton
            disabled
            className="disabled:opacity-50"
            title="벨소리 저장 기능을 준비하고 있어요."
          >
            저장
          </PrimaryButton>
        </div>
      </Card>
    </PageFrame>
  )
}

const Toggle = ({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}) => (
  <button
    aria-label={label}
    aria-pressed={checked}
    aria-busy={disabled}
    className={`h-6 p-1 w-10 ux-toggle ease-out flex shrink-0 items-center rounded-pill transition-colors motion-reduce:transition-none ${checked ? 'bg-primary-normal' : 'bg-label-disabled'}`}
    type="button"
    disabled={disabled}
    onClick={onChange}
  >
    <span
      className={`size-4 ux-toggle rounded-pill bg-common-0 shadow-subtle-card transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${checked ? 'translate-x-4' : 'translate-x-0'}`}
    />
  </button>
)

export const ProfileNotificationsPage = () => {
  const notificationQuery = useNotificationSettings()
  const updateNotifications = useUpdateNotificationSettings()
  const [settingOverrides, setSettingOverrides] = useState<boolean[] | null>(null)
  const [updateError, setUpdateError] = useState('')
  const options = [
    ['훈련 알림', '예약된 훈련과 진행 상태를 알려드립니다.'],
    ['커뮤니티 알림', '댓글, 답글 등 커뮤니티 활동을 알려드립니다.'],
    ['전체 알림', '모든 알림을 관리합니다.'],
  ]

  const settings =
    settingOverrides ??
    (notificationQuery.data
      ? [
          notificationQuery.data.trainingEnabled,
          notificationQuery.data.communityEnabled,
          notificationQuery.data.allEnabled,
        ]
      : null)

  const toggleSetting = async (index: number) => {
    if (!settings || updateNotifications.isPending) return

    const previous = settings
    const next = settings.map((value, itemIndex) => (itemIndex === index ? !value : value))
    setSettingOverrides(next)
    setUpdateError('')

    try {
      await updateNotifications.mutateAsync({
        trainingEnabled: next[0],
        communityEnabled: next[1],
        allEnabled: next[2],
      })
      setSettingOverrides(null)
    } catch {
      setSettingOverrides(previous)
      setUpdateError('알림 설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <PageFrame title="알림 설정" description="받고 싶은 알림을 항목별로 관리하세요." showBack>
      <div className="space-y-3 max-w-[1024px]">
        {(notificationQuery.isError || updateError) && (
          <p className="text-label text-status-error" role="alert">
            {updateError || '알림 설정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'}
          </p>
        )}
        {notificationQuery.isError && (
          <StatusState
            isError
            title="알림 설정을 다시 불러와 주세요."
            onRetry={() => void notificationQuery.refetch()}
            isRetrying={notificationQuery.isFetching}
          />
        )}
        {[[2], [1, 0]].map((indices) => (
          <Card className="px-4" key={indices[0]}>
            {indices.map((index) => {
              const title = options[index][0]
              return (
                <div className="gap-4 min-h-14 flex items-center justify-between" key={title}>
                  <p className="text-body font-bold text-label-normal">{title}</p>
                  {settings?.[index] == null ? (
                    notificationQuery.isPending ? (
                      <LoadingRegion label={`${title} 설정을 불러오는 중`}>
                        <Skeleton className="h-6 w-10 rounded-pill" />
                      </LoadingRegion>
                    ) : (
                      <span className="text-label text-label-alternative">{EMPTY_VALUE}</span>
                    )
                  ) : (
                    <Toggle
                      checked={settings[index]}
                      disabled={updateNotifications.isPending}
                      label={`${title} ${settings[index] ? '끄기' : '켜기'}`}
                      onChange={() => void toggleSetting(index)}
                    />
                  )}
                </div>
              )
            })}
          </Card>
        ))}
      </div>
    </PageFrame>
  )
}

export const ProfileLanguagePage = () => {
  const [language, setLanguage] = useState('한국어')
  const languages = [
    ['한국어', '대한민국 · 한국어'],
    ['English', 'United States · English'],
    ['日本語', '日本 · 日本語'],
  ]

  return (
    <PageFrame title="언어 설정" description="Bada에서 사용할 표시 언어를 선택하세요.">
      <Card className="p-7 max-sm:p-4 min-h-[430px] max-w-[1024px]">
        <h2 className="text-[22px] font-bold text-label-normal">표시 언어</h2>
        <p className="mt-1 text-label text-label-alternative">
          언어 선택을 미리 확인할 수 있어요. 실제 표시 언어 변경 기능은 준비 중이에요.
        </p>
        <div className="mt-7 space-y-3">
          {languages.map(([title, description]) => (
            <SelectRow
              key={title}
              title={title}
              description={description}
              selected={language === title}
              onSelect={() => setLanguage(title)}
            />
          ))}
        </div>
      </Card>
    </PageFrame>
  )
}

export const ProfilePhotoPage = () => {
  const consent = useProfileImageConsent()
  const navigate = useNavigate()
  const inputId = useId()
  const profileQuery = useMyPage()
  const profileImageQuery = useProfileImage(profileQuery.data?.s3Key)
  const uploadImage = useUploadProfileImage()
  const updateProfile = useUpdateMyPage()
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [useDefaultImage, setUseDefaultImage] = useState(false)
  const [photoError, setPhotoError] = useState('')

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setPhotoError('JPG 또는 PNG 형식의 5MB 이하 파일을 선택해 주세요.')
      return
    }

    setPhotoError('')
    setSelectedFile(file)
    setUseDefaultImage(false)
    setPreview(URL.createObjectURL(file))
  }

  const selectDefaultImage = () => {
    setSelectedFile(null)
    setPreview(null)
    setUseDefaultImage(true)
    setPhotoError('')
  }

  const savePhoto = async () => {
    if (consent.isChecking || uploadImage.isPending || updateProfile.isPending) return
    if (!profileQuery.data) {
      setPhotoError('프로필 정보를 불러온 뒤 다시 시도해 주세요.')
      return
    }

    setPhotoError('')
    try {
      if (selectedFile && !(await consent.ensureConsent())) return
      const uploaded = selectedFile ? await uploadImage.mutateAsync(selectedFile) : undefined
      await updateProfile.mutateAsync({
        name: profileQuery.data.name,
        username: profileQuery.data.username,
        s3Key: useDefaultImage ? '' : (uploaded?.s3Key ?? profileQuery.data.s3Key),
      })
      navigate(routePaths.profile)
    } catch (error) {
      setPhotoError(
        getApiErrorMessage(error, '프로필 사진을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'),
      )
    }
  }

  const displayedImage = useDefaultImage
    ? defaultProfileLarge
    : (preview ?? profileImageQuery.data ?? defaultProfileLarge)

  return (
    <PageFrame title="프로필 사진 변경" description="기본 프로필 또는 새 사진을 선택하세요.">
      <Card className="p-8 gap-12 max-lg:flex-col max-sm:p-4 flex min-h-[680px] max-w-[1024px]">
        <div className="max-lg:w-full max-lg:pb-8 flex w-[420px] shrink-0 flex-col items-center rounded-[16px] bg-fill-normal pt-[58px]">
          <div className="flex size-[156px] items-center justify-center overflow-hidden rounded-pill bg-label-disabled">
            <img
              className={
                preview || profileImageQuery.data ? 'size-full object-cover' : 'size-[104px]'
              }
              src={displayedImage}
              alt="선택한 프로필 미리보기"
            />
          </div>
          <h2 className="mt-8 text-headline1 font-bold text-label-normal">현재 프로필 이미지</h2>
          <p className="mt-3 text-center text-label text-label-alternative">
            미리보기는 실제 서비스에 표시되는
            <br />
            형태와 동일합니다.
          </p>
        </div>
        <div className="min-w-0 pt-4 flex flex-1 flex-col">
          <h2 className="text-[22px] font-bold text-label-normal">사진 업로드</h2>
          <p className="mt-1 text-label text-label-alternative">
            JPG 또는 PNG 파일을 선택하세요. 최대 5MB까지 지원합니다.
          </p>
          {photoError && (
            <p className="mt-4 text-label text-status-error" role="alert">
              {photoError}
            </p>
          )}
          <label
            className="mt-8 flex h-[196px] cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed border-line-alternative bg-fill-normal"
            htmlFor={inputId}
          >
            <span className="text-[17px] font-bold text-label-normal">
              파일을 끌어 놓거나 선택하세요.
            </span>
            <span className="mt-2 text-[13px] text-label-alternative">권장 크기 800 × 800px</span>
            <span className="mt-4 px-8 py-3 rounded-component bg-primary-normal text-body font-bold text-common-0">
              파일 선택
            </span>
          </label>
          <input
            id={inputId}
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg"
            onChange={choosePhoto}
          />
          <h3 className="mt-9 text-[17px] font-bold text-label-normal">기본 이미지</h3>
          <p className="mt-2 text-[13px] text-label-alternative">
            업로드한 사진 대신 기본 프로필 아이콘을 사용합니다.
          </p>
          <SecondaryButton className="mt-6 w-[220px]" onClick={selectDefaultImage}>
            기본 이미지로 변경
          </SecondaryButton>
          <div className="gap-3 mt-auto flex justify-end">
            <SecondaryButton onClick={() => navigate(routePaths.profile)}>취소</SecondaryButton>
            <PrimaryButton
              disabled={uploadImage.isPending || updateProfile.isPending || consent.isChecking}
              onClick={() => void savePhoto()}
            >
              {uploadImage.isPending || updateProfile.isPending || consent.isChecking
                ? '저장 중'
                : '저장'}
            </PrimaryButton>
          </div>
        </div>
      </Card>
      <ProfileImageConsentDialog consent={consent} />
    </PageFrame>
  )
}
