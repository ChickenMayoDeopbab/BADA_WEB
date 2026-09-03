import IdLogin from "@features/auth/ui/IdLogin";
import SocialLogin from "@features/auth/ui/SocialLogin";
import type { LoginMode } from "@features/auth";
import { useState } from "react"

export default function Login() {
  const [mode, setMode] = useState<LoginMode>("social");

  return (
    <div>
      {mode === "social" ? <SocialLogin setMode={setMode}/> : <IdLogin />}
    </div>
  )
}
