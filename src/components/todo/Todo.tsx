"use client";

import { useState, useEffect } from "react";

// 할 일(Todo) 하나의 타입 정의
interface TodoItem {
  todoId: number; // 각 할 일의 고유 ID (Date.now()로 생성)
  todoText: string; // 할 일 내용
  todoDone: boolean; // 완료 여부 (true면 완료)
}

export default function Todo() {
  // 할 일 목록 상태
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  // 입력창 상태
  const [inputValue, setInputValue] = useState("");

  // 할 일 목록을 localStorage에 저장하는 함수
  function saveTodosToStorage(todos: TodoItem[]) {
    localStorage.setItem("myTodos", JSON.stringify(todos));

    // 캘린더 일정에도 반영 (아래는 캘린더와 연동하는 예시)
    const calendarKey = "calendarSchedules";
    const existingSchedules = JSON.parse(
      localStorage.getItem(calendarKey) || "[]"
    );

    // 오늘 날짜 문자열 만들기
    const today = new Date();
    const todayStr = today.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // 오늘의 할 일들을 캘린더 일정 형태로 변환
    const todaySchedules = todos.map((todo) => ({
      id: todo.todoId,
      date: todayStr,
      category: "todo",
      content: todo.todoText,
    }));

    // 기존 일정 중에서 "todo"가 아닌 것만 남기고, 오늘 할 일 추가
    const mergedSchedules = [
      ...existingSchedules.filter((item: any) => item.category !== "todo"),
      ...todaySchedules,
    ];

    localStorage.setItem(calendarKey, JSON.stringify(mergedSchedules));

    // 캘린더 갱신을 위해 커스텀 이벤트 발생
    window.dispatchEvent(new Event("updateCalendar"));
  }

  // 컴포넌트가 처음 렌더링될 때 localStorage에서 할 일 목록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("myTodos");
    if (saved) {
      setTodoList(JSON.parse(saved));
    }
  }, []);

  // 할 일 삭제 함수
  function handleDeleteTodo(id: number) {
    // 해당 ID가 아닌 것만 남기기
    const newTodos = todoList.filter((todo) => todo.todoId !== id);
    setTodoList(newTodos);
    saveTodosToStorage(newTodos);
  }

  // 할 일 완료/취소 토글 함수
  function handleToggleTodo(id: number) {
    const newTodos = todoList.map((todo) =>
      todo.todoId === id ? { ...todo, todoDone: !todo.todoDone } : todo
    );
    setTodoList(newTodos);
    saveTodosToStorage(newTodos);
  }

  // 할 일 추가 함수
  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    // 입력값이 비어있으면 추가하지 않음
    if (!inputValue.trim()) return;

    const newTodo: TodoItem = {
      todoId: Date.now(), // 현재 시각을 ID로 사용
      todoText: inputValue.trim(),
      todoDone: false,
    };

    const updatedList = [...todoList, newTodo];
    setTodoList(updatedList);
    saveTodosToStorage(updatedList);
    setInputValue(""); // 입력창 비우기
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

            {/* 말풍선 꼬리 */}
            <span
              className={`absolute top-[10px] -right-2 w-0 h-0 border-b-[16px] border-b-transparent border-l-[16px] ${
                todo.todoDone ? "border-l-[#eaeaea]" : "border-l-[#fee54d]"
              }`}
            ></span>

            {/* 삭제 버튼 */}
            <span
              onClick={(e) => {
                e.stopPropagation(); // 부모 클릭 이벤트 막기
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
          className="w-[240px] h-[45px] text-lg px-3 rounded-bl-[10px] outline-none border-none"
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
