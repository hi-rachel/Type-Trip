import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Type Trip",
  description:
    "여행, 나다운 방식으로! 캐릭터로 알아보는 나만의 여행 성향 테스트",
  openGraph: {
    title: "Type Trip",
    description:
      "여행, 나다운 방식으로! 캐릭터로 알아보는 나만의 여행 성향 테스트",
    url: "https://type-trip.vercel.app/",
    type: "website",
    images: [
      {
        url: "/images/og.png",
        width: 1200,
        height: 630,
        alt: "Type Trip 오픈그래프 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Type Trip",
    description: "당신의 여행 성향을 찾아주는 캐릭터 기반 테스트",
    images: ["/images/og.png"],
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
