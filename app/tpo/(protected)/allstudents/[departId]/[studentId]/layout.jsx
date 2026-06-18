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
import PageHeader from "@/modules/tpo/components/PageHeader";
import { getSstorage } from "@/utils/universalUtils/windowMW";
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
    }, [pathname, baseUrl, router]);

    const symbol = <FaCaretRight style={{ fontSize: "14px", color: "#64748b", margin: "0 4px" }} />;
    const studentName = selectedStudent?.data
        ? `${selectedStudent.data.firstName || ""} ${selectedStudent.data.lastName || selectedStudent.data.userName || ""}`.trim()
        : "Student Profile";

    const lastSegment = pathname?.split("/").pop() || "";
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(lastSegment);
    const displayTabName = isObjectId
        ? ""
        : lastSegment.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    return (
        <>
            <PageHeader
                breadcrumb="All departments"
                title={studentName}
                subtitle={`Class of ${selectedStudent?.data?.yearOfPassing || "N/A"} - ${selectedStudent?.data?.email || ""}`}
            />
            <div className={detail.container}>
                <div className={detail.first}>
                    <p onClick={() => router.push("/tpo/allstudents")}>
                        All Departments
                    </p>
                    <span>{symbol}</span>
                    <p onClick={() => router.push(`/tpo/allstudents/${params.departId}/`)}>
                        {getSstorage("departmentTitle") || "Department"}
                    </p>
                    <span>{symbol}</span>
                    <p style={{ color: "#0f172a", fontWeight: "600", cursor: "default" }}>
                        {selectedStudent?.data?.userName || "Profile"}
                    </p>
                    {displayTabName && (
                        <>
                            <span>{symbol}</span>
                            <p style={{ color: "#0f172a", fontWeight: "600", cursor: "default" }}>
                                {displayTabName}
                            </p>
                        </>
                    )}
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
