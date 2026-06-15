"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import psyStyles from "./page.module.scss";
import { Table, Modal, Tooltip } from "antd";
import dynamic from "next/dynamic";
import { useRouter } from "@bprogress/next/app";
import AnalyticsPage from "../../page";
import PageHeader from "@/modules/tpo/components/PageHeader";
const PsychometricTestResultPage = dynamic(
  () => import("../psychometrictestresult/page"),
  { ssr: false }
);

const Page = () => {
  const studentDetails = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value?.data
  );
  const [currentDownloadId, setCurrentDownloadId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadClick = (id) => {
    setCurrentDownloadId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentDownloadId(null);
  };

  const dataSource = studentDetails?.psychometricTestResults?.map(
    (eachRes, index) => ({
      ...eachRes,
      key: index,
    })
  );

  const nav = useRouter();

  const columns = [
    {
      title: "S.No",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Attempted date",
      render: (_, record) => new Date(+record?.date).toLocaleDateString(),
    },
    {
      title: "Download",
      render: (_, record) => (
        <button
          onClick={() => handleDownloadClick(record.id)}
          style={{
            padding: "6px 12px",
            backgroundColor: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download
        </button>
      ),
    },
  ];

  const psychometricMenu = studentDetails?.psychometricTestResults?.map(
    (item) => ({
      label: (
        <div
          onClick={() => {
            route.push(obj?.path + "?id=" + item?.id);
          }}
        >
          {new Date(item.date).toLocaleString()}
        </div>
      ),
      key: item.id,
    })
  );

  const lastTestDate =
    studentDetails?.psychometricTestResults?.[
      studentDetails?.psychometricTestResults?.length - 1
    ]?.date;

  let isDisabled = false;
  let remainingTimeText = "";

  if (lastTestDate) {
    const lastDate = new Date(lastTestDate);
    const now = new Date();
    const diffInMs = now - lastDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays < 7) {
      isDisabled = true;

      const remainingDays = Math.ceil(7 - diffInDays);
      remainingTimeText = `Please try again after ${remainingDays} day${remainingDays > 1 ? "s" : ""
        }`;
    }
  }
  return (
    <>
      <PageHeader title="Psychometric Results" />
      <AnalyticsPage>
      <div className={psyStyles.cards}>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </div>

      <Modal
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        title="Downloading PDF..."
        destroyOnHidden
        width="90%"
        style={{
          marginTop: "-5rem",
        }}
      >
        {currentDownloadId && (
          <PsychometricTestResultPage
            id={currentDownloadId}
            isDownload={true}
            onDownloaded={handleModalClose}
          />
        )}
      </Modal>
    </AnalyticsPage>
    </>
  );
};

export default Page;
