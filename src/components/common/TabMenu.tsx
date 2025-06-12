"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Home", href: "/home" },
  { name: "Diary", href: "/diary" },
  { name: "MoneyBook", href: "/moneybook" },
];

export default function TabMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 mb-6">
      {/* 상단 탭
      <div className="flex mb-6">
        <button className="px-4 py-2 border rounded-tl-lg border-b-0 bg-gray-100">Home</button>
        <button className="px-4 py-2 border-t border-b-0 bg-gray-100">Diary</button>
        <button className="px-4 py-2 border-t border-b-0 border-r rounded-tr-lg bg-white font-bold">MoneyBook</button>
      </div> */}
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
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
        );
      })}
    </nav>
  );
}
