// utils/supabase/client.ts
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export const createSupabaseBrowserClient = () => createPagesBrowserClient(); // 제네릭 타입은 생략 가능
