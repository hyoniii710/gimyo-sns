// src/components/todo/Todo.tsx
"use client";

import { useState, useEffect } from "react";

interface Todo {
  todoId: number;
  todoText: string;
  todoDone: boolean;
}

export default function Todo() {
  const [todoArr, setTodoArr] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  // 저장!
  const saveTodos = (todos: TodoType[]) => {
    localStorage.setItem("myTodos", JSON.stringify(todos));
  };

  // 불러오기!
  useEffect(() => {
    const saved = localStorage.getItem("myTodos");
    if (saved) {
      setTodoArr(JSON.parse(saved));
    }
  }, []);

  // 삭제
  const deleteTodo = (id: number) => {
    const newTodos = todoArr.filter((todo) => todo.todoId !== id);
    setTodoArr(newTodos);
    saveTodos(newTodos);
  };

  // 완료/취소 토글
  const toggleTodo = (id: number) => {
    const newTodos = todoArr.map((todo) =>
      todo.todoId === id ? { ...todo, todoDone: !todo.todoDone } : todo
    );
    setTodoArr(newTodos);
    saveTodos(newTodos);
  };

  // 추가
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTodo: TodoType = {
      todoId: Date.now(),
      todoText: inputValue.trim(),
      todoDone: false,
    };
    const updated = [...todoArr, newTodo];
    setTodoArr(updated);
    saveTodos(updated);
    setInputValue("");
  };

  return (
    <div className="w-[320px] h-[568px] border-[3px] border-black rounded-[16px] bg-[#abc1d1] p-3 relative">
      <h1 className="flex justify-center items-center gap-2 text-center text-black text-2xl border-b border-gray-300 mb-3">
        <p>🍀</p>
        <p className="font-bold">TO DO LIST</p>
        <p>🍀</p>
      </h1>

      {/* 리스트 */}
      <ul className="max-h-[420px] overflow-auto space-y-3 pr-2">
        {todoArr.map((todo) => (
          <li
            key={todo.todoId}
            onClick={() => toggleTodo(todo.todoId)}
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
                e.stopPropagation();
                deleteTodo(todo.todoId);
              }}
              className="absolute left-[-20px] bottom-[2px] w-4 h-4 flex items-center justify-center rounded-full bg-[#eaeaea] text-xs"
            >
              ✕
            </span>
          </li>
        ))}
      </ul>

      {/* 입력창 */}
      <form
        onSubmit={addTodo}
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
