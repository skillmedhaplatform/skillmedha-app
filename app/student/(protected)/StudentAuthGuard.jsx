"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStudentCreds } from "@/redux/slices/student";
import { getLstorage } from "@/universalUtils/windowMW";
import useSpecialOrg from "@/helpers/useSpecialOrg";
import { getStudentDashboardStats } from "@/redux/slices/studentDashboardStatsSlice";

export default function StudentAuthGuard({ children, serverToken }) {
  const nav = useRouter();
  const currPath = usePathname();
  const { isSpecialOrg, student: studentCreds } = useSpecialOrg();
  const dispatch = useDispatch();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!getLstorage("token")) return;
    if (!studentCreds || Object.keys(studentCreds).length === 0) {
      Promise.all([
        dispatch(getStudentCreds()).then((result) => {
          if (result?.payload?.authError) {
            nav.replace("/login");
            return;
          }
          const data = result?.payload?.data || result?.payload;
          if (!data) return;
          const isSpecialOrgPayload =
            data.orgDetails?.orgId === process.env.NEXT_PUBLIC_SPECIAL_ORG_ID;
          const CUTOFF_DATE = new Date("2026-05-01T00:00:00Z").getTime();
          const isNewUser = !data?.createdAt || new Date(data.createdAt).getTime() >= CUTOFF_DATE;
          const psychometricDone =
            (data?.psychometricTestResults &&
            Object.keys(data.psychometricTestResults).length > 0) || !isNewUser;
          fetch("/api/auth/session", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              verified: data.verified === true,
              isSpecialOrg: isSpecialOrgPayload,
              psychometricDone,
            }),
          });
        }),
        dispatch(getStudentDashboardStats()),
      ]).finally(() => setAppReady(true));
    } else {
      dispatch(getStudentDashboardStats()).finally(() => setAppReady(true));
    }
  }, [studentCreds?._id, dispatch]);

  useEffect(() => {
    if (isSpecialOrg) {
      if (currPath === "/" || currPath === "/student/dashboard" || currPath === "/dashboard") {
        nav.replace("/student/tests");
      }
    } else {
      if (currPath === "/") {
        nav.replace("/dashboard");
      }
    }
  }, [currPath, isSpecialOrg, nav]);

  if (!serverToken) return null;

  if (!appReady) {
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
            animation: "stuShimmer 1.5s infinite",
          }}/>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              height: "40px",
              borderRadius: "8px",
              background: "#f1f5f9",
              animation: "stuShimmer 1.5s infinite",
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
            background: "#0C1E40",
            animation: "stuShimmer 1.5s infinite",
          }}/>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "12px",
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: "90px",
                borderRadius: "12px",
                background: "#f1f5f9",
                animation: "stuShimmer 1.5s infinite",
                animationDelay: `${i * 0.1}s`,
              }}/>
            ))}
          </div>
          <div style={{
            height: "200px",
            borderRadius: "12px",
            background: "#f1f5f9",
            animation: "stuShimmer 1.5s infinite",
          }}/>
        </div>
        <style>{`
          @keyframes stuShimmer {
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
