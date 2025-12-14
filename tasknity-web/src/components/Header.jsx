import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex justify-between">
      <h1 className="text-xl font-bold">Project Management System</h1>
      <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">
        Logout
      </button>
    </header>
  );
}
