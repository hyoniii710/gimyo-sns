"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // react-calendar 기본 CSS는 유지

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type Schedule = {
  date: string; // "YYYY-MM-DD"
  content: string;
};

export default function MyCalendar() {
  const [value, onChange] = useState<Value>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [input, setInput] = useState("");
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);

  // ---------------- handleDateChange() : 날짜 클릭 함수

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-gray-500 shadow-md py-2 px-4 text-white">
        <h1 className="text-lg font-semibold text-center"> 🗓️ Calendar 🗓️</h1>
      </header>

      <div className="flex flex-wrap items-start gap-4 p-4">
        <main className="flex flex-col flex-grow max-w-full basis-[420px] pt-4 items-stretch">
          <div className="mx-auto">
            <Calendar
              onChange={onChange}
              showWeekNumbers
              value={value}
              //1일 => 1만 표시
              formatDay={(local, date) => date.getDate().toLocaleString()}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
