
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "SkillMedha Platform",
  description: "SkillMedha - Empowering Skills and Placements",
};

import StoreProvider from "@/redux/provider";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
