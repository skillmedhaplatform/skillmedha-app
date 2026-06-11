"use client";
import React, { useState } from "react";
import headerStyles from "../styles/header.module.scss";
import { useParams, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { updateTest } from "@/redux/slices/testportal_admin/slice/test";
import { useDispatch } from "react-redux";
import { Button, message, Modal, Tooltip } from "antd";

const HeaderForm = () => {
  const currPath = usePathname();
  const SingleTest = useSelector((state) => state.tests.test);

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const selectedId = useParams()["test-slug"].split("_id-")[1];
  const gradingPage = currPath.split("/").slice(-1)[0] == "time" ? true : false;

  const restrictionsPublishTest = () => {
    if (!SingleTest?._id) {
      return {
        isRestricted: true,
        message: "Test ID is missing. Please create a test first.",
      };
    } else if (!SingleTest?.startPage) {
      return {
        isRestricted: true,
        message: "start Page is missing. Please provide.",
      };
    } else if (!SingleTest?.grading) {
      return {
        isRestricted: true,
        message: "Grading and Summary is missing. Please provide.",
      };
    } else if (SingleTest?.grading?.gradingCriteria?.passScore <= 0) {
      return {
        isRestricted: true,
        message: "Pass score must be greater than 0.",
      };
    } else if (!SingleTest?.time?.testDuration?.testDuration) {
      return {
        isRestricted: true,
        message: "Test duration is missing. Please provide a test duration.",
      };
    } else if (
      SingleTest?.time?.testDuration?.testDuration?.duration?.val1 === "00" &&
      SingleTest?.time?.testDuration?.testDuration?.duration?.val2 === "00"
    ) {
      return {
        isRestricted: true,
        message:
          "Test duration cannot be 00:00. Please provide a valid duration.",
      };
    } else if (!SingleTest?.questions || SingleTest?.questions?.length < 1) {
      return {
        isRestricted: true,
        message: "This test currently has no questions assigned.",
      };
    } else
      return {
        isRestricted: false,
        message: "",
      };
  };

  return (
    <div className={headerStyles.headerContainer}>
      <div className={headerStyles.details}>
        {SingleTest?.title || "TEST DETAILS"}
      </div>

      <Tooltip
        placement="bottomRight"
        title={
          restrictionsPublishTest() ? restrictionsPublishTest().message : ""
        }
      >
        <div className={headerStyles.detailsFlex}>
          {gradingPage && (
            <Button
              disabled={restrictionsPublishTest().isRestricted}
              ghost
              // disabled={SingleTest?.access?.pricing?.paid && !BusinessProfile?.integrations?.filter(e => e.type == "Payment Gateway" && e.active).length}
              onClick={() => {
                setOpen(true);
                // const updates = { ...SingleTest };
                // delete updates._id;
                // updates.status = "active";
                // updates.questions = updates?.questions?.map((e) => e?._id) || [];
                // updates.category = updates?.category?.map((e) => e?._id) || [];
                // updates.language = updates?.language?.map((e) => e?._id) || [];
                // dispatch(updateTest({ id: selectedId, updates }));
                // if (window) window.location.href = window.location.origin;
              }}
            >
              Publish Test
            </Button>
          )}
        </div>
      </Tooltip>
      <>
        <Modal
          title="Live this Test"
          onCancel={() => setOpen(false)}
          okText="Yes"
          cancelText="No"
          open={open}
          onOk={() => {
            dispatch(
              updateTest({ id: selectedId, updates: { status: "active" } })
            );
            setOpen(false);
          }}
        ></Modal>
      </>
    </div>
  );
};

export default HeaderForm;
