"use client";
import React from "react";
import subside from "./styles/subside.module.scss";
import ImageComponent from "./ImageComponent";
;
import { subsidenavLinks } from "@/modules/tpo/Data/SubSideNavLinks";
import { useSelector } from "react-redux";
import { Button } from "antd";
import { useRouter } from "@bprogress/next/app";
import { useParams, usePathname } from "next/navigation";

const SubSideBar = ({ name, id, depart }) => {
  const router = useRouter();
  const params = useParams();
  const pathName = usePathname();

  const base_url = `/tpo/allstudents/${params.departId}/${params.studentId}`;

  const { value: selectedStudent } = useSelector(
    (state) => state.singleStudentDetails.singleStudent
  );

  const handleClick = (path) => {
    router.push(`${base_url}${path}`);
  };

  return (
    <div className={subside.container}>
      <div className={subside.containerFirst}>
        <ImageComponent />
        <p>
          {selectedStudent?.data?.userName
            ? selectedStudent?.data?.userName?.split("")[0].toUpperCase() +
            selectedStudent?.data?.userName?.slice(1)
            : selectedStudent?.data?.firstName || "N/A"}
        </p>
        {/* <p>{selectedStudent?.data?._id || "N/A"}</p> */}
      </div>

      <div className={subside.buttons}>
        {subsidenavLinks?.map((item, index) => {
          const fullPath = `${base_url}${item.path}`;
          const isActive = pathName === fullPath;

          return (
            <Button
              key={index}
              onClick={() => handleClick(item.path)}
              type={isActive ? "primary" : "text"}
              className={subside.Sidenavbtn}
            >
              {item.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SubSideBar;
