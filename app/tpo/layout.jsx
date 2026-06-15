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
            colorPrimary: "#6BA8ED",
            colorPrimaryHover: "#1555b0",
            colorPrimaryActive: "#0f3e82",
            colorBorder: "#cbd5e0",
            controlHeight: 38,
            borderRadius: 8,
          },
          components: {
            Button: {
              controlHeight: 38,
              borderRadius: 8,
              fontWeight: 600,
            },
            Tooltip: {
              colorBgSpotlight: "#ffffff",
              colorTextLightSolid: "#6BA8ED",
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
