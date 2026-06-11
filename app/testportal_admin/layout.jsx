import StoreProvider from "@/redux/testportalProvider";
import { ConfigProvider } from "antd";
import Providers from "@/utils/universalUtils/progressloading";
import { Suspense } from "react";
import "./testportal-globals.css";
import "./page.css";

export const metadata = {
  title: "SkillMedha Test Dashboard",
  description: "Test Portal Admin Dashboard for SkillMedha",
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
            colorPrimaryHover: "#27ae60",
            controlHeight: 38,
          },
        }}
      >
        <Providers>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Providers>
      </ConfigProvider>
    </StoreProvider>
  );
}
