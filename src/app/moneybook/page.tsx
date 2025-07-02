"use client";
import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Charts from "@/components/common/Charts";

interface Account {
  id: string;
  date: string;
  amount: number;
  category: string;
  memo: string;
  type: "income" | "expense";
}

const ACCOUNTS_KEY = "accounts";

export default function MoneyBookPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // 1) 거래 내역 상태 & 로드 완료 플래그
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 2) 마운트 시 로컬스토리지에서 복원
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
      try {
        setAccounts(JSON.parse(raw));
      } catch {
        console.warn("accounts 파싱 실패");
      }
    }
    setIsLoaded(true);
  }, []);

  // 3) accounts가 바뀔 때, 복원 완료 후에만 로컬스토리지에 저장
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts, isLoaded]);

  // 4) 프로필 가져오기
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

  // 5) 월 선택
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };
  const [month, setMonth] = useState(getCurrentMonth());

  // 6) 폼 토글 & 입력 상태
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Account, "id">>({
    date: "",
    amount: 0,
    category: "",
    memo: "",
    type: "expense",
  });

  // 6-1) 편집 중인 ID
  const [editingId, setEditingId] = useState<string | null>(null);

  // 7) 카테고리 옵션
  const expenseCategories = [
    "주거",
    "식비",
    "문화생활",
    "모임",
    "쇼핑",
    "기타",
  ];
  const incomeCategories = ["근로소득", "이자소득", "정책지원금", "기타"];

  // 8) 입력 핸들러
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

  // 9) 내역 추가
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // 수정 모드
      setAccounts((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? { id: editingId, ...form } // 폼 데이터를 그대로 덮어쓰기
            : e
        )
      );
    } else {
      // — 추가(add) 모드
      setAccounts((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    }
    // 공통: 폼 초기화
    setShowForm(false);
    setForm({ date: "", amount: 0, category: "", memo: "", type: form.type });
    setEditingId(null); // 수정 모드 리셋
  };

  // 9-1) 내역 수정
  const handleRemove = (id: string) => {
    const entry = accounts.find((e) => e.id === id);
    if (!entry) return;

    // 폼에 채우기
    setForm({
      date: entry.date,
      amount: entry.amount,
      category: entry.category,
      memo: entry.memo,
      type: entry.type,
    });
    setEditingId(id); // 여기에 편집 대상 ID 기록
    setShowForm(true);
  };

  // 9-2) 내역 삭제 (handleDelete)
  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setAccounts((prev) => prev.filter((e) => e.id !== id));
  };
  // 10) 총계 계산
  const totalIncome = accounts
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = accounts
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  // 예시: 항상 “수입” 차트를 표시하고 싶다면
  const chartView: "income" | "expense" = "income";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 헤더 */}
      <header className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src="/chick.png" className="w-10 h-10 rounded-full" />
          <span className="font-medium text-lg">{userName}님</span>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </header>

      {/* 요약 카드 */}
      <section className="grid grid-cols-2 gap-4 mb-6">
        {/* 총 수입 */}
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">총 수입</p>
          </div>

          <p className="mt-1 text-2xl font-bold">
            {totalIncome.toLocaleString()}원
          </p>
          <p className="text-xs text-gray-400">
            잔액 {balance.toLocaleString()}원
          </p>
        </div>
        {/* 총 지출 */}
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">총 지출</p>
          </div>
          <p className="mt-1 text-2xl font-bold">
            {totalExpense.toLocaleString()}원
          </p>
        </div>
      </section>

      {/* ─── 수입/지출 차트 가로 정렬 ─── */}
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
        onClick={() => setShowForm(!showForm)}
        className="mb-6 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
      >
        {showForm ? "폼 닫기" : "내역 추가하기"}
      </button>

      {/* 내역 추가 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded-lg shadow space-y-4"
        >
          <div className="flex space-x-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`flex-1 py-1 rounded ${
                  form.type === t
                    ? t === "expense"
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
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
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="amount"
            value={form.amount || ""}
            onChange={handleChange}
            placeholder="금액"
            className="w-full border p-2 rounded"
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
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
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            저장하기
          </button>
        </form>
      )}

      {/* 상세 내역 리스트 */}
      <section className="space-y-4">
        {accounts.map((entry) => (
          <div
            key={entry.id}
            className="flex justify-between items-center p-3 bg-white rounded-lg shadow"
          >
            {/* 왼쪽: 날짜/카테고리/메모 */}
            <div>
              <p className="text-sm text-gray-500">
                {format(new Date(entry.date), "yyyy-MM-dd")}
              </p>
              <p className="font-medium text-gray-700">
                [{entry.category}] {entry.memo}
              </p>
            </div>
            {/* 오른쪽: 금액과 삭제를 세로로 정렬 */}
            <div className="flex flex-low items-end min-w-[120px]">
              <p
                className={`font-semibold pr-7 ${
                  entry.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {entry.type === "income" ? "+" : "-"}
                {entry.amount.toLocaleString()}원
              </p>
              <button
                className="text-gray-400 pr-1.5 text-sm hover:text-blue-500 mt-1"
                onClick={() => handleRemove(entry.id)}
              >
                수정
              </button>
              <button
                className="text-gray-400 text-sm hover:text-red-500 mt-1"
                onClick={() => handleDelete(entry.id)}
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
