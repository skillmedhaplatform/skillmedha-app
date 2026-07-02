"use client";
import {
  Button,
  Col,
  message,
  Modal,
  Row,
  Select,
  Table,
  Input,
  Progress,
  Tag,
  Card,
  Spin,
  Space,
  Divider,
  Typography,
  Avatar,
} from "antd";
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import userCompStyles from "../styles/usercomp.module.scss";
import {
  BlockStudent,
  clearSearchStudent,
  getStudent,
  searchStudent,
  UnBlockStudent,
} from "@/redux/slices/testportal_admin/slice/students";
import {
  getTests,
  SendEmailMail,
  SendBulkEmailMail,
} from "@/redux/slices/testportal_admin/slice/test";
import { skillmedhaTestPortal } from "@/utils/universalUtils/urls";
import { encryptObject } from "@/app/student/(protected)/tests/utils/encrytionMiddleware";
import { getLstorage } from "@/utils/windowMW";
import {
  MailOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { generateKYCEmailHTML } from "../emailtemplate/kycLinkEmailui";

const { Option } = Select;
const { Title, Text } = Typography;

const avatarColors = [
  "#1e69da", // TPO Blue
  "#24a058", // Green
  "#a855f7", // Purple
  "#f59e0b", // Orange
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#ef4444", // Red
];

const UsersComp = () => {
  const allTests = useSelector((state) => state.tests.value);
  const allStudents = useSelector((state) => state.students.allStudents);
  const allStudentsStatus = useSelector((state) => state.students.status);
  const searchedStudent = useSelector(
    (state) => state.students.serchedStudent.value
  ) || [];
  const bulkEmailState = useSelector((state) => state.tests.bulkEmail);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const Students = searchedStudent.length ? searchedStudent : allStudents;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const dispatch = useDispatch();
  const [modalBlock, setModalBlock] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Search & KYC Filter States (Screenshot 1 Header controls)
  const [globalSearchText, setGlobalSearchText] = useState("");
  const [kycFilter, setKycFilter] = useState("all");

  // Modal states
  const [bulkEmailModal, setBulkEmailModal] = useState(false);
  const [sendingModal, setSendingModal] = useState(false);
  const [showBulkResults, setShowBulkResults] = useState(false);

  useEffect(() => {
    if (!allTests?.length) dispatch(getTests({ cursor: null, limit: 100 }));
  }, []);

  // Filter list locally based on globalSearchText and kycFilter dropdown selections
  const filteredStudentsList = (Students || []).filter((student) => {
    const fullName = `${student?.firstName || ""} ${student?.lastName || ""}`.trim().toLowerCase();
    const email = (student?.email || "").toLowerCase();
    const matchesSearch = globalSearchText
      ? fullName.includes(globalSearchText.toLowerCase()) || email.includes(globalSearchText.toLowerCase())
      : true;

    const isVerified = !!student?.faceData;
    const matchesKyc = kycFilter === "all"
      ? true
      : kycFilter === "verified"
      ? isVerified
      : !isVerified;

    return matchesSearch && matchesKyc;
  });

  // Metric counts
  const totalStudentsCount = (Students || []).length;
  const verifiedStudentsCount = (Students || []).filter((s) => !!s?.faceData).length;
  const pendingStudentsCount = (Students || []).filter((s) => !s?.faceData).length;

  // Generate KYC URL
  const generateKYCUrl = (record) => {
    const key = encryptObject({
      object: { createdAt: record.createdAt },
      key: new Date(record.createdAt).toString(),
    });
    const token = encryptObject({
      object: {
        email: record.email,
        studentId: record?.globalId,
      },
      key,
    });

    return (
      window.location.origin +
      skillmedhaTestPortal +
      `?s_tk=${token}&s_tks=${Math.random()
        .toString(32)
        .slice(3)}sGIR9HD${Math.random()
        .toString(32)
        .slice(3)}K+R3tzKcQm0sfT/emKZ4YdA==&s_t=${key}&st=${getLstorage(
        "token"
      )}`
    );
  };

  // Single KYC Email
  const handleCaptureFaceData = (record) => {
    const url = generateKYCUrl(record);
    const fullName = `${record?.firstName || ""} ${
      record?.lastName || ""
    }`.trim();

    const emailData = {
      from: "ksquareinfo2@gmail.com",
      to: record?.email,
      subject: "Complete Your KYC Verification - Skill Medha",
      text: `Hello ${
        fullName || record.email
      },\n\nPlease complete your KYC verification by clicking the link below:\n${url}\n\nThank you,\nSkill Medha Support Team`,
      html: generateKYCEmailHTML(record?.email, fullName || record?.email, url),
    };

    message.success("KYC Link sent successfully!");
    dispatch(SendEmailMail({ updates: emailData }));
  };

  // Bulk KYC Email
  const handleBulkKYCEmail = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one student");
      return;
    }

    setBulkEmailModal(false);
    setSendingModal(true);

    const mailTemplate = {
      subject: "Complete Your KYC Verification - Skill Medha",
      text: "Hello {{name}},\n\nPlease complete your KYC verification by clicking the link below:\n{{kycLink}}\n\nThank you,\nSkill Medha Support Team",
      html: generateKYCEmailHTML("{{email}}", "{{name}}", "{{kycLink}}"),
    };

    const result = await dispatch(
      SendBulkEmailMail({
        studentIds: selectedRowKeys,
        mailTemplate,
        batchSize: 10,
      })
    );

    setSendingModal(false);

    if (SendBulkEmailMail.fulfilled.match(result)) {
      setShowBulkResults(true);
      setSelectedRowKeys([]);
    } else {
      message.error("Failed to send bulk emails. Please try again.");
    }
  };

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "incomplete-kyc",
        text: "Select Incomplete KYC",
        onSelect: () => {
          const incompleteKeys = (Students || [])
            .filter((student) => !student.faceData)
            .map((student) => student._id);
          setSelectedRowKeys(incompleteKeys);
        },
      },
    ],
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Table Columns config (Screenshot 1 UI layout)
  const columns = [
    // S.No
    {
      title: "S.No",
      key: "serial",
      width: 70,
      align: "center",
      render: (_, __, idx) =>
        (pagination.current - 1) * pagination.pageSize + idx + 1,
    },
    // Initials + Name
    {
      title: "Name",
      key: "name",
      width: 220,
      render: (_, record) => {
        const fullName = `${record?.firstName || ""} ${record?.lastName || ""}`.trim() || "N/A";
        const initial = fullName !== "N/A" ? fullName.charAt(0).toUpperCase() : "?";
        // Deterministic background color for avatar
        const colorIndex = fullName !== "N/A" ? fullName.charCodeAt(0) % avatarColors.length : 0;
        const avatarColor = avatarColors[colorIndex];

        return (
          <div className={userCompStyles.nameCell}>
            <div className={userCompStyles.avatar} style={{ backgroundColor: avatarColor }}>
              {initial}
            </div>
            <span className={userCompStyles.nameText}>{fullName}</span>
          </div>
        );
      },
    },
    // Email + Copy Icon
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email) => {
        const emailStr = email || "N/A";
        return (
          <div className={userCompStyles.emailCell}>
            <Text
              copyable={{
                text: emailStr,
                icon: [<CopyOutlined key="copy" />, <CheckCircleOutlined key="copied" style={{ color: "#22c55e" }} />],
                tooltips: ["Copy email", "Copied!"],
              }}
            >
              {emailStr}
            </Text>
          </div>
        );
      },
    },
    // KYC Status Pill
    {
      title: "KYC Status",
      key: "kycStatus",
      width: 140,
      align: "center",
      render: (_, record) => {
        const isVerified = !!record?.faceData;
        return (
          <span className={`${userCompStyles.kycStatusPill} ${isVerified ? userCompStyles.verified : userCompStyles.pending}`}>
            {isVerified ? (
              <>
                <CheckCircleOutlined /> Verified
              </>
            ) : (
              <>
                <ClockCircleOutlined /> Pending
              </>
            )}
          </span>
        );
      },
    },
    // KYC Image Circular/Avatar
    {
      title: "KYC Image",
      key: "kycImage",
      width: 130,
      align: "center",
      render: (_, record) =>
        record?.faceData ? (
          <div className={userCompStyles.kycImageCell}>
            <img
              src={record.faceData.file}
              alt="KYC Avatar"
              onClick={() => {
                Modal.info({
                  title: "KYC Verification Image",
                  icon: null,
                  content: (
                    <div style={{ textAlign: "center", marginTop: 20 }}>
                      <img
                        src={record.faceData.file}
                        alt="KYC Large"
                        style={{
                          width: "100%",
                          maxWidth: "400px",
                          borderRadius: 12,
                          border: "2px solid #22c55e",
                        }}
                      />
                    </div>
                  ),
                  width: 500,
                  centered: true,
                  okText: "Close",
                });
              }}
            />
          </div>
        ) : (
          <div className={userCompStyles.kycImageCell}>
            <span className={userCompStyles.noImage}>No image</span>
          </div>
        ),
    },
    // Action Buttons
    {
      title: "Action",
      key: "kycAction",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const isVerified = !!record?.faceData;
        return (
          <Button
            type={isVerified ? "default" : "primary"}
            className={`${userCompStyles.actionBtn} ${isVerified ? userCompStyles.resend : userCompStyles.send}`}
            icon={<SendOutlined />}
            onClick={() => handleCaptureFaceData(record)}
          >
            {isVerified ? "Resend" : "Send Link"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className={userCompStyles.mainContainer}>
      {/* Top Header Row (Screenshot 1 Title & Filters) */}
      <div className={userCompStyles.header_div}>
        <div className={userCompStyles.headerLeft}>
          <span className={userCompStyles.titleIcon}>
            <TeamOutlined />
          </span>
          <h2 className={userCompStyles.heading}>
            Students
            <span className={userCompStyles.countBadge}>{totalStudentsCount} students</span>
          </h2>
        </div>

        <div className={userCompStyles.headerRight}>
          {/* Search students input */}
          <div className={userCompStyles.searchCon}>
            <SearchOutlined className={userCompStyles.searchIcon} />
            <input
              placeholder="Search students..."
              value={globalSearchText}
              onChange={(e) => setGlobalSearchText(e.target.value)}
            />
          </div>

          {/* KYC Status Dropdown */}
          <div className={userCompStyles.filterSelect}>
            <Select
              value={kycFilter}
              onChange={(val) => setKycFilter(val)}
            >
              <Option value="all">All KYC Status</Option>
              <Option value="verified">Verified</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </div>

          {/* Add Student Button Placeholder */}
          <button 
            className={userCompStyles.addBtn}
            onClick={() => message.info("Add Student feature is a placeholder")}
          >
            <UserOutlined /> Add Student
          </button>
        </div>
      </div>

      {/* Metrics Grid Cards (Screenshot 1 Layout) */}
      <div className={userCompStyles.metricGrid}>
        <div className={userCompStyles.metricCard}>
          <div className={`${userCompStyles.iconWrapper} ${userCompStyles.total}`}>
            <TeamOutlined />
          </div>
          <div className={userCompStyles.textWrapper}>
            <span className={userCompStyles.number}>{totalStudentsCount}</span>
            <span className={userCompStyles.label}>Total Students</span>
          </div>
        </div>
        <div className={userCompStyles.metricCard}>
          <div className={`${userCompStyles.iconWrapper} ${userCompStyles.verified}`}>
            <CheckCircleOutlined />
          </div>
          <div className={userCompStyles.textWrapper}>
            <span className={userCompStyles.number}>{verifiedStudentsCount}</span>
            <span className={userCompStyles.label}>KYC Verified</span>
          </div>
        </div>
        <div className={userCompStyles.metricCard}>
          <div className={`${userCompStyles.iconWrapper} ${userCompStyles.pending}`}>
            <ClockCircleOutlined />
          </div>
          <div className={userCompStyles.textWrapper}>
            <span className={userCompStyles.number}>{pendingStudentsCount}</span>
            <span className={userCompStyles.label}>KYC Pending</span>
          </div>
        </div>
      </div>

      {/* Selection Info Card with Bulk Email Button */}
      {selectedRowKeys.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, #e6f7f8 0%, #f0f9fa 100%)",
            border: "1px solid #b3e5e7",
            width: "fit-content",
            padding: ".5rem 1.25rem",
            display: "flex",
            alignSelf: "flex-end",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "2rem",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            marginTop: "0.25rem",
          }}
        >
          <div>
            <Avatar
              style={{ backgroundColor: "#27ae60" }}
              icon={<CheckCircleOutlined />}
            />
            <Text strong style={{ color: "#27ae60", marginLeft: "0.5rem" }}>
              {selectedRowKeys.length} student(s) selected
            </Text>
          </div>

          <div>
            <Button
              type="primary"
              size="middle"
              icon={<MailOutlined />}
              onClick={() => setBulkEmailModal(true)}
            >
              Send Bulk KYC ({selectedRowKeys.length})
            </Button>
            <Button
              type="text"
              style={{ marginLeft: ".3rem" }}
              onClick={() => setSelectedRowKeys([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Redesigned Card Table layout */}
      <div className={userCompStyles.tableContainer}>
        <Card styles={{ body: { padding: "20px" } }}>
          {/* Custom Header Row inside the card */}
          <div className={userCompStyles.tableHeaderRow}>
            <div className={userCompStyles.tableHeaderLeft}>
              <span><TeamOutlined /></span>
              All Students
            </div>
            <div className={userCompStyles.tableHeaderRight}>
              <span className={userCompStyles.showingText}>
                Showing {Math.min((pagination.current - 1) * pagination.pageSize + 1, filteredStudentsList.length)}–
                {Math.min(pagination.current * pagination.pageSize, filteredStudentsList.length)} of {filteredStudentsList.length}
              </span>
              <div className={userCompStyles.pageSizeSelect}>
                <Select
                  value={`${pagination.pageSize} / page`}
                  onChange={(value) => {
                    const size = parseInt(value, 10);
                    setPagination({ current: 1, pageSize: size });
                  }}
                >
                  <Option value="5">5 / page</Option>
                  <Option value="10">10 / page</Option>
                  <Option value="20">20 / page</Option>
                  <Option value="50">50 / page</Option>
                </Select>
              </div>
            </div>
          </div>

          <Table
            loading={allStudentsStatus === "pending"}
            dataSource={filteredStudentsList}
            columns={columns}
            rowSelection={rowSelection}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: filteredStudentsList.length,
              showSizeChanger: false, // hide the duplicate size changer at the bottom
            }}
            onChange={handleTableChange}
            rowKey="_id"
            locale={{ emptyText: "No students found" }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Bulk Email Confirmation Modal */}
      <Modal
        open={bulkEmailModal}
        onCancel={() => setBulkEmailModal(false)}
        onOk={handleBulkKYCEmail}
        title={
          <Space>
            <MailOutlined style={{ color: "#27ae60" }} />
            <span>Send Bulk KYC Links</span>
          </Space>
        }
        okText="Send Emails"
        cancelText="Cancel"
        width={500}
        centered
        destroyOnHidden
      >
        <Divider style={{ margin: "16px 0" }} />
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f0f9fa 0%, #e6f7f8 100%)",
              border: "1px solid #b3e5e7",
            }}
          >
            <Row gutter={16} align="middle">
              <Col span={12} style={{ textAlign: "center" }}>
                <Title level={2} style={{ margin: 0, color: "#27ae60" }}>
                  {selectedRowKeys.length}
                </Title>
                <Text type="secondary">Students Selected</Text>
              </Col>
              <Col span={12} style={{ textAlign: "center" }}>
                <Title level={2} style={{ margin: 0, color: "#52c41a" }}>
                  10
                </Title>
                <Text type="secondary">Batch Size</Text>
              </Col>
            </Row>
          </Card>
          <Text>
            Are you sure you want to send KYC verification links to{" "}
            <Text strong style={{ color: "#27ae60" }}>
              {selectedRowKeys.length}
            </Text>{" "}
            student(s)?
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ℹ️ Emails will be sent in batches of 10 to ensure optimal delivery
            success rate and prevent spam filtering.
          </Text>
        </Space>
      </Modal>

      {/* Sending Progress Modal */}
      <Modal
        open={sendingModal}
        footer={null}
        closable={false}
        centered
        width={400}
      >
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 60, color: "#27ae60" }}
                spin
              />
            }
          />
          <Title level={4} style={{ marginTop: 30, color: "#27ae60" }}>
            Sending Emails...
          </Title>
          <Text type="secondary">
            Please wait while we send KYC links to selected students.
            <br />
            This may take a few moments.
          </Text>
          <Progress
            percent={0}
            status="active"
            strokeColor={{
              "0%": "#27ae60",
              "100%": "#1a7d7f",
            }}
            style={{ marginTop: 20 }}
          />
        </div>
      </Modal>

      {/* Bulk Email Results Modal */}
      <Modal
        open={showBulkResults}
        onCancel={() => setShowBulkResults(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setShowBulkResults(false)}
            size="large"
          >
            Close
          </Button>,
        ]}
        title={
          <Space>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <span>Bulk Email Results</span>
          </Space>
        }
        width={750}
        centered
        destroyOnHidden
      >
        {bulkEmailState.summary && (
          <div>
            {/* Progress Bar */}
            <Card
              style={{
                marginBottom: 24,
                background: "linear-gradient(135deg, #f0f9fa 0%, #ffffff 100%)",
              }}
            >
              <Progress
                type="circle"
                percent={Math.round(
                  (bulkEmailState.summary.successful /
                    bulkEmailState.summary.total) *
                    100
                )}
                strokeColor={{
                  "0%": "#27ae60",
                  "100%": "#52c41a",
                }}
                format={(percent) =>
                  `${bulkEmailState.summary.successful}/${bulkEmailState.summary.total}`
                }
                width={120}
                style={{ display: "block", margin: "0 auto" }}
              />
              <Text
                type="secondary"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                Email Delivery Success Rate
              </Text>
            </Card>

            {/* Summary Stats */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card
                  style={{
                    textAlign: "center",
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ fontSize: 32, color: "#52c41a" }}
                  />
                  <Title
                    level={2}
                    style={{ margin: "8px 0", color: "#52c41a" }}
                  >
                    {bulkEmailState.summary.successful}
                  </Title>
                  <Text type="secondary">Successful</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  style={{
                    textAlign: "center",
                    background: "#fff1f0",
                    border: "1px solid #ffccc7",
                  }}
                >
                  <CloseCircleOutlined
                    style={{ fontSize: 32, color: "#ff4d4f" }}
                  />
                  <Title
                    level={2}
                    style={{ margin: "8px 0", color: "#ff4d4f" }}
                  >
                    {bulkEmailState.summary.failed}
                  </Title>
                  <Text type="secondary">Failed</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  style={{
                    textAlign: "center",
                    background: "#e6f7ff",
                    border: "1px solid #91d5ff",
                  }}
                >
                  <MailOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                  <Title
                    level={2}
                    style={{ margin: "8px 0", color: "#1890ff" }}
                  >
                    {bulkEmailState.summary.batches}
                  </Title>
                  <Text type="secondary">Batches</Text>
                </Card>
              </Col>
            </Row>

            {/* Failed Emails List */}
            {bulkEmailState.failed && bulkEmailState.failed.length > 0 && (
              <Card
                title={
                  <Space>
                    <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    <span>Failed Emails ({bulkEmailState.failed.length})</span>
                  </Space>
                }
                style={{ marginTop: 16 }}
              >
                <div
                  style={{
                    maxHeight: 250,
                    overflowY: "auto",
                  }}
                >
                  {bulkEmailState.failed.map((item, index) => (
                    <Card
                      key={index}
                      size="small"
                      style={{
                        marginBottom: 8,
                        background: "#fff1f0",
                        border: "1px solid #ffccc7",
                      }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col span={16}>
                          <Text strong style={{ color: "#ff4d4f" }}>
                            {item.email}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.error}
                          </Text>
                        </Col>
                        <Col span={8} style={{ textAlign: "right" }}>
                          <Tag color="error">Failed</Tag>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Success Message */}
            {bulkEmailState.summary.failed === 0 && (
              <Card
                style={{
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
                  border: "2px solid #52c41a",
                  marginTop: 16,
                }}
              >
                <CheckCircleOutlined
                  style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
                />
                <Title level={4} style={{ color: "#52c41a", margin: 0 }}>
                  ✓ All emails sent successfully!
                </Title>
                <Text type="secondary">
                  KYC verification links have been delivered to all selected
                  students.
                </Text>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Block Modal */}
      <Modal
        open={modalBlock}
        onCancel={() => setModalBlock(false)}
        onOk={() => {
          dispatch(
            UnBlockStudent({
              testId: selectedTestId,
              studentId: selectedStudentId,
              dispatch,
            })
          );
          setModalBlock(false);
        }}
        title="Student Blocked"
        okText="Unblock"
        cancelText="Cancel"
      >
        <p>
          This student is currently blocked for this test. Would you like to
          unblock them?
        </p>
      </Modal>
    </div>
  );
};

export default UsersComp;
