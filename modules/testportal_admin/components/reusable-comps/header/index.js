"use client";
import React, { useEffect } from "react";
import headerStyles from "./header.module.scss";
import { useRouter } from "@bprogress/next/app";
import { getLstorage } from "@/utils/windowMW";
import { GetOneUser } from "@/redux/slices/testportal_admin/slice/test";
import { useDispatch, useSelector } from "react-redux";
import ImageWithFallback from "../ImageWithFallback";

const Header = () => {
  const nav = useRouter();
  const token = getLstorage("token");
  const dispatch = useDispatch();
  const UserDetails = useSelector(
    (state) => state.tests.UserDetails?.value?.data
  );
  return (
    <div className={headerStyles.container}>
      <div className={headerStyles.icon}>
        <ImageWithFallback
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          fallbackSrc="https://res.cloudinary.com/cliqtick/image/upload/v1718345892/sysnper/db47284929e120d0bdcc1955a52c1288_rulzfj.png"
          alt="Synsper Logo"
          onClick={() => nav.replace("/testportal_admin/myTests")}
          style={{
            cursor: "pointer",
          }}
        />
        <div className={headerStyles.logoText} onClick={() => nav.replace("/testportal_admin/myTests")}>
          S K I L L <span> M E D H A</span>
        </div>
      </div>

      <div className={headerStyles.credsCon}>
        <div className={headerStyles.profileCard}>
          <ImageWithFallback
            src={
              UserDetails?.tpoLogo ||
              "https://res.cloudinary.com/cliqtick/image/upload/v1718345892/sysnper/db47284929e120d0bdcc1955a52c1288_rulzfj.png"
            }
            fallbackSrc="https://res.cloudinary.com/cliqtick/image/upload/v1718345892/sysnper/db47284929e120d0bdcc1955a52c1288_rulzfj.png"
            alt="Profile Icon"
            className={headerStyles.profileImage}
          />

          <div className={headerStyles.profileInfo}>
            <span className={headerStyles.userName}>
              {UserDetails?.userName ||
                UserDetails?.firstName + " " + UserDetails?.lastName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
