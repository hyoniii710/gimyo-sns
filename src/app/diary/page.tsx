"use client";
import React, { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

// 1) 타입 정의 및 모드 상태관리
interface DiaryEntry {
  id: string; // 일기 ID
  date: string; // 작성 날짜
  title: string; // 일기 제목
  content: string; // 일기 내용
  imageUrl: string | null; // 이미지 URL (선택적)
  mood?: string; // 감정 상태 (예: 이모지 happy, sad 등)
  weather?: string; // 날씨 상태 (예: 이모지 sunny, rainy 등)
}
// 2) mode 타입 정의
type Mode = "view" | "new" | "edit"; // 편집 form 모드 정의
// veiw: 일기 목록 보기, new: 새 일기 작성, edit: 기존 일기 수정

export default function DiaryPage() {
  // 3-1) mode 상태관리 선언
  const [mode, setMode] = useState<Mode>("view");

  // 3-2) 상태 관리 설정 : 일기 목록 및 선택 항목
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null); // ✅ 수정됨

  // 3-3) 입력 관련 상태 선언
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const moodOptions = ["😊", "😐", "😢"];
  const weatherOptions = ["☀️", "☁️", "🌧️"];
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "new") {
      setTitle("");
      setContent("");
      setDate("");
      setImage(null);
      setImagePreviewUrl(null);
      setSelectedMood(null);
      setSelectedWeather(null);
      setSelectedEntry(null);
    } else if (mode === "edit" && selectedEntry) {
      setTitle(selectedEntry.title);
      setContent(selectedEntry.content);
      setDate(selectedEntry.date);
      setImagePreviewUrl(selectedEntry.imageUrl);
      setSelectedMood(selectedEntry.mood ?? null);
      setSelectedWeather(selectedEntry.weather ?? null);
    }
  }, [mode, selectedEntry]);

  useEffect(() => {
    fetchAllPosts();
  }, []);
  // -------------------- fetchAllPosts() : 포스트 불러오기 함수
  const fetchAllPosts = async (selectedId?: string) => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ 게시글 불러오기 실패:", error);
      return;
    }

    const posts: DiaryEntry[] = data.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      date: post.created_at?.split("T")[0] ?? "",
      imageUrl: post.image_url,
      mood: post.mood,
      weather: post.weather,
    }));

    setDiaryList(posts);
    const selected =
      posts.find((p) => p.id === selectedId) || posts[posts.length - 1] || null;
    setSelectedEntry(selected);

    if (posts.length === 0) {
      setMode("new"); // 작성 폼을 바로 띄우기
    }

    console.log("📦 불러온 포스트:", posts);
    console.log("🎯 선택된 post:", selected);
  };

  // -------------------- handleImageChange() : 이미지 업로드 함수
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

  // -------------------- handleUpdate() : 수정 함수
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();

    if (!selectedEntry) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인 후 사용해주세요.");
      return;
    }

    let updatedImageUrl = imagePreviewUrl;

    if (image) {
      const uploadedUrl = await uploadImageToSupabase(image);
      if (!uploadedUrl) {
        alert("이미지 업로드 실패");
        return;
      }
      updatedImageUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        image_url: updatedImageUrl,
        mood: selectedMood ?? null,
        weather: selectedWeather ?? null,
      })
      .eq("id", selectedEntry.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ 수정 실패:", error);
      alert("수정 실패");
      return;
    }

    alert("✅ 수정 완료!");
    setMode("view");
    fetchAllPosts(selectedEntry.id);
  };

  const handleCancel = () => {
    setMode("view");
    fetchAllPosts();
  };

  const formatKoreanDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("로그인 후 사용해주세요.");
      return;
    }

    let imageUrl: string | null = null;

    if (image) {
      const uploadedUrl = await uploadImageToSupabase(image);
      if (!uploadedUrl) {
        alert("이미지 업로드 실패");
        return;
      }
      imageUrl = uploadedUrl;
    }

    // insert 후 select()로 새로 등록된 post 가져오기
    const { data: insertedData, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        title,
        content,
        created_at: new Date(date).toISOString(),
        image_url: imageUrl,
        mood: selectedMood,
        weather: selectedWeather,
      })
      .select()
      .single(); // insert 후 새 글을 바로 가져옴

    if (error || !insertedData) {
      console.error("❌ 게시글 저장 실패:", error);
      alert("일기 저장에 실패했습니다.");
      return;
    }

    alert("✅ 저장 완료!");
    await fetchAllPosts(insertedData.id); // 새 글을 바로 선택
    setMode("view");
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    const supabase = createSupabaseBrowserClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `diary/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("diary-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ 이미지 업로드 실패", uploadError);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("diary-images").getPublicUrl(filePath);

    return publicUrl;
  };

  // 삭제 함수 추가
  const handleDelete = async () => {
    if (!selectedEntry) return;

    const supabase = createSupabaseBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인 후 사용해주세요.");
      return;
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", selectedEntry.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ 삭제 실패:", error);
      alert("삭제 실패");
      return;
    }

    alert("✅ 삭제 완료!");
    setMode("view");
    fetchAllPosts();
  };

  return (
    <div className="p-6 bg-white rounded-lg flex flex-col gap-6">
      {/* 상단: 이미지 업로드 + 작성/보기 영역 */}
      <div className="flex gap-6">
        {/* 이미지 업로드 영역 */}
        <div className="flex-1 border rounded p-4 flex flex-col items-center">
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
            {imagePreviewUrl || selectedEntry?.imageUrl ? (
              <img
                src={imagePreviewUrl || selectedEntry?.imageUrl || ""}
                alt="미리보기"
                className="w-full h-full object-contain"
              />
            ) : (
              <p className="text-gray-400">이미지를 업로드해주세요.</p>
            )}
          </div>
          <button
            className="mt-2 px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => {
              console.log("업로드 버튼이 클릭되었습니다.");
              document.getElementById("imageInput")?.click();
            }}
          >
            업로드
          </button>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* 일기 보기/작성 영역 */}
        <div className="flex-1 border rounded p-4">
          {mode === "view" ? (
            selectedEntry ? (
              <>
                <div className="text-sm text-gray-700 space-y-2">
                  <p className="text-left text-gray-500">
                    {formatKoreanDate(selectedEntry.date)}
                  </p>
                  <p className="flex gap-4">
                    <span>날씨 : {selectedEntry.weather ?? "❓"}</span>
                    <span>기분 : {selectedEntry.mood ?? "❓"}</span>
                  </p>
                  <p>제목 : {selectedEntry.title}</p>
                  <p>내용 : {selectedEntry.content}</p>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={() => setMode("new")}
                    >
                      새 글
                    </button>
                    <button
                      className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={() => setMode("edit")}
                    >
                      수정
                    </button>
                  </div>
                  <button
                    className="px-4 py-1 bg-red-400 text-white rounded hover:bg-red-500"
                    onClick={handleDelete}
                  >
                    삭제
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center mt-4">
                아직 작성된 일기가 없습니다.
              </p>
            )
          ) : (
            <form
              className="space-y-4"
              onSubmit={mode === "edit" ? handleUpdate : handleSubmit}
            >
              <input
                type="date"
                className="border p-2 rounded w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                required
              />
              <textarea
                className="border p-2 rounded w-full"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
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
                        className={`text-3xl hover:scale-110 transition ${
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
                        className={`text-3xl hover:scale-110 transition ${
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
                  onClick={handleCancel}
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

      {/* 하단: 일기 목록 */}
      <div className="bg-yellow-50 border rounded p-4">
        <h2 className="font-bold mb-2">📚 일기 목록</h2>
        {diaryList.length === 0 ? (
          <p className="text-sm text-gray-500">작성된 일기가 없습니다.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {[...diaryList].reverse().map((entry) => (
              <li
                key={entry.id}
                onClick={() => {
                  setSelectedEntry(entry);
                  setImagePreviewUrl(entry.imageUrl);
                  setMode("view");
                }}
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
