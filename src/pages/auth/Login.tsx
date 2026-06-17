import IdLogin from "@features/auth/ui/IdLogin";
import SocialLogin from "@features/auth/ui/SocialLogin";
import { useState } from "react"

type Mode = "social" | "id"

export default function Login() {
  const [mode, setMode] = useState<Mode>("social");

  return (
    <div>
      {mode === "social" ? <SocialLogin setMode={setMode}/> : <IdLogin />}
    </div>
  )
}