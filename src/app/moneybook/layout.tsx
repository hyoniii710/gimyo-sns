// src/app/moneybook/MoneyBookLayout.tsx
import TabMenu from "@/components/common/TabMenu";
import { ReactNode } from "react";

export default function MoneyBookLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TabMenu />
      <main>{children}</main>
    </>
  );
}
