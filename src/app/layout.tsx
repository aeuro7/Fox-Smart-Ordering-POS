import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import Navbar from './components/Navbar';

const sarabun = Sarabun({
  subsets: ['thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "ระบบพิมพ์ใบเสร็จ/ใบเสนอราคา",
  description: "ระบบพิมพ์ใบเสร็จและใบเสนอราคาเป็น PDF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sarabun`}>
        {/* <Navbar /> */}
        <main>{children}</main>
      </body>
    </html>
  );
}
