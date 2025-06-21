// app/diary/page2.tsx
"use client";

import { useState, useEffect, useRef } from "react";

// 타입 정의
type Mode = "view" | "new" | "edit";

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  imageUrl: string | null;
  mood?: string;
  weather?: string;
}

export default function DiaryPage() {
  // 1. 모드 전환 관련 상태
  const [mode, setMode] = useState<Mode>("view");

  // 2. 일기 목록 및 선택된 항목 상태
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  // 3. 입력 관련 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // 4. 감정/날씨 상태
  const moodOptions = ["😊", "😐", "😢"];
  const weatherOptions = ["☀️", "☁️", "🌧️"];
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);

  // 5. 이미지 업로드용 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모드 변경 시 상태 초기화/설정
  useEffect(() => {
    if (mode === "edit" && selectedEntry) {
      setTitle(selectedEntry.title);
      setContent(selectedEntry.content);
      setDate(selectedEntry.date);
      setImagePreviewUrl(selectedEntry.imageUrl);
      setSelectedMood(selectedEntry.mood ?? null);
      setSelectedWeather(selectedEntry.weather ?? null);
    } else if (mode === "new") {
      setTitle("");
      setContent("");
      setDate("");
      setImage(null);
      setImagePreviewUrl(null);
      setSelectedMood(null);
      setSelectedWeather(null);
      setSelectedEntry(null);
    }
  }, [mode, selectedEntry]);

  // view 모드일 때 일기 불러오기
  useEffect(() => {
    if (mode === "view") fetchAllPosts();
  }, [mode]);

  // 날짜 포맷
  const formatKoreanDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  };

  // 이미지 업로드 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 새 일기 저장
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem("diaryPosts");
    const posts: DiaryEntry[] = stored ? JSON.parse(stored) : [];

    const newPost: DiaryEntry = {
      id: Date.now().toString(),
      date,
      title,
      content,
      imageUrl: imagePreviewUrl,
      mood: selectedMood ?? "",
      weather: selectedWeather ?? "",
    };

    posts.push(newPost);
    localStorage.setItem("diaryPosts", JSON.stringify(posts));
    setMode("view");
    setImage(null);
    fetchAllPosts();
  };

  // 수정 저장
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    const stored = localStorage.getItem("diaryPosts");
    const posts: DiaryEntry[] = stored ? JSON.parse(stored) : [];

    const updatedPosts = posts.map((post) =>
      post.id === selectedEntry.id
        ? {
            ...post,
            title,
            content,
            date,
            imageUrl: imagePreviewUrl,
            mood: selectedMood ?? "",
            weather: selectedWeather ?? "",
          }
        : post
    );

    localStorage.setItem("diaryPosts", JSON.stringify(updatedPosts));
    setMode("view");
    fetchAllPosts();
  };

  // 삭제
  const handleDelete = () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const stored = localStorage.getItem("diaryPosts");
    if (!stored || !selectedEntry) return;
    const posts: DiaryEntry[] = JSON.parse(stored);
    const updatedPosts = posts.filter((post) => post.id !== selectedEntry.id);
    localStorage.setItem("diaryPosts", JSON.stringify(updatedPosts));
    setSelectedEntry(null);
    setMode("view");
    fetchAllPosts();
  };

  // 일기 목록 불러오기
  const fetchAllPosts = () => {
    const stored = localStorage.getItem("diaryPosts");
    if (!stored) {
      setDiaryList([]);
      setSelectedEntry(null);
      return;
    }
    const posts: DiaryEntry[] = JSON.parse(stored);
    setDiaryList(posts);
    setSelectedEntry(posts[posts.length - 1]);
  };

  // 특정 일기 선택
  const handleSelectEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setImagePreviewUrl(entry.imageUrl);
    setMode("view");
  };

  const uniqueDiaryList = diaryList.reduce<DiaryEntry[]>((acc, cur) => {
    if (!acc.some((entry) => entry.id === cur.id)) acc.push(cur);
    return acc;
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="text-center text-green-700 text-xl font-semibold mb-6">
        GIMYO BLOG에 오신것을 환영합니다.
      </div>
      {/* 좌측 이미지 업로드 */}
      <div className="flex gap-6">
        <div className="flex-1 border rounded p-4 flex flex-col items-center">
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="미리보기"
                className="object-cover w-full h-full"
              />
            ) : (
              // <span className="text-5xl text-gray-400">🖼️</span>
              <span className="text-gray-400">이미지를 업로드해주세요.</span>
            )}
          </div>
          <button
            className="mt-2 px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => fileInputRef.current?.click()}
          >
            업로드
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        {/* 우측 일기 제목출력 */}
        <div className="flex-1 border rounded p-4 flex flex-col justify-between space-y-2">
          {mode === "view" && selectedEntry ? (
            <div className="text-sm text-gray-700 space-y-2">
              <p className="text-left text-gray-500">
                {formatKoreanDate(selectedEntry.date)}
              </p>
              <p>
                날씨 : {selectedEntry.weather ?? "❓"} 기분 :{" "}
                {selectedEntry.mood ?? "❓"}
              </p>
              <p>제목 : {selectedEntry.title}</p>
              <p>내용 : {selectedEntry.content}</p>

              {/* 글 작성/수정/삭제 Form 버튼 */}
              <div className="flex justify-between mt-4">
                <div className="flex gap-2">
                  <button
                    className="bg-gray-200 px-4 py-1 rounded"
                    onClick={() => setMode("new")}
                  >
                    새 글
                  </button>
                  <button
                    className="bg-gray-200 px-4 py-1 rounded"
                    onClick={() => setMode("edit")}
                  >
                    수정
                  </button>
                </div>
                <button
                  className="bg-red-400 px-4 py-1 rounded text-white hover:bg-red-500"
                  onClick={handleDelete}
                >
                  삭제
                </button>
              </div>
            </div>
          ) : (
            // 일기 작성/수정 폼
            <form
              onSubmit={mode === "edit" ? handleUpdate : handleSubmit}
              className="space-y-2"
            >
              <label className="text-sm font-bold">Date</label>
              <input
                type="date"
                className="border p-1 rounded w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="제목"
                className="border p-2 rounded w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="내용"
                className="border p-2 rounded w-full"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div className="flex flex-col">
                <label className="text-sm font-bold mb-1">
                  오늘 기분 / 날씨
                </label>
                <div className="flex items-center gap-8">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">기분</span>
                    {moodOptions.map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setSelectedMood(mood)}
                        className={`text-3xl transition-transform transform hover:scale-110 ${
                          selectedMood === mood ? "" : "grayscale opacity-50"
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">날씨</span>
                    {weatherOptions.map((weather) => (
                      <button
                        key={weather}
                        type="button"
                        onClick={() => setSelectedWeather(weather)}
                        className={`text-3xl transition-transform transform hover:scale-110 ${
                          selectedWeather === weather
                            ? ""
                            : "grayscale opacity-50"
                        }`}
                      >
                        {weather}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="w-1/2 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                >
                  {mode === "edit" ? "수정 완료" : "등록"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 mt-6 border rounded p-4">
        <h2 className="font-bold mb-2">📚 일기 목록</h2>
        {uniqueDiaryList.length === 0 ? (
          <p className="text-sm text-gray-500">작성된 일기가 없습니다.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {[...uniqueDiaryList].reverse().map((entry) => (
              <li
                key={entry.id}
                onClick={() => handleSelectEntry(entry)}
                className="cursor-pointer hover:underline"
              >
                {formatKoreanDate(entry.date)} : {entry.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
