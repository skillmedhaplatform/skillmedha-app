"use client";
import React, { useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Home from "@/app/page";
import detail from "./detail.module.scss";
import { Button, Spin } from "antd";
import { useSelector } from "react-redux";
import { FaCaretRight } from "react-icons/fa";
import SubSideBar from "./components/SubSideBar";
import { useDispatch } from "react-redux";
import { getAllDetails } from "@/redux/slices/company/user";
import { IoArrowBackOutline } from "react-icons/io5";

const StudentData = ({ children }) => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const { loading } = useSelector((state) => state.user?.singleStudent ?? {});

  const selectedStudent = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(
          getAllDetails({
            globalId: params?.studentId?.split("__")[0],
            sourceOrgId: params?.studentId?.split("__")[1],
          })
        ).unwrap();
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    if (params?.studentId) {
      fetchData();
    }
  }, [params?.studentId, dispatch, router]);
  return (
    <Home>
      <div className={detail.container}>
        <div className={detail.first}>
          {/* <Button
            type="text"
            onClick={() => {
              router.back();
            }}
          >
            <IoArrowBackOutline style={{ fontSize: "1.2rem" }} />
          </Button> */}
          <p style={{ fontWeight: "bold", color: "#25a3a6" }}>
            {selectedStudent?.userName}
          </p>
        </div>
        <div className={detail.mainContainer}>
          <div className={detail.child1}>
            <SubSideBar />
          </div>
          <div className={detail.child2}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Spin size="large" />
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </Home>
  );
};

export default StudentData;
