import { ReactNode } from "react";
import "../styles/globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <body className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto mt-8">
          {/* 탭 메뉴 위치 변경 */}
          {children}
        </div>
      </body>
    </html>
  );
}
