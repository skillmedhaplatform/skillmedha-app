"use client";
import StoreProvider from "@/redux/provider";
import { ConfigProvider, App as AntdApp } from "antd";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Suspense } from "react";
import { ProgressProvider } from '@bprogress/next/app';

const antdTheme = {
  token: {
    colorPrimary: "#1E69DA",
    colorInfo: "yellow",
    notificationHoverBg: "#1E69DA",
    colorBgSolidHover: "#1E69DA",
  },
  components: {
    Modal: {
      colorBgMask: "rgba(40, 40, 40, 0.6)",
      headerBg: "transparent",
    },
    Button: {
      defaultHoverBg: "#1E69DA",
      defaultHoverColor: "#fff",
    },
    Select: {
      colorBgContainer: "transparent",
    },
    Menu: {
      itemColor: "#000",
      itemHoverBg: "transparent",
      itemHoverColor: "inherit",
    },
  },
};

export default function Providers({ children }) {
  return (
    <StoreProvider>
      <ConfigProvider theme={antdTheme}>
        <AntdApp>
          <Suspense fallback={<p>Loading</p>}>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
              <ProgressProvider
                height="3px"
                color="linear-gradient(to right, #1E69DA, #5694F0)"
                options={{ showSpinner: false }}
                shallowRouting
              >
                {children}
              </ProgressProvider>
            </AppRouterCacheProvider>
          </Suspense>
        </AntdApp>
      </ConfigProvider>
    </StoreProvider>
  );
}
