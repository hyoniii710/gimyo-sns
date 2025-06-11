// /app/layout.tsx
import TabMenu from "@/components/common/TabMenu";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <body className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 mt-8">
          <TabMenu />
          {children}
        </div>
      </body>
    </html>
  );
}
