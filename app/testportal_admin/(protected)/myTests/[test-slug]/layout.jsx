"use client";
import React, { useEffect } from "react";
import HeaderForm from "./utils/header";
import TitlesForm from "./utils/titles";
import pageTitleStyles from "./form.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";

import { getOneTests } from "@/redux/slices/testportal_admin/slice/test";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import {
  getAllStudentsAgg,
  getBatches,
  getDepartments,
} from "@/redux/slices/testportal_admin/slice/studentSlice";

const TestSlugLayout = ({ children }) => {
  const SingleTest = useSelector((state) => state.tests.test);
  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedId) dispatch(getOneTests({ _id: selectedId }));
  }, [selectedId, dispatch]);

  useEffect(() => {
    if (SingleTest?._id) dispatch(setFormValues(SingleTest));
  }, [SingleTest, dispatch]);

  useEffect(() => {
    dispatch(getDepartments());
    dispatch(getBatches({}));
    dispatch(getAllStudentsAgg({}));
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className={pageTitleStyles.container}>
        <HeaderForm />
        <TitlesForm />
        <div className={pageTitleStyles.contentForm}>{children}</div>
      </div>
    </React.Fragment>
  );
};

export default TestSlugLayout;
