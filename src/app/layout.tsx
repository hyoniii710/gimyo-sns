import "../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-black dark:bg-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
