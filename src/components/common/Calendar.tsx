"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// 카테고리별 색상 정의
const colorMap: Record<string, string> = {
  운동: "bg-orange-400",
  식사: "bg-sky-400",
  일정: "bg-purple-600",
  공부: "bg-yellow-300",
};

// 일정 타입
interface ScheduleType {
  id: number;
  date: string; // "yyyy년 M월 d일"
  category: string;
  content: string;
}

// 날짜 선택값 타입
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function MyCalendar() {
  const [value, setValue] = useState<Value>(new Date());
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    category: "일정",
    content: "",
  });

  const selectedDate = format(value as Date, "yyyy년 M월 d일", { locale: ko });

  // 일정 불러오기 (처음 1번)
  useEffect(() => {
    const saved = localStorage.getItem("calendarSchedules");
    if (saved) {
      setSchedules(JSON.parse(saved));
    }
  }, []);

  // 일정 저장
  const saveSchedules = (data: ScheduleType[]) => {
    localStorage.setItem("calendarSchedules", JSON.stringify(data));
  };

  // 일정 추가
  const handleAdd = () => {
    if (!newSchedule.content.trim()) return;

    const newItem: ScheduleType = {
      id: Date.now(),
      date: selectedDate,
      category: newSchedule.category,
      content: newSchedule.content.trim(),
    };

    const updated = [...schedules, newItem];
    setSchedules(updated);
    saveSchedules(updated);
    setNewSchedule({ category: "일정", content: "" });
  };

  // 일정 삭제
  const handleDelete = (id: number) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
  };

  // 현재 날짜에 해당하는 일정 필터
  const filtered = schedules.filter((s) => s.date === selectedDate);

  return (
    <div className="min-h-screen bg-gray-100 font-samlip">
      <header className="bg-gray-500 shadow-md py-2 px-4 text-white">
        <h1 className="text-lg font-semibold text-center">🗓️ Calendar 🗓️</h1>
      </header>

      <div className="flex flex-wrap items-start gap-4 p-4 font-samlip">
        <main className="flex flex-col flex-grow max-w-full basis-[420px] pt-4 items-stretch">
          {/* 캘린더 */}
          <div>
            <Calendar
              onChange={setValue}
              value={value}
              formatDay={(_, date) => String(date.getDate())}
              tileContent={({ date, view }) => {
                const dateStr = format(date, "yyyy년 M월 d일", { locale: ko });
                const dots = schedules
                  .filter((s) => s.date === dateStr)
                  .slice(0, 3)
                  .map((s, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${colorMap[s.category]}`}
                    ></span>
                  ));

                return (
                  view === "month" && (
                    <div className="flex justify-center gap-[2px] mt-1">
                      {dots}
                    </div>
                  )
                );
              }}
            />
          </div>

          {/* 일정 리스트 및 입력 */}
          <div className="w-full max-w-md mt-4 space-y-2 ">
            <h2 className="text-lg font-semibold">{selectedDate} 일정</h2>

            <ul className="space-y-2">
              {filtered.length === 0 ? (
                <li className="text-gray-400">일정 없음</li>
              ) : (
                filtered.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between bg-white rounded px-3 py-2 shadow-sm"
                  >
                    <p className="text-sm">
                      <span
                        className={`inline-block w-2 h-2 mr-1 rounded-full ${colorMap[s.category]} `}
                      />
                      [{s.category}] {s.content}
                    </p>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-400 text-xs"
                    >
                      삭제
                    </button>
                  </li>
                ))
              )}
            </ul>

            {/* 일정 등록 폼 */}
            <div className="space-y-1">
              <p className="pt-8"> ✔️ 일정 추가 </p>
              <select
                value={newSchedule.category}
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="border rounded px-2 py-1 text-sm w-full"
              >
                <option>일정</option>
                <option>운동</option>
                <option>식사</option>
                <option>공부</option>
              </select>

              <input
                type="text"
                placeholder="내용을 입력하세요"
                value={newSchedule.content}
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                className="w-full border rounded px-2 py-1 text-sm"
              />

              <button
                onClick={handleAdd}
                className="w-full bg-blue-200 text-gray text-sm py-1 rounded hover:bg-blue-300"
              >
                일정 추가
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
