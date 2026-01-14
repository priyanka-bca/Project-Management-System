import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AcceptInvite() {
  const navigate = useNavigate();

  useEffect(() => {
    accept();
  }, []);

  const accept = async () => {
    // 1️⃣ get logged in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth/login");
      return;
    }

    // 2️⃣ find invite
    const { data: invite } = await supabase
      .from("group_invites")
      .select("*")
      .eq("email", user.email)
      .eq("accepted", false)
      .single();

    if (!invite) {
      navigate("/");
      return;
    }

    // 3️⃣ add to group
    await supabase.from("group_members").insert({
      group_id: invite.group_id,
      user_id: user.id,
    });

    // 4️⃣ mark invite accepted
    await supabase
      .from("group_invites")
      .update({ accepted: true })
      .eq("id", invite.id);

    navigate("/");
  };

  return (
    <div className="h-screen flex items-center justify-center text-gray-600">
      Joining group...
    </div>
  );
}
