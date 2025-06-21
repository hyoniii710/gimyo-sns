import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import Todo from "@/components/todo/Todo";
import UserLocation from "@/components/common/UserLocation";
import UserWeather from "@/components/common/UserWeather";
import DiaryCard from "@/components/common/DiaryCard";
import Calendar from "@/components/common/Calendar";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // ✅ 사용자 ID로 user_profiles에서 이름 가져오기
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("name")
    .eq("id", session.user.id)
    .single();

  const userName = profile?.name ?? "회원";

  return (
    <div className="p-6 bg-white rounded-lg ">
      <div className="text-center text-green-700 text-xl font-semibold mb-6">
        GIMYO BLOG에 오신것을 환영합니다.
      </div>

      <div className="flex gap-6">
        <div className="flex-1 border rounded p-4 flex justify-center">
          <Todo />
        </div>

        <div className="flex-1 border rounded p-4 space-y-4">
          {/* 사용자 정보 */}
          <div className="pb-2 font-bold">
            <p>👤 반가워요 {userName} 님 :)</p>
            <UserLocation /> {/* 현재 위치 표시 */}
            <UserWeather />
          </div>
          {/* 이미지 카드 */}
          <div>
            <p className="text-sm pb-1 font-bold text-gray-600">
              ✍🏻 나의 다이어리 미리보기
            </p>
            <DiaryCard />
          </div>
          <div>
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  );
}
