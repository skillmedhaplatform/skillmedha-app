"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import { Dropdown, Tooltip } from "antd";
import { useSelector } from "react-redux";

const NavButton = ({ obj, path, notIsActive }) => {
  const studentDetails = useSelector((state) => state.student.student?.data);
  const pathname = usePathname();
  const route = useAppRouter();
  const currentPath = pathname?.split("/").pop();
  const buttonPath = path !== "null" ? path?.split("/").pop() : null;
  const isActive = currentPath === buttonPath;

  const handleNavigate = () => {
    if (obj?.name === "Psychometric Test Results") {
      return;
    }
    if (obj?.path === "null" || notIsActive) {
      return route.push("/testPortal");
    }
    if (obj?.isactive) {
      return route.push(path);
    }
  };

  return (
    <button
      className={`w-full max-w-[200px] border-[0.01px] border-solid border-[rgba(128,128,128,0.157)] py-2 px-0 rounded-[5px] cursor-pointer font-bold text-left pl-4 transition-all duration-100 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis ${!obj?.isactive ? 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-black' : 'hover:bg-[#24A058] hover:text-white'} ${isActive ? 'bg-[#24A058] text-white transition-all duration-200' : 'bg-transparent text-gray-800'}`}
      onClick={handleNavigate}
    >
      {obj?.name}
    </button>
  );
};

export default NavButton;
