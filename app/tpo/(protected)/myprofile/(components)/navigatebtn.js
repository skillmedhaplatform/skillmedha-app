"use client";
import React, { useEffect, useState } from "react";
;
import layoutStyles from "../myprofile.module.scss";
import { Button } from "antd";
import { getLstorage, getSstorage } from "@/utils/universalUtils/windowMW";
import { usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";

const NavButton = ({ obj, path }) => {
  const pathname = usePathname();
  const route = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (!getLstorage("userId")) {
      route.push("/tpo/login");
    } else {
      setUserId(getLstorage("userId"));
    }
  }, []);

  useEffect(() => {
    const currentPath = pathname.split("/").pop();
    if (path !== "null") {
      const buttonPath = path.split("/").pop();
      setIsActive(currentPath === buttonPath);
    }
  }, [pathname, path]);

  const handleNavigate = () => {
    return route.push(path);
  };

  return (
    <Button
      type={isActive ? "primary" : "default"}
      disabled={!userId || obj?.disable}
      className={`${layoutStyles.Sidenavbtn}`}
      onClick={handleNavigate}
    >
      {obj?.name}
    </Button>
  );
};

export default NavButton;
