import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { ConfigProvider } from "antd";
import StoreProvider from "./redux/storeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Test Portal",
  description: "SkillMedha test portal",
};

export default function RootLayout({ children }) {
  return (
    <StoreProvider>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 16,
            colorPrimary: "#27ae60",
            colorBorder: "#808080",
            colorPrimaryHover: "#39af6aff",
            controlHeight: 38,
          },
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <div className={inter.className} style={{ height: "100vh" }}>
            {children}
          </div>
        </Suspense>
      </ConfigProvider>
    </StoreProvider>
  );
}
