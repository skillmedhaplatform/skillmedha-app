"use client";
import React, { useEffect } from "react";
const Home = React.Fragment;
import userStyles from "./styles/page.module.scss";
import UsersComp from "./components/users";
import { useDispatch } from "react-redux";
import { getAllStudents } from "@/redux/slices/testportal_admin/slice/students";

const page = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllStudents());
  }, []);
  return (
    <Home>
      <div className={userStyles.container}>
        <div className={userStyles.title}>Users</div>

        <div className={userStyles.usersParent}>
          <UsersComp />
        </div>
      </div>
    </Home>
  );
};

export default page;
