"use client";
import React from "react";
import subside from "./subside.module.scss";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "antd";
import Image from "next/image";

const subsidenavLinks = [
  { name: "Basic Details", path: "/basic-details" },
  { name: "Education Details", path: "/education" },
  { name: "Work & Internships", path: "/intern-workex" },
  { name: "Skills, Subjects & Languages", path: "/skills-subjects-languages" },
  { name: "Responsibilities", path: "/positions-responsibilities" },
  { name: "Projects", path: "/projects" },
  { name: "Volunteering", path: "/volunteering" },
  { name: "Certifications", path: "/certifications" },
  { name: "Analytical Report", path: "/analytics" },
];

const SubSideBar = ({ name, id, depart }) => {
  const router = useRouter();
  const params = useParams();
  const pathName = usePathname();

  const selectedStudent = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );

  const handleClick = (path) => {
    router.push(`/company/student/${params?.studentId}${path}`);
  };

  return (
    <div className={subside.container}>
      {/* Profile Section */}
      <div className={subside.containerFirst}>
        <div className={subside.image}>
          <Image
            src={selectedStudent?.profile}
            alt="Profile"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <p>
          {selectedStudent?.userName
            ? selectedStudent?.userName?.charAt(0).toUpperCase() +
              selectedStudent?.userName?.slice(1)
            : selectedStudent?.firstName || "N/A"}
        </p>
      </div>

      {/* Sidebar Buttons */}
      <div className={subside.buttons}>
        {subsidenavLinks?.map((item, index) => {
          const fullPath = `/student/${params?.studentId}${item.path}`;
          const isActive = pathName === fullPath;

          return (
            <Button
              key={index}
              onClick={() => {
                if (!isActive) {
                  handleClick(item.path);
                }
              }}
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
