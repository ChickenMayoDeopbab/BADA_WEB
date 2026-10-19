import { LuAudioLines, LuCheck, LuPhone } from 'react-icons/lu'

/** 실제 통화와 구분되는 정적인 연습 화면 예시를 보여줍니다. */
export const TrainingPreview = () => (
  <figure className="m-0 p-4 sm:p-7 relative w-full rounded-dialog bg-fill-field">
    <figcaption className="mb-5 gap-3 flex items-center justify-between text-caption text-label-alternative">
      <span className="gap-2 flex items-center">
        <span className="size-2 rounded-pill bg-primary-normal" />
        BADA PRACTICE
      </span>
      <span>연습 화면 예시</span>
    </figcaption>
    <div className="p-5 sm:p-7 rounded-card bg-background-normal shadow-elevated-card">
      <div className="gap-3 pb-5 flex items-start justify-between border-b border-line-alternative">
        <div>
          <p className="text-caption text-label-alternative">오늘 연습할 상황</p>
          <p className="mt-2 text-headline2 font-bold text-label-normal">예약 전화하기</p>
        </div>
        <span className="px-3 py-1 rounded-pill bg-primary-alternative text-caption text-label-neutral">
          일상 대화
        </span>
      </div>
      <div className="py-7 flex flex-col items-center">
        <div className="size-20 flex items-center justify-center rounded-pill bg-primary-alternative text-label-normal">
          <LuPhone className="size-8" aria-hidden="true" />
        </div>
        <p className="mt-4 text-headline2 font-bold text-label-normal">나의 첫 번째 연습 전화</p>
        <p className="mt-2 text-label text-label-alternative">AI와 나의 속도에 맞춰, 천천히</p>
        <LuAudioLines className="mt-5 size-10 text-label-alternative" aria-hidden="true" />
      </div>
      <div className="space-y-3 text-label">
        <p className="mr-5 p-4 rounded-component bg-fill-field text-label-neutral">
          안녕하세요. 예약 도와드리겠습니다.
        </p>
        <p className="ml-5 p-4 rounded-component bg-primary-alternative text-label-normal">
          안녕하세요, 내일 오후에 예약하고 싶어요.
        </p>
      </div>
      <p className="mt-5 gap-2 flex items-center text-caption text-label-alternative">
        <LuCheck className="size-4 shrink-0" aria-hidden="true" />
        완벽한 문장이 아니어도 괜찮아요.
      </p>
    </div>
  </figure>
)
