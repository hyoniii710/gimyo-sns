// src/app/auth/layout.tsx
import { ReactNode } from "react";
import "../../styles/globals.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
