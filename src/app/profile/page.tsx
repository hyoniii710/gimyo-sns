import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">나의 정보</h1>
      <p>이메일: {user.email}</p>
      <p>이름: {profile?.name}</p>
      <p>나이: {profile?.age}</p>
      <p>성별: {profile?.gender}</p>
      <p>전화번호: {profile?.phone}</p>
      <button
        onClick={async () => {
          const { error } = await supabase.auth.signOut();
          if (error) alert(error.message);
          else window.location.href = "/login";
        }}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        로그아웃
      </button>
    </div>
  );
}
