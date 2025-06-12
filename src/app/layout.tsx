// src/app/layout.tsx
import TabMenu from "@/components/common/TabMenu";
import { ReactNode } from "react";
import "../styles/globals.css";
import "../styles/globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <body className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto mt-8">
          {/* 탭 메뉴 */}
          <TabMenu />
          {/* 아래 카드 박스 */}
          <div className="bg-white rounded-b shadow border-t-0 border border-gray-200 p-6">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
