"use client";
import React, { useEffect } from "react";
;
import { stData } from "@/modules/tpo/Data/data";
import { subsidenavLinks } from "@/modules/tpo/Data/SubSideNavLinks";
import detail from "./detail.module.scss";
import SubSideBar from "@/modules/tpo/components/SubSideBar";
import { Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import { FaCaretRight } from "react-icons/fa";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";

const StudentLayout = ({ children }) => {
    const params = useParams();
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const { value: selectedStudent } = useSelector(
        (state) => state.singleStudentDetails.singleStudent
    );

    const baseUrl = `/tpo/allstudents/${params.departId}/${params.studentId}`;

    useEffect(() => {
        if (params.studentId) {
            dispatch(getAllDetails(params.studentId));
        }
    }, [params.studentId, dispatch]);

    // Redirect to default tab if on base student path
    useEffect(() => {
        if (pathname === baseUrl && subsidenavLinks.length > 0) {
            router.replace(`${baseUrl}${subsidenavLinks[0].path}`);
        }
    }, []);

    const symbol = <FaCaretRight style={{ fontSize: "24px" }} />;

    return (
        <>
            <div className={detail.container}>
                <div className={detail.first}>
                    <p
                        onClick={() => router.push("/tpo/allstudents")}
                        style={{ cursor: "pointer" }}
                    >
                        All Students
                    </p>
                    <span>{symbol}</span>
                    <p
                        onClick={() => router.push(`/tpo/allstudents/${params.departId}/`)}
                        style={{ cursor: "pointer" }}
                    >
                        Students of Dept
                    </p>
                    {symbol}
                    <p style={{ fontWeight: "bold" }}>
                        {selectedStudent?.data?.userName} - {pathname?.split("/").pop()}
                    </p>
                </div>
                <div className={detail.mainContainer}>
                    <div className={detail.child1}>
                        <SubSideBar />
                    </div>
                    <div className={detail.child2}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentLayout;
