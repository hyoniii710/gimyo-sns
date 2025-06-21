// src/app/home/DiaryLayout.tsx
import TabMenu from "@/components/common/TabMenu";
import { ReactNode } from "react";
import "@/styles/globals.css";

export default function DiaryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TabMenu />
      <main>{children}</main>
    </>
  );
}
