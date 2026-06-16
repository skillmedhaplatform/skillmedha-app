"use client";

import { getAllJobs, setJobStatus } from "@/redux/slices/company/jobs";
import { Button, Table, message } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  BankOutlined, CalendarOutlined, EyeOutlined, 
  CodeOutlined, LineChartOutlined, StopOutlined 
} from "@ant-design/icons";

import "./antd.css";
import JobStyles from "./myJobsStyles.module.scss";

export default function JobsTable({
  jobs = [],
  actionText = "Stop",
  currTab = {},
  loading = false,
  paginationConfig = {},
}) {
  const router = useRouter();
  const { value: partentColleges } = useSelector(
    (s) => s.skillmedha?.partnerColleges || s.companySkillMedhaData?.partnerColleges || {}
  );

  const dispatch = useDispatch();

  const checkJobEndDate = (job) => {
    if (!job.endDate) return { valid: false, message: "Job has no end date" };

    const endDate = new Date(job.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates

    if (endDate < today) {
      return {
        valid: false,
        message:
          "Job end date has already passed. Please update the job dates before publishing.",
      };
    }

    return { valid: true };
  };

  const changeStatusOfJob = (jobId) => {
    const status = {
      Stop: "expired",
      RePublish: "active",
      Publish: "active",
    };

    // Check if action is RePublish or Publish
    if (actionText === "RePublish" || actionText === "Publish") {
      const job = jobs.find((e) => e._id === jobId);

      if (!job) {
        message.error("Job not found");
        return;
      }

      // Validate end date
      const dateValidation = checkJobEndDate(job);

      if (!dateValidation.valid) {
        message.warning(dateValidation.message);
        // Redirect to edit page
        router.push(`myjobs/${jobId}/createjob`);
        return;
      }
    }

    // Proceed with status change if date is valid or action is Stop
    dispatch(
      setJobStatus({
        status: status[actionText],
        jobId: jobId,
      })
    )?.then((res) => {
      if (res.payload) {
        message.success(
          `Job ${actionText.toLowerCase()}${actionText === "Stop" ? "ped" : "ed"
          } successfully`
        );
        dispatch(
          getAllJobs({
            page: 1,
            limit: 20,
            status: currTab?.fetchType,
          })
        );
      }
    });
  };

  const columns = [
    { title: "JOB TITLE", dataIndex: "jobTitle", width: '30%' },
    { title: "COLLEGES", dataIndex: "colleges", width: '20%' },
    { title: "POSTED ON", dataIndex: "createdAt", width: '15%' },
    { title: "APPLICANTS", dataIndex: "applicants", width: '20%' },
    { title: "ACTION", dataIndex: "action", width: '15%' },
  ];

  const getJobIcon = (title) => {
    const titleLower = (title || "").toLowerCase();
    
    let icon = <BankOutlined />;
    let bgColor = "linear-gradient(135deg, #68d391 0%, #38a169 100%)"; // Green

    if (titleLower.includes("developer") && !titleLower.includes("python")) {
      icon = <CodeOutlined />;
      bgColor = "linear-gradient(135deg, #63b3ed 0%, #3182ce 100%)"; // Blue
    } else if (titleLower.includes("data") || titleLower.includes("analyst")) {
      icon = <LineChartOutlined />;
      bgColor = "linear-gradient(135deg, #b794f4 0%, #805ad5 100%)"; // Purple
    } else if (titleLower.includes("python")) {
      // Custom SVG for python/others
      icon = (
        <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      );
      bgColor = "linear-gradient(135deg, #f6ad55 0%, #dd6b20 100%)"; // Orange
    }

    return (
      <div style={{
        width: '42px', height: '42px', borderRadius: '10px',
        background: bgColor,
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: '16px', flexShrink: 0, fontSize: '1.4rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        {icon}
      </div>
    );
  };

  const data = jobs.map((e, i) => {
    const collegesList =
      e.collegesDetails?.map((clgj, index) => {
        return (
          <span key={clgj?.orgId}>
            {clgj?.name}
            {index < e.collegesDetails.length - 1 ? ", " : ""}
          </span>
        );
      }) || [];

    // Check if end date has passed
    const endDate = new Date(e.endDate);
    const today = new Date();
    const isExpired = endDate < today;

    return {
      key: e._id,
      jobTitle: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getJobIcon(e.jobTitle)}
          <div>
            <div style={{ fontWeight: 700, color: '#1a365d', fontSize: '0.95rem' }}>{e.jobTitle}</div>
            <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '2px' }}>JOB-{e.jobId || e._id.toString().substring(e._id.toString().length - 4).toUpperCase()}</div>
            {(actionText === "RePublish" || actionText === "Publish") &&
              isExpired && (
                <span
                  style={{ color: "#e53e3e", fontSize: "11px", display: "block", marginTop: '2px' }}
                >
                  (Expired: {endDate.toLocaleDateString()})
                </span>
              )}
          </div>
        </div>
      ),
      colleges: (
        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#f0f4f8', color: '#3182ce', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
             <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
             <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
          {collegesList?.length > 0 ? (
            collegesList.length > 2 ? (
              <span>
                {collegesList.slice(0, 2)}
                <span onClick={(ev) => ev.stopPropagation()} style={{ cursor: 'pointer', marginLeft: '4px' }}>
                  +{collegesList.length - 2} more
                </span>
              </span>
            ) : collegesList
          ) : (
            "CodingSchool"
          )}
        </div>
      ),
      createdAt: (
        <div style={{ color: '#718096', fontSize: '0.85rem', display: 'flex', alignItems: 'center', fontWeight: 500 }}>
          <CalendarOutlined style={{ marginRight: '8px', fontSize: '1rem', color: '#a0aec0' }} />
          {new Date(e?.createdAt || Date.now()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}
        </div>
      ),
      applicants: (
        <div 
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            backgroundColor: '#e6f0fa', padding: '6px 16px', borderRadius: '24px', 
            cursor: 'pointer', transition: 'background-color 0.2s'
          }}
          onClick={(ev) => {
            ev.stopPropagation();
            router.push(`myjobs/${e?._id}/applicants`);
          }}
        >
          <div style={{ color: '#3182ce', fontWeight: 700, display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
            <EyeOutlined style={{ marginRight: '6px', fontSize: '1rem' }} />
            View Applicants
          </div>
          <span style={{ backgroundColor: '#3182ce', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {e.applicants ? e.applicants.length : (e.totalApplicants || 0)}
          </span>
        </div>
      ),
      action: (
        <Button
          onClick={(f) => {
            f.stopPropagation();
            changeStatusOfJob(e?._id);
          }}
          style={{
            color: actionText === "Stop" ? '#e53e3e' : '#3182ce',
            borderColor: actionText === "Stop" ? '#fc8181' : '#63b3ed',
            backgroundColor: 'white',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 16px',
            height: '32px'
          }}
        >
          {actionText === "Stop" ? <StopOutlined style={{ color: 'rgb(235, 22, 22)' }} /> : null}
          {actionText}
        </Button>
      ),
    };
  });

  return (
    <div style={{ backgroundColor: 'white', padding: '0' }}>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        style={{ cursor: "pointer" }}
        pagination={{
          ...paginationConfig,
          position: ['bottomRight'],
          showSizeChanger: false,
        }}
        scroll={{ y: 'calc(100vh - 420px)' }}
        onRow={(record, index) => ({
          onClick: (event) => {
            router.push(`myjobs/${record.key}/createjob`);
          },
        })}
      />
    </div>
  );
}
