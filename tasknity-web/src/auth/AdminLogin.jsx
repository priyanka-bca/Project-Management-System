import { useState } from "react";
import supabase from "../supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const sendLink = async (e) => {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin-login` }
    });

    setSent(true);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

      {sent ? (
        <p>Magic link sent. Check email.</p>
      ) : (
        <form onSubmit={sendLink} className="space-y-4">
          <input
            className="border p-2 w-full"
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="bg-red-600 text-white w-full py-2 rounded">
            Send Admin Magic Link
          </button>
        </form>
      )}
    </div>
  );
}
