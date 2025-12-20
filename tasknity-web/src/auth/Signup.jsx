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
    <div className="min-h-screen flex items-center justify-center from-slate-900 to-slate-800">
      <form
        onSubmit={sendOtp}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Create account</h2>
          <p className="text-sm text-gray-500">
            We’ll send a one-time code to your email
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-600 text-white
                     font-semibold tracking-wide
                     hover:bg-blue-700 active:scale-[0.98]
                     transition duration-150"
        >
          Send OTP
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Log in
          </span>
        </p>
      </form>
    </div>
  )
}
