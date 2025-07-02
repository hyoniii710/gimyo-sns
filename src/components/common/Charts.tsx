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
  outerRadius?: number; // optional Pie outer radius
  innerRadius?: number; // optional Pie inner radius
}

export default function Charts({
  accounts,
  view,
  height = 300,
  outerRadius = 80,
  innerRadius = 40,
}: ChartsProps) {
  // 1) 해당 타입만 필터링
  const data = useMemo(() => {
    const filtered = accounts.filter((a) => a.type === view);
    const totals = filtered.reduce<Record<string, number>>(
      (acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      },
      {}
    );
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [accounts, view]);

  const INCOME_COLORS = [
    "#10B981",
    "#3B82F6",
    "#0EA5E9",
    "#14B8A6",
    "#22C55E",
    "#2563EB",
    "#06B6D4",
  ];
  const EXPENSE_COLORS = [
    "#EC4899",
    "#A855F7",
    "#E11D48",
    "#F472B6",
    "#DB2777",
    "#C084FC",
    "#F97316",
  ];
  // (선택) 데이터가 없으면 빈 상태 처리
  if (data.length === 0) {
    return (
      <p className="text-center text-gray-500">표시할 데이터가 없습니다.</p>
    );
  }

  const COLORS = view === "income" ? INCOME_COLORS : EXPENSE_COLORS;

  return (
    <div style={{ height }} className="w-full bg-white rounded-lg shadow p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            label={(entry) =>
              `${((entry.value / data.reduce((s, e) => s + e.value, 0)) * 100).toFixed(0)}%`
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
