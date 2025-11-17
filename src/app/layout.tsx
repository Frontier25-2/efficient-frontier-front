import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "AI 자산배분 분석 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#f9fafb]">
        <Header />
        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}