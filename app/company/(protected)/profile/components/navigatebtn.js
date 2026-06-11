"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import layoutStyles from "../layout.module.scss";
import { Button } from "antd";


const NavButton = ({ obj, path, key }) => {
  const pathname = usePathname();
  const route = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [userId, setUserId] = useState("");

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
      key={key}
      disabled={obj?.disable}
      className={`${layoutStyles.Sidenavbtn}`}
      onClick={handleNavigate}
    >
      {obj?.name}
    </Button>
  );
};

export default NavButton;
