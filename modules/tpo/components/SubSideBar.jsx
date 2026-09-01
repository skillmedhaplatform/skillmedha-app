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

  const studentData = selectedStudent?.data || {};
  const profileImage = studentData.profilePicture || studentData.profilePic || studentData.profile || studentData.image;
  const firstName = studentData.firstName || "";
  const lastName = studentData.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || studentData.userName || "N/A";

  const handleClick = (path) => {
    router.push(`${base_url}${path}`);
  };

  return (
    <div className={subside.container}>
      <div className={subside.containerFirst}>
        <ImageComponent 
          profileImage={profileImage} 
          firstName={firstName} 
          lastName={lastName} 
          fullName={fullName} 
        />
        <p>
          {studentData.userName
            ? studentData.userName.split("")[0].toUpperCase() +
              studentData.userName.slice(1)
            : firstName || "N/A"}
        </p>
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
