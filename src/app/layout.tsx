import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vòng Quay Lựa Chọn - Ăn Gì, Uống Gì, Đi Đâu Chơi?",
  description: "Trợ thủ đắc lực giúp bạn nhanh chóng chọn ngẫu nhiên các món ăn, thức uống, địa điểm giải trí hoặc tùy chỉnh danh mục của riêng mình.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
