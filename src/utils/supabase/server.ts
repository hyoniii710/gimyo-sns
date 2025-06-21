// utils/supabase/server.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const cookieStore = cookies(); // 호출해서 결과를 먼저 얻고
  return createServerComponentClient({ cookies: () => cookieStore }); // 함수로 감싸서 전달
}
