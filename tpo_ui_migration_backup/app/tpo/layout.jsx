import StoreProvider from "@/redux/tpoProvider";
import { ConfigProvider } from "antd";
import Providers from "@/utils/universalUtils/progressloading";
import { Suspense } from "react";
import TpoSessionBridge from "@/modules/tpo/components/TpoSessionBridge";

export default function RootLayout({ children }) {
  return (
    <StoreProvider>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 16,
            colorPrimary: "#24A058",
            colorPrimaryHover: "#1e8749",
            colorPrimaryActive: "#1b7b43",
            colorBorder: "#cbd5e0",
            controlHeight: 38,
            borderRadius: 8,
          },
          components: {
            Button: {
              controlHeight: 38,
              borderRadius: 8,
              fontWeight: 600,
            }
          }
        }}
      >
        <Providers>
          <Suspense fallback={null}>
            <TpoSessionBridge>
              {children}
            </TpoSessionBridge>
          </Suspense>
        </Providers>
      </ConfigProvider>
    </StoreProvider>
  );
}
