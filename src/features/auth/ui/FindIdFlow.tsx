import { useFindId } from '../model/useFindId'
import { AuthButton } from './AuthButton'
import { AuthCard } from './AuthCard'
import { AuthLayout } from './AuthLayout'
import { EmailCodeFields } from './EmailCodeFields'

// 아이디 찾기 입력 화면과 성공·실패 결과 화면을 보여줍니다.
export const FindIdFlow = () => {
  const findId = useFindId()

  if (findId.status === 'success') {
    return (
      <AuthLayout>
        <AuthCard
          variant="plain"
          align="center"
          title="아이디 찾기"
          description="이메일 정보와 일치하는 아이디입니다."
          className="min-h-[480px]"
        >
          <p className="mt-3 text-center text-display2 font-bold break-all text-secondary-normal">
            {findId.foundUsername}
          </p>
          <div className="gap-4 mt-[50px] flex flex-col">
            <AuthButton label="로그인 하러가기" onClick={findId.goToLogin} />
            <AuthButton
              variant="secondary"
              label="비밀번호 재설정"
              onClick={findId.goToResetPassword}
            />
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (findId.status === 'fail') {
    return (
      <AuthLayout>
        <AuthCard
          variant="plain"
          align="center"
          title="아이디 찾기"
          description="이메일 정보와 일치하는 아이디를 찾을 수 없습니다."
          className="min-h-[450px]"
        >
          <p className="mt-2.5 text-center text-body text-label-alternative">
            입력한 이메일을 확인한 뒤 다시 시도해 주세요.
          </p>
          <div className="gap-4 mt-[56px] flex flex-col">
            <AuthButton label="다시 시도하기" onClick={findId.retry} />
            <AuthButton variant="secondary" label="로그인 하러가기" onClick={findId.goToLogin} />
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        variant="plain"
        title="아이디 찾기"
        description="가입할 때 사용한 이메일을 인증해 주세요."
        className="min-h-[630px]"
      >
        <form
          className="flex flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            void findId.submit()
          }}
          noValidate
        >
          <div className="gap-1.5 flex flex-col">
            <EmailCodeFields verification={findId.emailVerification} />
          </div>
          <div className="mt-8 gap-4 flex flex-col">
            <AuthButton
              type="submit"
              label="아이디 찾기"
              disabled={findId.isSearching || findId.emailVerification.isVerifying}
            />
            <AuthButton variant="secondary" label="로그인 하러가기" onClick={findId.goToLogin} />
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
