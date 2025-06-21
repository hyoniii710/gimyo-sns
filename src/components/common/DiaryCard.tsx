"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    const stored = localStorage.getItem("diaryPosts");
    if (stored) {
      const posts: DiaryEntry[] = JSON.parse(stored);
      const last = posts[posts.length - 1];
      setLatestPost(last);

      // 이미지 없으면 고양이 사진 요청
      if (!last?.imageUrl) {
        fetch("https://api.thecatapi.com/v1/images/search")
          .then((res) => res.json())
          .then((data) => {
            if (data[0]?.url) setCatImageUrl(data[0].url);
          });
      }
    }
  }, []);

  if (!latestPost) {
    return (
      <div className="text-sm text-gray-400">최근 일기 정보가 없습니다.</div>
    );
  }

  const formatKoreanDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="border-2 border-gray-800 rounded overflow-hidden">
      <img
        src={latestPost.imageUrl || catImageUrl || null}
        alt="Diary"
        className="w-full h-48 object-cover cursor-pointer"
        onClick={() => router.push("/diary")}
      />
      <div className="p-2 text-gray-600">
        <p>
          {new Date(latestPost.date).toLocaleDateString("ko-KR")} Diary Photo
        </p>
        <p className="mt-2">Title : {latestPost.title}</p>
        <p>Emotion : {latestPost.mood ?? "❓"}</p>
      </div>
    </div>
  );
}
