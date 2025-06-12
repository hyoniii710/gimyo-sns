// src/app/home/layout.tsx
import TabMenu from "@/components/common/TabMenu";
import { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TabMenu />
      <main>{children}</main>
    </>
  );
}
