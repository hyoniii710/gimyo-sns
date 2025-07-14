"use client";

import { useState, useEffect } from "react";

// 1) 할 일(Todo) 하나의 타입 정의
interface TodoItem {
  todoId: number; // 각 할 일의 고유 ID
  todoText: string; // 할 일 내용
  todoDone: boolean; // 완료 여부
}

// 2) 캘린더 스케줄 아이템 타입 정의
interface ScheduleItem {
  id: number; // 스케줄 고유 ID (todoId와 동일)
  date: string; // 날짜 문자열 (e.g. "2025년 7월 14일")
  category: string; // 스케줄 분류 (e.g. "todo")
  content: string; // 스케줄 내용
}

export default function Todo() {
  // 할 일 목록 상태
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  // 입력창 상태
  const [inputValue, setInputValue] = useState("");

  // 할 일 목록을 localStorage에 저장하는 함수
  function saveTodosToStorage(todos: TodoItem[]) {
    localStorage.setItem("myTodos", JSON.stringify(todos));

    // 캘린더 일정에도 반영
    const calendarKey = "calendarSchedules";

    // — 기존 코드에서는 any로 받아오던 부분을 ScheduleItem[]으로 타입 지정
    const existingSchedules: ScheduleItem[] = JSON.parse(
      localStorage.getItem(calendarKey) || "[]"
    );

    // 오늘 날짜 문자열 만들기
    const today = new Date();
    const todayStr = today.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // 오늘의 할 일들을 ScheduleItem[] 형태로 변환
    const todaySchedules: ScheduleItem[] = todos.map((todo) => ({
      id: todo.todoId,
      date: todayStr,
      category: "todo",
      content: todo.todoText,
    }));

    // — any 대신 ScheduleItem으로 필터링
    const mergedSchedules: ScheduleItem[] = [
      ...existingSchedules.filter(
        (item: ScheduleItem) => item.category !== "todo"
      ),
      ...todaySchedules,
    ];

    localStorage.setItem(calendarKey, JSON.stringify(mergedSchedules));
    window.dispatchEvent(new Event("updateCalendar"));
  }

  // 컴포넌트가 처음 렌더링될 때 localStorage에서 할 일 목록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("myTodos");
    if (saved) {
      setTodoList(JSON.parse(saved));
    }
  }, []);

  // 할 일 삭제
  function handleDeleteTodo(id: number) {
    const newTodos = todoList.filter((todo) => todo.todoId !== id);
    setTodoList(newTodos);
    saveTodosToStorage(newTodos);
  }

  // 할 일 완료/취소 토글
  function handleToggleTodo(id: number) {
    const newTodos = todoList.map((todo) =>
      todo.todoId === id ? { ...todo, todoDone: !todo.todoDone } : todo
    );
    setTodoList(newTodos);
    saveTodosToStorage(newTodos);
  }

  // 할 일 추가
  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: TodoItem = {
      todoId: Date.now(),
      todoText: inputValue.trim(),
      todoDone: false,
    };

    const updatedList = [...todoList, newTodo];
    setTodoList(updatedList);
    saveTodosToStorage(updatedList);
    setInputValue("");
  }

  return (
    <div className="w-[320px] h-[568px] border-[3px] border-black rounded-[16px] bg-[#abc1d1] p-3 relative">
      {/* 제목 */}
      <h1 className="flex justify-center items-center gap-2 text-center text-black text-2xl border-b border-gray-300 mb-3">
        <span>🍀</span>
        <span className="font-bold">TO DO LIST</span>
        <span>🍀</span>
      </h1>

      {/* 할 일 목록 */}
      <ul className="max-h-[420px] overflow-auto space-y-3 pr-2">
        {todoList.map((todo) => (
          <li
            key={todo.todoId}
            onClick={() => handleToggleTodo(todo.todoId)}
            className={`relative cursor-pointer w-[200px] min-h-[40px] p-2 ml-[60px] rounded-md ${
              todo.todoDone
                ? "bg-[#eaeaea] line-through text-gray-600"
                : "bg-[#fee54d]"
            }`}
          >
            {todo.todoText}
            <span
              className={`absolute top-[10px] -right-2 w-0 h-0 border-b-[16px] border-b-transparent border-l-[16px] ${
                todo.todoDone ? "border-l-[#eaeaea]" : "border-l-[#fee54d]"
              }`}
            />
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTodo(todo.todoId);
              }}
              className="absolute left-[-20px] bottom-[2px] w-4 h-4 flex items-center justify-center rounded-full bg-[#eaeaea] text-xs"
            >
              ✕
            </span>
          </li>
        ))}
      </ul>

      {/* 할 일 입력창 */}
      <form
        onSubmit={handleAddTodo}
        className="absolute bottom-0 left-0 w-full flex bg-white rounded-b-[10px]"
      >
        <input
          type="text"
          name="todo"
          placeholder="TO DO..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-[240px] h-[45px] text-lg px-3 rounded-bl-[10px] outline-none"
        />
        <button
          type="submit"
          className="w-[80px] text-lg font-bold bg-[#fee54d] rounded-br-[10px]"
        >
          추가
        </button>
      </form>
    </div>
  );
}
