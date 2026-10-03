import defaultProfileLarge from '@shared/assets/profile/default-profile-large.svg'
import defaultProfileSummary from '@shared/assets/profile/default-profile-summary.svg'
import { routePaths } from '@shared/config'
import { type ButtonHTMLAttributes, type ChangeEvent, type ReactNode, useId, useState } from 'react'
import { FiChevronRight, FiPlay } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

const profile = {
  name: '변성우',
  username: 'b2ong222',
  email: 'bongchock45@gmail.com',
}

interface PageFrameProps {
  title: string
  description: string
  children: ReactNode
}

const PageFrame = ({ title, description, children }: PageFrameProps) => (
  <main className="px-16 py-10 min-w-[1152px] flex-1 bg-background-alternative">
    <header className="mb-8">
      <h1 className="text-title1 font-bold text-label-strong">{title}</h1>
      <p className="mt-1 text-body font-medium text-label-neutral">{description}</p>
    </header>
    {children}
  </main>
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
  { title: '벨소리', value: '기본 벨소리', to: routePaths.profileRingtone },
  { title: '알림', value: '주요 알림 켜짐', to: routePaths.profileNotifications },
  { title: '언어', value: '한국어', to: routePaths.profileLanguage },
  { title: '프로필 사진', value: '기본 이미지 사용 중', to: routePaths.profilePhoto },
]

const recentTrainings = [
  { title: '전화 응대 기본 훈련', meta: '2026.09.18 · 보통' },
  { title: '컴플레인 대응 훈련', meta: '2026.09.12 · 어려움' },
  { title: '예약 문의 응대', meta: '2026.09.05 · 쉬움' },
]

