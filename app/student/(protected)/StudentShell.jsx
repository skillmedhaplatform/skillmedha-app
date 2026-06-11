"use client";
import { usePathname } from "next/navigation";
import PageStyles from "../page.module.scss";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Header from "@/mainLayout/header";
import SideBar from "@/mainLayout/sideBar";
import MobileSidebar from "@/mobile_views/sidebar/MobileSidebar";
import useResponsive from "@/hooks/useResponsive";
import Image from "next/image";
import { imgUrls } from "@/universalUtils/images";
import { setSearchTerm } from "@/redux/slices/searchFunctions";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Button } from "antd";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const theme = createTheme({
  palette: {
    primary: { main: "#24A058" },
    secondary: { main: "#24A058" },
  },
});

export default function StudentShell({ children }) {
  const currPath = usePathname();
  const dispatch = useDispatch();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const isMobile = useResponsive();
  const [isMobileState, setIsMobileState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobileState(isMobile);
  }, [isMobile]);

  const handleInputChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={PageStyles.pageContainer} style={{ flexDirection: (mounted ? isMobileState : false) ? "column" : "row" }}>
        {(mounted ? isMobileState : false) ? <MobileSidebar /> : <SideBar />}
        <div className={PageStyles.rightColumn} style={{ height: (mounted ? isMobileState : false) ? "calc(100vh - 64px)" : "100%" }}>
          <Header isHeaderVisible={isHeaderVisible} />
          {currPath === "/AssessmentLibrary" && (
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
          )}
          <div className={PageStyles.content} style={(mounted ? isMobileState : false) ? { padding: 0, backgroundColor: "#f8fafc" } : {}}>
            {children}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
