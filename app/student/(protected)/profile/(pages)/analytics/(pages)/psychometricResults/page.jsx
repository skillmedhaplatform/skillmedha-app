"use client";
import React, { useState } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
import { Table, Modal, Tooltip } from "antd";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getLstorage } from "@/universalUtils/windowMW";

const PsychometricTestResultPage = dynamic(
  () => import("../../../psychometrictestresult/page"),
  { ssr: false }
);

const Page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);
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
      <StudentPageHeader section="Profile · Analytics" title="Psychometric Results" />
      <Tooltip title={isDisabled ? remainingTimeText : ""}>
        <button
          disabled={isDisabled}
          className={`float-right bg-[#24A058] font-bold text-base text-white w-fit py-2 px-8 rounded-lg cursor-pointer my-4 disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={() =>
            nav.push(
              `/testPortal?token=${getLstorage("token")}&sId=${studentDetails?._id
              }`
            )
          }
        >
          Re-Attempt Test
        </button>
      </Tooltip>
      <div className="">
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
    </>
  );
};

export default Page;