export const ProfileOverviewPage = () => (
  <PageFrame title="프로필" description="계정 정보와 서비스 설정을 관리하세요.">
    <div className="gap-4 grid max-w-[1024px] grid-cols-3">
      <Card className="h-44 relative col-span-3">
        <div className="top-12 size-20 absolute left-[47px] flex items-center justify-center rounded-pill bg-fill-normal">
          <img className="size-[54px]" src={defaultProfileSummary} alt="기본 프로필" />
        </div>
        <div className="absolute top-[34px] left-[167px] w-[350px]">
          <h2 className="text-title2 font-bold text-label-normal">{profile.name}</h2>
          <p className="mt-1 text-[15px] font-medium text-label-alternative">@{profile.username}</p>
          <p className="mt-2 text-label text-label-alternative">{profile.email}</p>
        </div>
        <Link
          className="h-12 absolute top-[63px] left-[807px] flex w-[184px] items-center justify-center rounded-component bg-primary-normal text-body font-bold text-common-0"
          to={routePaths.profileEdit}
        >
          프로필 수정
        </Link>
      </Card>

      {[
        ['총 훈련 횟수', '12회', '누적 완료한 훈련'],
        ['최근 훈련', '09.18', '마지막 훈련 날짜'],
        ['현재 단계', '기초 2', '진행 중인 단계'],
      ].map(([label, value, note]) => (
        <Card className="h-32 p-6" key={label}>
          <p className="text-label font-medium text-label-alternative">{label}</p>
          <p className="mt-1 text-title2 font-bold text-label-normal">{value}</p>
          <p className="mt-1 text-[13px] text-label-alternative">{note}</p>
        </Card>
      ))}

      <Card className="p-6 col-span-2 h-[456px]">
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
        <ul className="mt-6 space-y-3">
          {recentTrainings.map((training) => (
            <li
              className="px-5 flex h-[92px] items-center justify-between rounded-component bg-fill-normal"
              key={training.title}
            >
              <div>
                <p className="text-body font-bold text-label-normal">{training.title}</p>
                <p className="mt-2 text-[13px] text-label-alternative">{training.meta}</p>
              </div>
              <span className="gap-3 flex items-center">
                <span className="h-8 w-28 flex items-center justify-center rounded-pill bg-primary-alternative text-[13px] font-bold text-primary-normal">
                  완료
                </span>
                <FiChevronRight className="text-label-alternative" aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5 h-[456px]">
        <h2 className="text-headline1 font-bold text-label-normal">빠른 설정</h2>
        <p className="mt-1 text-[13px] text-label-alternative">자주 사용하는 설정을 관리하세요.</p>
        <div className="mt-7 space-y-2">
          {quickSettings.map((item) => (
            <Link
              className="px-4 flex h-[68px] items-center justify-between rounded-component bg-fill-normal hover:bg-fill-pressed"
              key={item.title}
              to={item.to}
            >
              <span>
                <span className="block text-[15px] font-bold text-label-normal">{item.title}</span>
                <span className="mt-1 block text-caption text-label-alternative">{item.value}</span>
              </span>
              <FiChevronRight className="text-label-alternative" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  </PageFrame>
)

interface FieldProps {
  label: string
  description: string
  children: ReactNode
}

const Field = ({ label, description, children }: FieldProps) => (
  <div>
    <label className="block text-body font-bold text-label-normal">{label}</label>
    <div className="mt-2">{children}</div>
    <p className="mt-2 text-caption text-label-alternative">{description}</p>
  </div>
)

const inputClass =
  'h-12 min-w-0 w-full rounded-control border border-line-alternative bg-fill-field px-4 text-body text-label-normal outline-none focus:border-primary-normal'

export const ProfileEditPage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState(profile.name)
  const [username, setUsername] = useState(profile.username)

  return (
    <PageFrame title="프로필 수정" description="계정에 표시되는 정보를 변경하세요.">
      <Card className="flex min-h-[720px] max-w-[1024px] overflow-hidden">
        <aside className="pt-10 flex w-[300px] shrink-0 flex-col items-center bg-fill-normal">
          <div className="flex size-[92px] items-center justify-center rounded-pill bg-label-disabled">
            <img className="size-[54px]" src={defaultProfileLarge} alt="현재 프로필" />
          </div>
          <p className="mt-6 text-[22px] font-bold text-label-normal">{name || profile.name}</p>
          <p className="mt-1 text-label font-medium text-label-alternative">
            @{username || profile.username}
          </p>
          <Link
            className="mt-8 h-12 flex w-[204px] items-center justify-center rounded-component bg-primary-alternative text-body font-bold text-primary-normal"
            to={routePaths.profilePhoto}
          >
            프로필 사진 변경
          </Link>
          <p className="mt-6 w-[204px] text-center text-caption text-label-alternative">
            프로필 이미지와 기본 정보를
            <br />한 곳에서 관리할 수 있어요.
          </p>
        </aside>
        <form
          className="min-w-0 px-12 py-7 flex flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            navigate(routePaths.profile)
          }}
        >
          <h2 className="text-[22px] font-bold text-label-normal">기본 정보</h2>
          <p className="mt-1 text-label text-label-alternative">
            계정에 표시되는 프로필 정보를 수정하세요.
          </p>
          <div className="mt-7 gap-x-6 gap-y-6 grid grid-cols-2">
            <Field label="이름" description="서비스에 표시되는 이름입니다.">
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field label="아이디" description="영문과 숫자를 사용할 수 있습니다.">
              <div className="gap-2 flex">
                <input
                  className={inputClass}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <PrimaryButton className="w-28 px-3 shrink-0 whitespace-nowrap" type="button">
                  중복 확인
                </PrimaryButton>
              </div>
            </Field>
            <div className="col-span-2">
              <Field label="이메일" description="인증 및 알림에 사용되는 이메일입니다.">
                <input className={inputClass} value={profile.email} readOnly />
              </Field>
            </div>
            <div className="pt-6 col-span-2 border-t border-line-alternative">
              <p className="text-body font-bold text-label-normal">비밀번호</p>
              <p className="mt-2 text-caption text-label-alternative">
                보안을 위해 주기적으로 비밀번호를 변경해 주세요.
              </p>
              <SecondaryButton className="mt-5 w-[220px]" type="button">
                비밀번호 변경
              </SecondaryButton>
            </div>
          </div>
          <div className="gap-3 mt-auto flex justify-end">
            <SecondaryButton type="button" onClick={() => navigate(routePaths.profile)}>
              취소
            </SecondaryButton>
            <PrimaryButton type="submit">변경사항 저장</PrimaryButton>
          </div>
        </form>
      </Card>
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
  <button
    className={`px-5 flex min-h-[82px] w-full items-center rounded-component text-left ${selected ? 'bg-primary-alternative' : 'bg-fill-normal'} ${className}`}
    type="button"
    onClick={onSelect}
  >
    <span
      className={`mr-5 size-5 flex items-center justify-center rounded-pill border-2 ${selected ? 'border-primary-normal' : 'border-line-normal'}`}
    >
      {selected && <span className="size-2.5 rounded-pill bg-primary-normal" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-body font-bold text-label-normal">{title}</span>
      <span className="mt-1 block text-[13px] text-label-alternative">{description}</span>
    </span>
    {action ??
      (selected && <span className="text-[13px] font-bold text-primary-normal">사용 중</span>)}
  </button>
)

export const ProfileRingtonePage = () => {
  const navigate = useNavigate()
  const [ringtone, setRingtone] = useState('기본 벨소리')
  const [playing, setPlaying] = useState(false)

  const options = [
    ['기본 벨소리', '서비스에서 제공하는 기본 벨소리'],
    ['잔잔한 파도', '직접 추가한 벨소리'],
    ['맑은 알림음', '직접 추가한 벨소리'],
    ['무음', '벨소리를 재생하지 않음'],
  ]

  return (
    <PageFrame title="벨소리" description="통화 훈련에 사용할 벨소리를 선택하세요.">
      <Card className="p-7 relative min-h-[672px] max-w-[1024px] overflow-hidden">
        <h2 className="text-[22px] font-bold text-label-normal">벨소리 설정</h2>
        <p className="mt-1 text-label text-label-alternative">
          훈련 중 사용할 벨소리를 선택하거나 직접 추가하세요.
        </p>
        <p className="mt-7 text-body font-bold text-label-normal">기본 벨소리</p>
        <div className="mt-3">
          <SelectRow
            className="min-h-[68px]"
            title={options[0][0]}
            description={options[0][1]}
            selected={ringtone === options[0][0]}
            onSelect={() => setRingtone(options[0][0])}
            action={
              <span
                className="gap-2 flex items-center text-[13px] font-bold text-primary-normal"
                onClick={(event) => {
                  event.stopPropagation()
                  setPlaying((value) => !value)
                }}
              >
                <FiPlay aria-hidden="true" /> {playing ? '정지' : '미리듣기'}
              </span>
            }
          />
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-body font-bold text-label-normal">추가 벨소리</p>
          <PrimaryButton className="h-11 w-[192px]">＋ 벨소리 추가</PrimaryButton>
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
              action={
                <span className="text-[13px] font-medium text-label-alternative">미리듣기</span>
              }
            />
          ))}
        </div>
        <div className="right-0 bottom-0 gap-3 pr-7 absolute flex h-[94px] w-full items-center justify-end bg-fill-normal">
          <SecondaryButton onClick={() => navigate(routePaths.profile)}>취소</SecondaryButton>
          <PrimaryButton onClick={() => navigate(routePaths.profile)}>저장</PrimaryButton>
        </div>
      </Card>
    </PageFrame>
  )
}

const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) => (
  <button
    aria-label={label}
    aria-pressed={checked}
    className={`h-8 p-1 flex w-[52px] shrink-0 items-center rounded-pill transition-colors ${checked ? 'justify-end bg-primary-normal' : 'justify-start bg-label-disabled'}`}
    type="button"
    onClick={onChange}
  >
    <span className="size-6 rounded-pill bg-common-0 shadow-subtle-card" />
  </button>
)

export const ProfileNotificationsPage = () => {
  const [settings, setSettings] = useState([true, true, true, false])
  const options = [
    ['훈련 알림', '예약된 훈련과 진행 상태를 알려드립니다.'],
    ['커뮤니티 활동', '댓글, 답글 등 커뮤니티 활동을 알려드립니다.'],
    ['서비스 공지', '서비스 업데이트와 중요 공지를 알려드립니다.'],
    ['마케팅 정보', '이벤트와 프로모션 정보를 받아봅니다.'],
  ]

  return (
    <PageFrame title="알림 설정" description="받고 싶은 알림을 항목별로 관리하세요.">
      <Card className="p-7 min-h-[620px] max-w-[1024px]">
        <h2 className="text-[22px] font-bold text-label-normal">알림 설정</h2>
        <p className="mt-1 text-label text-label-alternative">
          필요한 알림만 선택해서 받을 수 있습니다.
        </p>
        <div className="mt-7 space-y-3">
          {options.map(([title, description], index) => (
            <div
              className="px-5 flex h-[78px] items-center rounded-component bg-fill-normal"
              key={title}
            >
              <div className="min-w-0 flex-1">
                <p className="text-body font-bold text-label-normal">{title}</p>
                <p className="mt-1 text-[13px] text-label-alternative">{description}</p>
              </div>
              <Toggle
                checked={settings[index]}
                label={`${title} ${settings[index] ? '끄기' : '켜기'}`}
                onChange={() =>
                  setSettings((values) =>
                    values.map((value, itemIndex) => (itemIndex === index ? !value : value)),
                  )
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-7 p-5 rounded-component bg-primary-alternative">
          <p className="text-label font-bold text-primary-normal">
            알림은 언제든 다시 변경할 수 있어요.
          </p>
          <p className="mt-2 text-caption text-label-alternative">
            중요한 계정 및 보안 알림은 설정과 관계없이 발송될 수 있습니다.
          </p>
        </div>
      </Card>
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
      <Card className="p-7 min-h-[430px] max-w-[1024px]">
        <h2 className="text-[22px] font-bold text-label-normal">표시 언어</h2>
        <p className="mt-1 text-label text-label-alternative">
          BADA 서비스에서 사용할 언어를 선택하세요.
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
  const navigate = useNavigate()
  const inputId = useId()
  const [preview, setPreview] = useState<string | null>(null)

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <PageFrame title="프로필 사진 변경" description="기본 프로필 또는 새 사진을 선택하세요.">
      <Card className="p-8 gap-12 flex min-h-[680px] max-w-[1024px]">
        <div className="flex w-[420px] shrink-0 flex-col items-center rounded-[16px] bg-fill-normal pt-[58px]">
          <div className="flex size-[156px] items-center justify-center overflow-hidden rounded-pill bg-label-disabled">
            <img
              className={preview ? 'size-full object-cover' : 'size-[104px]'}
              src={preview ?? defaultProfileLarge}
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
          <SecondaryButton className="mt-6 w-[220px]" onClick={() => setPreview(null)}>
            기본 이미지로 변경
          </SecondaryButton>
          <div className="gap-3 mt-auto flex justify-end">
            <SecondaryButton onClick={() => navigate(routePaths.profile)}>취소</SecondaryButton>
            <PrimaryButton onClick={() => navigate(routePaths.profile)}>저장</PrimaryButton>
          </div>
        </div>
      </Card>
    </PageFrame>
  )
}
