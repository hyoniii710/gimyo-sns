"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  // 로그인 폼의 입력값(이메일, 비밀번호)을 상태로 관리.
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // 로딩 상태를 관리.
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();
  // 입력값 변경 핸들러: 입력 필드 값이 변경될 때마다 상태를 업데이트.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 폼 제출 핸들러: 로그인 요청을 처리.
  const handleSubmit = async (e: React.FormEvent) => {
    // 폼 제출 시 기본 동작을 막고, 로딩 상태를 true로 변경.
    e.preventDefault();
    setIsLoading(true);

    // Supabase 인증 기능을 사용해 로그인 요청을 보냄.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      alert(error.message);
    } else if (data.user) {
      alert("반갑습니다! 로그인 성공!");
      // router.push("/home");
      router.replace("/home");
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-md border">
      {/* 환영 메시지 */}
      <div className="text-center text-green-700 text-xl font-semibold mb-2">
        GIMYO BLOG에 오신것을 환영합니다.
      </div>
      {/* 하트 아이콘 */}
      <div className="flex justify-center my-4">
        <span className="text-5xl text-green-800">♥</span>
      </div>
      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded w-full"
        />
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "처리 중..(~˘▾˘)~" : "Login"}
        </button>
        <button
          type="button"
          className="bg-blue-200 text-blue-900 px-4 py-2 rounded w-full hover:bg-blue-300"
          onClick={() => router.push("/auth/signup")}
        >
          Join
        </button>
      </form>
    </div>
  );
}
