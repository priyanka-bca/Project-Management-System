import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

export default function VerifyOtp() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [token, setToken] = useState("")
  const email = state?.email

  const verifyOtp = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })

    if (error) {
      alert(error.message)
      return
    }

    navigate("/")
  }

  if (!email) return <p>Invalid access</p>

  return (
    <form onSubmit={verifyOtp} className="auth-card">
      <h2>Verify OTP</h2>

      <input
        type="text"
        placeholder="6-digit code"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        required
      />

      <button type="submit">Verify</button>
    </form>
  )
}
