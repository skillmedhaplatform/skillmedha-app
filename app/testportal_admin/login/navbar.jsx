"use client";
import React from "react";
import loginstyles from "./page.module.scss";
import { useRouter } from "@bprogress/next/app";

export default function LoginNavbar() {
  const nav = useRouter();
  return (
    <section className={loginstyles.nav_cont}>
      {/* <img
        className={loginstyles.nav_logo}
        src={
          "https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
        }
        alt="logo"
        width={"5rem"}
      /> */}
      <div className={loginstyles.icon}>
        <img
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          alt="Synsper Logo"
          onClick={() => nav.replace("/")}
          style={{
            cursor: "pointer",
          }}
        />
        <div className={loginstyles.logoText} onClick={() => nav.replace("/")}>
          S K I L L <span> M E D H A</span>
        </div>
      </div>
    </section>
  );
}
