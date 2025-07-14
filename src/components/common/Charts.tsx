"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Account {
  id: string;
  date: string;
  amount: number;
  category: string;
  memo: string;
  type: "income" | "expense";
}

interface ChartsProps {
  accounts: Account[];
  view: "income" | "expense";
  height?: number; // optional height 조정용
  outerRadius?: number;
  innerRadius?: number;
}

export default function Charts({
  accounts,
  view,
  height = 300,
  outerRadius = 80,
  innerRadius = 40,
}: ChartsProps) {
  // useMemo(()=>{},[]) : 배열 안의 값이 바뀔 때만 함수가 다시 실행됨
  const data = useMemo(() => {
    const filtered = accounts.filter((a) => a.type === view);

    const totals = filtered.reduce<Record<string, number>>(
      (acc, { category, amount }) => {
        // 해당 카테고리에 이전 합계가 있으면 더하고, 없으면 0으로 치환 후 더함.
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      },
      {} // 초기값 {}(빈 객체)에서 시작.
    );
    // Object.entries() : [key, value] 쌍의 객체를 배열로 바꿔준다.
    // [ ["식비", 30000], ["쇼핑", 50000] ] 카테고리와 합계 금액을 한 쌍으로 묶은 배열이 됨.
    // result [ { name: "식비", value: 30000 }, { name: "쇼핑", value: 50000 } ]
    // 객체가 담긴 배열로 다시 반환
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [accounts, view]);
  /*
    accounts나 view 값이 바뀔 때마다 useMemo 안의 코드가 실행되어,
    그 결과는
    [ { name: "식비", value: 30000 }, { name: "쇼핑", value: 50000 } ]
    형태의 객체가 담긴 배열로 만들어져 data 변수에 저장된다.
  */

  //각각 수입/지출 항목 색상을 6가지씩 준비.
  const INCOME_COLORS = [
    "#3B82F6", // 파랑 (blue-500)
    "#10B981", // 초록 (emerald-500)
    "#8B5CF6", // 보라 (violet-500)
    "#2563EB", // 진파랑 (blue-600)
    "#22C55E", // 연초록 (green-500)
    "#7C3AED", // 진보라 (purple-700)
  ];

  const EXPENSE_COLORS = [
    "#EC4899", // 핑크 (pink-500)
    "#F87171", // 연빨강 (red-400)
    "#FBBF24", // 노랑 (yellow-400)
    "#F59E0B", // 주황 (orange-400)
    "#EF4444", // 진빨강 (red-500)
    "#D97706", // 진주황 (amber-600)
  ];
  if (data.length === 0) {
    return (
      <p className="text-center text-gray-500">표시할 데이터가 없습니다.</p>
    );
  }

  const COLORS = view === "income" ? INCOME_COLORS : EXPENSE_COLORS;

  return (
    <div style={{ height }} className="w-full bg-white rounded-lg shadow p-4">
      {/* ResponsiveContainer: 부모 크기에 맞춰 차트를 자동으로 리사이징. */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Recharts에서 파이차트의 한 조각(전체 파이)을 그리는 컴포넌트 
           - Recharts가 data를 반복해주기 때문에 label 함수에서는 그냥 entry만 받아서 사용하면 됨.
          */}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            label={(entry) =>
              `${((entry.value! / data.reduce((s, e) => s + e.value, 0)) * 100).toFixed(0)}%`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => v.toLocaleString() + "원"} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
