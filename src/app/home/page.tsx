import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import Todo from "@/components/todo/Todo";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="p-6 bg-white rounded-lg ">
      <div className="text-center text-green-700 text-xl font-semibold mb-6">
        GIMYO BLOG에 오신것을 환영합니다.
      </div>

      <div className="flex gap-6">
        <div className="flex-1 border rounded p-4">
          <Todo />
        </div>

        <div className="flex-1 border rounded p-4 space-y-4">
          {/* 사용자 정보 */}
          <div>
            <p>👤 반가워요 Kim 님 :)</p>
            <p>서울특별시 강남구 일원동</p>
            <p>날씨 26°C 흐림</p>
          </div>

          {/* 이미지 카드 */}
          <div className="border rounded overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1530789253388-582c481c54b0"
              alt="Diary"
              className="w-full h-48 object-cover"
            />
            <div className="p-2 text-sm text-gray-600">
              <p>2025년 6월 9일 Diary Photo</p>
              <p className="mt-2">title : 바다 가고싶다.</p>
              <p>emotion : 😘</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
