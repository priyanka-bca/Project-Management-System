import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center from-slate-900 to-slate-800">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">Login Page</h2>

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit"
        className="text-blue-600 font-bold">Login</button>

        <p>
          Don’t have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-blue-600 font-bold p-5">Sign up</Link>
        </p>
      </form>
    </div>
  )
}
