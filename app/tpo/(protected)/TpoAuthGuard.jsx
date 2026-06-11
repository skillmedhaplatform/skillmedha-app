"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "@bprogress/next/app";
import { usePathname, useSearchParams } from "next/navigation";
import { GetOneUser } from "@/redux/slices/tpo/userSlice";
import { getDashboardStats } from "@/redux/slices/tpo/dashboardStatsSlice";
import { getLstorage } from "@/utils/universalUtils/windowMW";

export default function TpoAuthGuard({ children }) {
  const dispatch = useDispatch();
  const nav = useRouter();
  const currPath = usePathname();
  const searchParams = useSearchParams();
  const [appReady, setAppReady] = useState(false);

  const userStatus = useSelector(
    (state) => state.user?.UserDetails?.status
  );

  const token = getLstorage("token") || searchParams.get("token");
  const userId = getLstorage("userId") || searchParams.get("userId");

  useEffect(() => {
    if (!token || !userId) {
      nav.replace("/tpo/login");
      return;
    }
    if (!currPath.split("/")[2]) {
      nav.replace("/tpo/myprofile/personal");
      return;
    }
    Promise.all([
      dispatch(GetOneUser()),
      dispatch(getDashboardStats()),
    ]).finally(() => {
      setAppReady(true);
    });
  }, [token]);

  if (!token || !userId) return null;

  if (!appReady || userStatus === "pending" || userStatus === "idle") {
    return (
      <div style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        background: "#ffffff",
      }}>
        <div style={{
          width: "270px",
          minWidth: "270px",
          height: "100vh",
          background: "#ffffff",
          borderRight: "0.8px solid #e2e8f0",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          <div style={{
            height: "36px",
            borderRadius: "8px",
            background: "#f1f5f9",
            width: "80%",
            animation: "tpoShimmer 1.5s infinite",
          }}/>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              height: "40px",
              borderRadius: "8px",
              background: "#f1f5f9",
              animation: "tpoShimmer 1.5s infinite",
              animationDelay: `${i * 0.1}s`,
            }}/>
          ))}
        </div>
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          gap: "16px",
        }}>
          <div style={{
            height: "80px",
            borderRadius: "12px",
            background: "#f1f5f9",
            animation: "tpoShimmer 1.5s infinite",
          }}/>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "12px",
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: "90px",
                borderRadius: "12px",
                background: "#f1f5f9",
                animation: "tpoShimmer 1.5s infinite",
                animationDelay: `${i * 0.1}s`,
              }}/>
            ))}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: "200px",
                borderRadius: "12px",
                background: "#f1f5f9",
                animation: "tpoShimmer 1.5s infinite",
                animationDelay: `${i * 0.15}s`,
              }}/>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes tpoShimmer {
            0%   { opacity: 1; }
            50%  { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
