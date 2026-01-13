import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Purchase ERP - 구매관리시스템",
  description: "효율적인 구매 프로세스 관리를 위한 통합 ERP 시스템",
};

/**
 * Application root layout that wraps pages with global providers, fonts, and necessary scripts.
 *
 * Renders an <html lang="ko"> document, injects the Daum Postcode script, applies configured font CSS variables,
 * and wraps `children` with the `AuthProvider` to enable global authentication state and the `useAuth()` hook.
 *
 * @param children - The page content to render inside the root layout
 * @returns The root HTML element containing head and body with applied providers and scripts
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 다음 우편번호 서비스 */}
        <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}