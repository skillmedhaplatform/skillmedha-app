"use client";
import { usePathname, useRouter } from "next/navigation";
import PageStyles from "./page.module.scss";
import { useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { ConfigProvider } from "antd";
import Header from "@/modules/company/components/header";
import SideBar from "@/modules/company/components/sideBar";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import Image from "next/image";
import { imgUrls } from "@/utils/universalUtils/images";
import { setSearchTerm } from "@/redux/slices/searchFunctions";

export default function Home({ children }) {
  const nav = useRouter();
  const currPath = usePathname();
  const token = getLstorage("token");

  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (token == undefined || token == null || token == "" || !token)
  //     nav.replace("/login");
  //   if (!currPath.split("/")[1]) nav.replace("/tests");
  // }, [token]);

  // useEffect(() => {
  //   const studentId = getLstorage("sId");
  //   if (studentId && !studentCreds?._id) {
  //     dispatch(getStudent({ id: studentId }));
  //   }
  // }, [token, studentCreds?._id]);

  useEffect(() => {
    if (currPath == "/") {
      nav.replace("/myjobs");
    }
  }, []);
  const handleInputChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  return (

      <div className={PageStyles.pageContainer}>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        {/* {currPath === "/AssessmentLibrary" && (
          <div className={PageStyles.header2}>
            <div className={PageStyles.headerTitle}>Assessment Library</div>
            <div className={PageStyles.inputContainer}>
              <Image
                src={imgUrls.SearchIcon}
                alt="SearchIcon"
                className={PageStyles.svgIcon}
              />
              <input
                placeholder="Search by role or skill"
                onChange={handleInputChange}
              />
            </div>
          </div>
        )} */}
        <div className={PageStyles.pageBody}>
          <SideBar />

          <div className={PageStyles.content}>{children}</div>
        </div>
      </div>

  );
}
