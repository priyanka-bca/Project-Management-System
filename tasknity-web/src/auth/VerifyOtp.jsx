import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

export default function VerifyOtp() {
  const [otp, setOtp] = useState("")
  const { state } = useLocation()
  const navigate = useNavigate()

  const verifyOtp = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.verifyOtp({
      email: state.email,
      token: otp,
      type: "email",
    })

    if (error) {
      alert(error.message)
    } else {
      navigate("/auth/complete-profile")
    }
  }

  return (
    <form onSubmit={verifyOtp} className="auth-card">
      <h2>Verify OTP</h2>

      <input
        type="text"
        placeholder="Enter verification code"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        minLength={6}
        maxLength={8}
        required
      />


      <button type="submit">Verify</button>
    </form>
  )
}
