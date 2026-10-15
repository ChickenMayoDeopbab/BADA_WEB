import { IdLogin, SocialLogin, type LoginMode } from '@features/auth'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function Login() {
  const location = useLocation()
  const [mode, setMode] = useState<LoginMode>(
    (location.state as { signupComplete?: boolean } | null)?.signupComplete ? 'id' : 'social',
  )

  return mode === 'social' ? <SocialLogin onSelectIdLogin={() => setMode('id')} /> : <IdLogin />
}
