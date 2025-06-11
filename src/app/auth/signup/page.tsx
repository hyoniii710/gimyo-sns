"use client"; // 클라이언트 컴포넌트로 사용

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function SignUpPage() {
  const router = useRouter();

  //회원가입 폼의 각 입력값을 상태로 관리한다. 초기값은 모두 빈 문자열
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    gender: "male", // 성별 male, female로 저장
    phone: "",
  });

  // 로딩 상태를 관리하여 회원가입 처리 중에는 버튼을 비활성화한다.
  const [isLoading, setIsLoading] = useState(false);

  // Supabase 클라이언트 생성 : 브라우저 환경에서 Supabase 클라이언트를 생성한다.
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 폼 입력값 변경 함수 : 입력 필드 값이 변경될때마다 form 상태를 업데이트하는 함수
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 폼 제출 함수 :폼 제출 시 기본 동작을 막고, 로딩 상태를 true로 변경한다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. 회원가입
      // Supabase의 인증 기능을 사용해 회원가입 요청을 보냄
      // 에러 발생 시 예외를 던진다.
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;

      // 2. user_profiles에 추가 정보 저장
      // 회원가입이 성공하면 user_profiles 테이블에 추가 정보를 저장한다.
      if (data.user) {
        const { error: profileError } = await supabase
          // 쿼리 결과에서 error를 profileError라는 이름으로 할당.
          .from("user_profiles")
          .insert({
            id: data.user.id,
            name: form.name,
            age: Number(form.age),
            gender: form.gender,
            phone: form.phone,
          });
        if (profileError) throw profileError;
        alert("회원가입이 완료되었습니다!");
        router.push("/login"); // 회원가입 성공 후 로그인 페이지로 이동
      }
    } finally {
      setIsLoading(false); // 무조건 로딩 종료
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-md border">
      {/* 상단 탭 */}
      {/* <div className="flex mb-6">
        <button className="px-4 py-2 border rounded-tl-lg border-b-0 bg-gray-100">
          Home
        </button>
        <button className="px-4 py-2 border-t border-b-0 bg-gray-100">
          Diary
        </button>
        <button className="px-4 py-2 border-t border-b-0 border-r rounded-tr-lg bg-white font-bold">
          MoneyBook
        </button>
      </div> */}
      {/* 하트 아이콘 */}
      <div className="flex justify-center my-4">
        <span className="text-4xl text-green-600">♥</span>
      </div>
      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded w-full"
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded w-full"
        />
        <input
          name="name"
          type="text"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded w-full"
        />
        {/* 성별 라디오 */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={form.gender === "female"}
              onChange={handleChange}
              className="mr-1"
            />
            여자
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={form.gender === "male"}
              onChange={handleChange}
              className="mr-1"
            />
            남자
          </label>
        </div>
        <input
          name="age"
          type="text"
          placeholder="생년월일(yy-mm-dd)"
          value={form.age}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded w-full"
        />
        <input
          name="phone"
          type="text"
          placeholder="전화번호(-생략)"
          value={form.phone}
          onChange={handleChange}
          required
          className="border px-4 py-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "처리 중..(~˘▾˘)~" : "Join"}
        </button>
        <button
          type="button"
          className="bg-blue-200 text-blue-900 px-4 py-2 rounded w-full hover:bg-blue-300"
          onClick={() => router.back()}
        >
          Back
        </button>
      </form>
    </div>
  );
}
