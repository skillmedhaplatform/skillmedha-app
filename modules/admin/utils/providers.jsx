import StoreProvider from "@/redux/storeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import React from "react";

export default function Providers({ children }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 16,
            colorPrimary: "#1E69DA",
            colorBorder: "#e2e8f0",
            colorPrimaryHover: "#1150b3",
            controlHeight: 38,
            borderRadius: 8,
            borderRadiusLG: 12,
          },
          components: {
            Modal: {
              colorBgMask: "rgba(40, 40, 40, 0.6)",
              headerBg: "transparent",
            },
            Button: {
              defaultHoverBg: "#1E69DA",
              defaultHoverColor: "#fff",
              borderRadius: 8,
            },
            Input: {
              borderRadius: 8,
              colorBorder: "#cbd5e1",
            },
            Select: {
              borderRadius: 8,
              colorBorder: "#cbd5e1",
            },
            Table: {
              headerBg: "#EFF5FB",
              headerColor: "#1E69DA",
              headerBorderRadius: 8,
              rowHoverBg: "#f8fafc",
            },
          },
        }}
      >
        <App>
          <StoreProvider>{children}</StoreProvider>
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
