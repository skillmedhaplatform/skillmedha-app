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
            colorPrimary: "#24A058",
            colorBorder: "#808080",
            colorPrimaryHover: "#1f8f92",
            controlHeight: 38,
          },
          components: {
            Modal: {
              colorBgMask: "rgba(40, 40, 40, 0.6)",
              headerBg: "transparent",
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
