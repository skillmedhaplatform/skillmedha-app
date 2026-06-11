"use client";
import React, { Suspense } from "react";

import { profileSideNav } from "./(pages)/_utils/myprofileUtils";
import InfoComp from "@/app/student/(protected)/profile/(pages)/_utils/infocomp";
import { useSelector } from "react-redux";
import NavButton from "@/modules/student/components/navigatebtn";
import useResponsive from "@/hooks/useResponsive";
import MobileProfileLayout from "@/mobile_views/profile/MobileProfileLayout";

export default function layout({ children }) {
  const studentCreds = useSelector((state) => state.student.student?.data);
  const isMobile = useResponsive();

  if (isMobile) {
    return <MobileProfileLayout>{children}</MobileProfileLayout>;
  }

  return (

    <section className="w-full h-[95%] flex flex-row items-start justify-between p-4">
      <div className="w-[15%] flex flex-col items-start justify-start gap-2 p-4 bg-[#24A0581a] rounded-[15px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)]">
        <InfoComp />
        <div className="w-full h-[80%] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col items-start justify-start gap-2">
          {profileSideNav.map((item, Index) => {
            return (
              <NavButton key={item?.path} obj={item} path={item?.path} />
            );
          })}
        </div>
      </div>
      <div className="w-[84%] h-full overflow-y-auto overflow-x-hidden">{children}</div>
    </section>

  );
}
