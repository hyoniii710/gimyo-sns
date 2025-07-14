"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Charts from "@/components/common/Charts";
import Image from "next/image";

interface Account {
  id: string;
  date: string;
  amount: number;
  category: string;
  memo: string;
  type: "income" | "expense";
}

//localStorage의 "accounts" Key에 저장될 거래내역 타입 상수로 선언
const ACCOUNTS_KEY = "accounts";

export default function MoneyBookPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // 유저 이름 불러오기
  const [userName, setUserName] = useState("회원");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push("/auth/login");
      supabase
        .from("user_profiles")
        .select("name")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => setUserName(data?.name ?? "회원"));
    });
  }, [supabase, router]);

  //1. 거래내역 상태관리
  const [accounts, setAccounts] = useState<Account[]>([]);

  //2. 폼 열림/닫힘 토글
  const [showForm, setShowForm] = useState(false);

  // 복원 완료 여부 (로컬스토리지)
  const [isLoaded, setIsLoaded] = useState(false);

  //useEffect로 불러오기
  useEffect(() => {
    // 컴포넌트가 처음 렌더링될 때(localStorage에서 데이터 불러옴)
    if (typeof window === "undefined") return; // 서버 사이드 렌더링에서는 로컬스토리지 접근 불가
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
      try {
        setAccounts(JSON.parse(raw));
        setIsLoaded(true); // 데이터가 로드되었음을 표시
      } catch {
        console.log("accounts 데이터 파싱 실패");
        setIsLoaded(true);
      }
    } else {
      // raw가 없을 때에도 저장 이펙트 발동을 막기 위해 false→true로 바꿔줍니다
      setIsLoaded(true);
    }
  }, []); //빈 배열을 의존성으로 주어 컴포넌트가 처음 렌더링될 때만 실행

  //useEffect로 accounts가 바뀔때 로컬스토리지에 저장하기
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return; // 로컬스토리지 접근 전 isLoaded가 true인지 확인
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts, isLoaded]); // accounts가 바뀔 때마다 로컬스토리지에 저장

  //2-1. 폼 입력값 상태
  const [form, setForm] = useState<Omit<Account, "id">>({
    date: "",
    amount: 0,
    category: "",
    memo: "",
    type: "expense",
  });

  //3. 카테고리 옵션
  const expenseCategories = [
    "주거",
    "식비",
    "문화생활",
    "모임",
    "쇼핑",
    "기타",
  ];
  const incomeCategories = [
    "용돈",
    "근로소득",
    "이자소득",
    "정책지원금",
    "기타",
  ];

  const [editingId, setEditingId] = useState<string | null>(null);

  // handleEditInit : 수정할 데이터를 폼에 불러와서 "수정 모드로 진입"시키는 함수
  const handleEditInit = (id: string) => {
    // 수정할 거래내역의 ID를 찾고 변수 e에 저장
    const e = accounts.find((a) => a.id === id);
    if (!e) return;

    // 찾은 거래내역의 각 값을 form 상태에 채워넣는다
    setForm({
      date: e.date,
      amount: e.amount,
      category: e.category,
      memo: e.memo,
      type: e.type,
    });
    setEditingId(id); // setEditing상태에 현재 수정 중인 거래 내역의 id를 저장한다.
    setShowForm(true); // form을 화면에 보이게 열어준다.
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "amount" && !/^\d*$/.test(value)) {
      alert("숫자만 입력하세요");
      return;
    }
    setForm((f) => ({
      ...f,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 수정 모드 : editingId가 있으면 해당 id의 내역을 수정
    if (editingId) {
      setAccounts((prev) =>
        // id가 editingId와 같은 내역을 찾아서 form의 값으로 업데이트, 다르면 그대로 유지
        prev.map((a) => (a.id === editingId ? { id: editingId, ...form } : a))
      );
    } else {
      // editingId가 없으면 새로 추가
      setAccounts((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    }

    setShowForm(false);
    setForm((f) => ({
      date: "",
      amount: 0,
      category: "",
      memo: "",
      type: f.type,
    }));
    setEditingId(null); // editingId 초기화(수정 모드 종료)
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // 요약 카드 계산 (총 수입 - 총 지출 = 잔액 표시)
  const totalIncome = accounts
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + e.amount, 0);

  const totalExpense = accounts
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex justify-between mb-4">
        <div className="relative flex items-center gap-2">
          <Image
            src="/chick2.png"
            alt="사용자 프로필"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
          <span className="font-medium text-lg">{userName}님</span>
        </div>
      </header>

      {/* 요약 카드 자리 */}
      <section className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">총 수입</p>
          <p className="mt-1 text-2xl font-bold">
            {totalIncome.toLocaleString()}원
          </p>
          <p className="text-xs text-gray-400">
            잔액 {balance.toLocaleString()}원
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">총 지출</p>
          <p className="mt-1 text-2xl font-bold">
            {totalExpense.toLocaleString()}원
          </p>
        </div>
      </section>

      {/* 차트 자리 */}
      <section className="mb-8 flex flex-col md:flex-row gap-8">
        {/* 수입 차트 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">수입 카테고리별</h3>
          <Charts
            accounts={accounts}
            view="income"
            height={240}
            outerRadius={80}
            innerRadius={40}
          />
        </div>

        {/* 지출 차트 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">지출 카테고리별</h3>
          <Charts
            accounts={accounts}
            view="expense"
            height={240}
            outerRadius={80}
            innerRadius={40}
          />
        </div>
      </section>

      {/* 내역 추가 버튼 */}
      <button
        className="mb-6 w-full bg-yellow-500 text-white py-2 rounded"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "폼 닫기" : "내역 추가하기"}
      </button>

      {/* 내역 입력 폼 */}
      {showForm && (
        <form
          className="mb-6 bg-white p-4 rounded-lg shadow space-y-4"
          onSubmit={handleSubmit}
        >
          {/* 수입/지출 선택 */}
          <div className="flex space-x-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`flex-1 py-1 rounded
                    ${
                      form.type === t
                        ? t === "expense"
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    } `}
              >
                {t === "expense" ? "지출" : "수입"}
              </button>
            ))}
          </div>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="amount"
            value={form.amount || ""}
            onChange={handleChange}
            placeholder="금액"
            required
            className="w-full border p-2 rounded"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">카테고리 선택</option>
            {(form.type === "expense"
              ? expenseCategories
              : incomeCategories
            ).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            name="memo"
            rows={2}
            value={form.memo}
            onChange={handleChange}
            placeholder="메모"
            className="w-full border p-2 rounded resize-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            저장하기
          </button>
        </form>
      )}

      {/* 내역 리스트 */}
      <section className="space-y-4">
        {accounts.map((entry) => (
          <div
            key={entry.id}
            className="flex justify-between items-center p-3 bg-white rounded-lg shadow"
          >
            <div>
              <p className="text-sm text-gray-500">{entry.date}</p>
              <p className="font-medium text-gray-700">
                [{entry.category}] {entry.memo}
              </p>
            </div>
            <div className="flex items-center">
              <p
                className={`font-semibold ${entry.type === "income" ? "text-green-600" : "text-red-600"} mr-15`}
              >
                {entry.type === "income" ? "+" : "-"}
                {entry.amount.toLocaleString()}원
              </p>
              <button
                onClick={() => handleEditInit(entry.id)}
                className="text-sm text-gray-400 hover:text-blue-500 mr-2"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-sm text-gray-400 hover:text-red-500"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
