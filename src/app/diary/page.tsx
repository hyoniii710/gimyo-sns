"use client";
import React, { useState, useEffect } from "react";

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
  // 모드를 바꾸면 useEffect가 실행되어 form 초기화나 편집 준비를 자동으로 처리한다.

  // 3-2) 상태 관리 설정 : 일기 목록 및 선택 항목
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([]);
  //useState에 타입 매개변수로 DiaryEntry[]를 넘긴다.초기값으로 빈 배열을 지정
  //이유 : 작성된 일기 목록을 배열로 저장하기 위해.

  const [selectedEntry, setSelectedEntry] = useState<diaryEntry | null>(null);
  // 현재 선택된 일기 항목을 별도로 저장하기 위해
  // 선택된 일기가 없을수도 있으므로 null 허용

  // 3-3) 입력 관련 상태 선언
  // 일기 작성시 입력되는 기본 값들. 모든 초기값은 빈 문자열로 설정
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  // image - 사용자가 업로드한 실제 파일 객체를 저장. 없을 수 있으므로 null 허용
  const [image, setImage] = useState<File | null>(null);
  // imagePreviewUrl - 이미지 미리보기용 Base64 URL. 없을 수 있으므로 null 허용
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // 감정과 날씨 선택을 위한 상태
  const moodOptions = ["😊", "😐", "😢"];
  const weatherOptions = ["☀️", "☁️", "🌧️"];
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);

  // 일기 작성 로직 (2) - setMode가 "new"로 변경되면 초기화될 수 있도록 useEffect 사용
  //  -----------------------------"mode"가 "new"일 때 입력 초기화
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
      //"mode"가 "edit"일 때 일기 불러오기
      setTitle(selectedEntry.title);
      setContent(selectedEntry.content);
      setDate(selectedEntry.date);
      setImagePreviewUrl(selectedEntry.imageUrl);
      setSelectedMood(selectedEntry.mood ?? null);
      setSelectedWeather(selectedEntry.weather ?? null);
    }
  }, [mode, selectedEntry]); // mode가 변경될 때마다 실행, selectedEntry선택된 일기가 null일 때도 초기화

  // -----------------------------페이지 첫 로딩 시 localStorage에서 데이터 불러오기
  useEffect(() => {
    const stored = localStorage.getItem("diaryPosts");
    if (stored) {
      const posts: DiaryEntry[] = JSON.parse(stored);
      setDiaryList(posts);
      setSelectedEntry(posts[posts.length - 1]); // 최근 일기 선택
    }
  }, []); // 빈 배열: 컴포넌트 최초 마운트 시 1회 실행

  // -----------------------------fetchAllPosts() : 일기 불러오기 함수
  const fetchAllPosts = (selectedId?: string) => {
    const stored = localStorage.getItem("diaryPosts");
    const posts: DiaryEntry[] = stored ? JSON.parse(stored) : [];
    setDiaryList(posts);
    const selected =
      posts.find((p) => p.id === selectedId) || posts[posts.length - 1] || null;
    setSelectedEntry(selected);
  };

  // -----------------------------handleImageChange() : 이미지 업로드 함수
  // <input type="file" />의 onChange 이벤트가 발생했을 때 호출됨
  // e는 파일 입력 이벤트 객체이며 e.target.files로 선택된 파일 목록을 얻을 수 있음
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //files 배열이 존재하고 최소 1개의 파일이 있는지 검사
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      //이미지 파일을 브라우저에서 읽기 위해 FileReader API 인스턴스를 생성
      const reader = new FileReader();
      //파일 읽기가 완료되면 실행되는 콜백 함수 정의. 이미지 파일이 모두 로딩되면 자동으로 호출됨
      reader.onloadend = () => {
        // 읽은 이미지 데이터를 Base64 인코딩된 문자열(URL) 로 변환하여 imagePreviewUrl 상태에 저장
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      //이미지 파일을 Base64 문자열로 인코딩해서 읽기 시작
      //이 작업이 완료되면 reader.onloadend에서 결과를 받아 사용할 수 있음
    }
  };

  // -----------------------------handleSubmit() : 새 일기 등록 함수
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem("diaryPosts");
    const posts: DiaryEntry[] = stored ? JSON.parse(stored) : [];

    const newPost: DiaryEntry = {
      id: Date.now().toString(),
      date,
      title,
      content,
      imageUrl: imagePreviewUrl, // Base64 저장하지 않음
      mood: selectedMood ?? "",
      weather: selectedWeather ?? "",
    };

    posts.push(newPost);
    try {
      localStorage.setItem("diaryPosts", JSON.stringify(posts));
      setMode("view");
      fetchAllPosts(newPost.id); // 새로 등록된 글 선택
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        alert(
          "📦 저장 공간이 가득 찼습니다.\n사진이 포함된 일기를 더 이상 저장할 수 없습니다."
        );
      } else {
        alert("⚠️ 일기를 저장하는 도중 오류가 발생했습니다.");
        console.error(error);
      }
    }
  };
  // -----------------------------handleUpdate() : 일기 수정 함수
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 기본 동작을 막기 위해
    if (!selectedEntry) return; // 수정 대상이 없으면 중단.

    //로컬스토리지에서 기존 일기 데이터를 불러옵니다.
    const stored = localStorage.getItem("diaryPosts");

    //데이터가 있으면 JSON.parse()로 파싱해서 사용하고, 없다면 빈 배열을 기본값으로 사용
    const posts: DiaryEntry[] = stored ? JSON.parse(stored) : [];

    //기존 일기 목록 중에서 수정하려는 일기(selectedEntry.id)와 같은 ID를 가진 일기만 찾아서 바꾸기 위해 map을 사용
    const updatedPosts = posts.map(
      (post) =>
        //ID가 일치하면 해당 일기를 폼에 입력된 값들로 덮어쓴다.
        post.id === selectedEntry.id
          ? {
              ...post, //기존 필드를 보존하면서 새 값들로 덮어쓰기 위한 스프레드 연산자
              title,
              content,
              date,
              imageUrl: imagePreviewUrl,
              mood: selectedMood ?? "",
              weather: selectedWeather ?? "",
            }
          : post //조건에 맞지 않는(post.id가 다름) 경우는 그대로 반환하여 리스트 유지
      // 즉, ID 일치하는 하나만 바꾸고 나머지는 그대로 유지.
    );
    localStorage.setItem("diaryPosts", JSON.stringify(updatedPosts));
    setMode("view");
    fetchAllPosts(selectedEntry.id); // ✅ 이 줄이 핵심!
  };

  //  -----------------------------handleDelete() : 일기 삭제 함수
  const handleDelete = () => {
    if (!selectedEntry) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    //로컬스토리지에서 기존 일기 데이터를 불러옵니다.
    const stored = localStorage.getItem("diaryPosts");
    //상수 posts는 DiaryEntry[]라는 타입임
    const posts: DiaryEntry[] = stored ? JSON.parse(stored) : [];

    //필터링으로 post id가 selectedEntry의 id와 다르면 저장시킨다. (선택된것은 삭제되야하므로)
    const updatedPosts = posts.filter((post) => post.id != selectedEntry.id);
    localStorage.setItem("diaryPosts", JSON.stringify(updatedPosts));
    setMode("view");
    fetchAllPosts(); // 삭제 후, 최신 글 자동 선택
  };

  // -----------------------------handleCancel() : 날짜 포맷팅 함수
  const handleCancel = () => {
    setMode("view");
    fetchAllPosts();
  };

  // -----------------------------formatKoreanDate() : 날짜 포맷팅 함수
  const formatKoreanDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
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
