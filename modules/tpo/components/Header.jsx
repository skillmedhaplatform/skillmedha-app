"use client";
import React from "react";
import header from "./styles/header.module.scss";
import Image from "next/image";
import bell from "@/public/tpo/bell.svg";

const Header = () => {
  return (
    <div 
      className={header.header} 
      style={{ 
        display: "flex",
        justifyContent: "flex-end", 
        backgroundColor: "#ffffff", 
        borderBottom: "1px solid #e2e8f0", 
        boxShadow: "none",
        height: "64px",
        alignItems: "center",
        padding: "0 1.5rem"
      }}
    >
      <div className={header.second}>
        <div 
          className={header.notify} 
          style={{ 
            display: "flex",
            alignItems: "center",
            padding: "0.5rem",
            cursor: "pointer"
          }}
        >
          <Image src={bell} alt="Notifications" style={{ filter: "brightness(0.3)" }} />
        </div>
      </div>
    </div>
  );
};

export default Header;
