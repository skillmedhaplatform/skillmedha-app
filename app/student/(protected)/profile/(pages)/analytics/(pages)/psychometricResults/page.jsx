"use client";
import React, { useState } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
import { Table, Modal, Tooltip, Button } from "antd";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getLstorage } from "@/universalUtils/windowMW";
import formStyles from "../../../../form.module.scss";

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
            padding: "6px 16px",
            background: "linear-gradient(135deg, #1E69DA, #5694F0)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px"
          }}
        >
          Download PDF
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
    <div className={formStyles.formContainer}>
      <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eef5fb", width: "100%", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 className={formStyles.formTitle} style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Psychometric Test Results
          </h3>
          <p className={formStyles.formSubtitle} style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, marginTop: "0.25rem" }}>
            History of all attempted psychometric tests and their detailed results
          </p>
        </div>
        <Tooltip title={isDisabled ? remainingTimeText : ""}>
          <Button
            type="primary"
            disabled={isDisabled}
            className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
            style={{ fontWeight: "600", borderRadius: "8px", height: "auto", padding: "8px 20px" }}
            onClick={() =>
              nav.push(
                `/testPortal?token=${getLstorage("token")}&sId=${studentDetails?._id}`
              )
            }
          >
            Re-Attempt Test
          </Button>
        </Tooltip>
      </div>

      <div style={{ width: "100%" }}>
        <Table columns={columns} dataSource={dataSource} pagination={false} size="middle" bordered />
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
    </div>
  );
};

export default Page;

