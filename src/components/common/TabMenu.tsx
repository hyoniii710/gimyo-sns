"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

const tabs = [
  { name: "Home", href: "/home" },
  { name: "Diary", href: "/diary" },
  { name: "MoneyBook", href: "/moneybook" },
];

export default function TabMenu() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setIsAuthenticated(true);
        console.log("👀 클라이언트 세션:", data.session);
      }
      setLoading(false); // 세션 확인 완료 후 로딩 종료
    };
    fetchSession();
  }, []);

  if (loading) return null; // 세션 확인 전까지는 아무 것도 렌더링하지 않음

  return (
    <nav className="flex space-x-2 mb-6">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);

        return isAuthenticated ? (
          <Link
            key={tab.name}
            href={tab.href}
            className={`px-4 py-2 text-sm border border-b-0 rounded-t-md ${
              isActive
                ? "bg-white text-black font-semibold border-gray-300"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200"
            }`}
          >
            {tab.name}
          </Link>
        ) : (
          <span
            key={tab.name}
            className="px-4 py-2 text-sm border border-b-0 rounded-t-md bg-gray-200 text-gray-400 cursor-not-allowed"
            title="로그인 후 이용 가능합니다"
          >
            {tab.name}
          </span>
        );
      })}
    </nav>
  );
}
