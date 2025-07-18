"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import Image from "next/image";

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
          // 빈 문자열도 null로 처리
          imageUrl:
            latest.image_url && latest.image_url.trim() !== ""
              ? latest.image_url
              : null,
          mood: latest.mood,
        });

        // 이미지가 없으면 고양이 API로 대체
        if (!latest.image_url || latest.image_url.trim() === "") {
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
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(isoDate));
  };

  // 최신 글도, 고양이 이미지도 없으면 메시지 표시
  if (!latestPost && !catImageUrl) {
    return (
      <div className="text-sm text-gray-400">최근 일기 정보가 없습니다.</div>
    );
  }

  // 빈 문자열·공백 모두 거르고 유효한 URL만 남김
  const rawUrl = latestPost?.imageUrl;
  const imageSrc =
    rawUrl && rawUrl.trim() !== ""
      ? rawUrl
      : catImageUrl && catImageUrl.trim() !== ""
        ? catImageUrl
        : null;

  // imageSrc가 없을 땐 위의 메시지 로직이 이미 처리했으므로
  // 여기서는 확실하게 imageSrc가 존재하는 경우만 렌더
  return (
    <div className="w-full max-w-md mx-auto border-2 border-gray-300 rounded overflow-hidden">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt="Diary"
          width={500}
          height={300}
          className="w-full h-auto object-contain cursor-pointer"
          onClick={() => router.push("/diary")}
        />
      )}

      <div className="p-4 bg-white">
        <p className="text-gray-600 text-sm mb-1">
          {latestPost ? formatKoreanDate(latestPost.date) : "날짜 정보 없음"}{" "}
          Diary Photo
        </p>
        <p className="text-sm mb-1">
          title: {latestPost?.title ?? "제목 없음"}
        </p>
        <p className="text-sm">emotion: {latestPost?.mood ?? "❓"}</p>
      </div>
    </div>
  );
}
