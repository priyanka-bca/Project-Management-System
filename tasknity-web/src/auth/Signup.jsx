import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Signup() {
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  const sendOtp = async (e) => {
    e.preventDefault()

    const res = await fetch(
      "https://zsangtjxipvxbwmdmzoy.functions.supabase.co/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Failed")
      return
    }

    navigate("/auth/verify", { state: { email } })
  }


  return (
    <form onSubmit={sendOtp} className="auth-card">
      <h2>Sign Up</h2>

      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit">Send OTP</button>
    </form>
  )
}
