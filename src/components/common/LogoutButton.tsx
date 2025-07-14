//components/common/LogoutButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function LogoutButton() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-700 hover:text-red-500"
    >
      로그아웃
    </button>
  );
}
