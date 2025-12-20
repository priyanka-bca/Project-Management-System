import { useState } from "react"
import { supabase } from "../supabase"
import { useNavigate } from "react-router-dom"

export default function CompleteProfile() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirm) {
      alert("Passwords do not match")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
      data: { username },
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    navigate("/auth/login")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">Complete your profile</h2>
      <p className="text-center text-gray-500">
        Set your username and password
      </p>

      <input
        type="text"
        placeholder="Username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border rounded-lg px-4 py-3"
      />

      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded-lg px-4 py-3"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border rounded-lg px-4 py-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  )
}
