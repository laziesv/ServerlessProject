import type { Metadata } from "next";
// 1. นำเข้า Anuphan แทน Geist
import { Anuphan } from "next/font/google";
import "./globals.css";

// 2. ตั้งค่าฟอนต์ Anuphan
const thaiFont = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-anuphan",
});

export const metadata: Metadata = {
  title: "TaskNature - จัดการงานอย่างเป็นธรรมชาติ",
  description: "ระบบจัดการงานที่เรียบง่ายและสวยงาม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th" // ปรับเป็นภาษาไทย
      className={`${thaiFont.variable} h-full antialiased`}
    >
      <body className={`${thaiFont.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}