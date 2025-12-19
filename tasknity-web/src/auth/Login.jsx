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
    <form onSubmit={handleLogin} className="auth-card">
      <h2>Login</h2>

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

      <button type="submit">Login</button>

      <p>
        Don’t have an account?{" "}
        <Link to="/auth/signup">Sign up</Link>
      </p>
    </form>
  )
}
