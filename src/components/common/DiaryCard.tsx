"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  imageUrl: string | null;
  mood?: string;
}

export default function DiaryCard() {
  const [latestPost, setLatestPost] = useState<DiaryEntry | null>(null);
  const [catImageUrl, setCatImageUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestPost = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, created_at, image_url, mood")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("❌ 최신 글 불러오기 실패:", error);
        return;
      }

      if (data && data.length > 0) {
        const latest = data[0];
        setLatestPost({
          id: latest.id,
          title: latest.title,
          date: latest.created_at,
          imageUrl: latest.image_url,
          mood: latest.mood,
        });

        // 이미지가 없으면 고양이 이미지 호출
        if (!latest.image_url) {
          const res = await fetch("https://api.thecatapi.com/v1/images/search");
          const catData = await res.json();
          if (catData[0]?.url) {
            setCatImageUrl(catData[0].url);
          }
        }
      }
    };

    fetchLatestPost();
  }, []);

  const formatKoreanDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (!latestPost && !catImageUrl) {
    return (
      <div className="text-sm text-gray-400">최근 일기 정보가 없습니다.</div>
    );
  }

  return (
    <div className="border-2 border-gray-800 rounded overflow-hidden">
      <img
        src={latestPost?.imageUrl || catImageUrl || null}
        alt="Diary"
        className="w-full h-48 object-cover cursor-pointer"
        onClick={() => router.push("/diary")}
      />
      <div className="p-2 text-gray-600">
        <p>
          {latestPost ? formatKoreanDate(latestPost.date) : "날짜 정보 없음"}{" "}
          Diary Photo
        </p>
        <p className="mt-2">Title : {latestPost?.title ?? "제목 없음"}</p>
        <p>Emotion : {latestPost?.mood ?? "❓"}</p>
      </div>
    </div>
  );
}
