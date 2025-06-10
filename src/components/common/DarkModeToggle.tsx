import { useState } from "react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  return (
    <button onClick={() => setIsDark(!isDark)}>
      {isDark ? "라이트 모드" : "다크 모드"}
    </button>
  );
}
