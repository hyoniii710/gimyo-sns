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
    <nav className="flex mb-6">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.href}
          className={`px-4 py-2 border-t border-l border-r rounded-t-lg ${
            pathname.startsWith(tab.href) ? "bg-white font-bold" : "bg-gray-100"
          }`}
        >
          {tab.name}
        </Link>
      ))}
    </nav>
  );
}
