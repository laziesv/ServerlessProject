import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบ To-do List | ENG23 3074",
  description: "เว็บแอปหน้าเดียวสำหรับจัดการงาน เพิ่ม ลบ แก้ไข และติดตามสถานะ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
