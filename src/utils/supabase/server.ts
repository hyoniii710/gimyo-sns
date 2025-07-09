// utils/supabase/server.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// 반드시 async 함수로 선언!
export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // 비동기 호출
  return createServerComponentClient({ cookies: () => cookieStore });
}
