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
import Column from "antd/es/table/Column";
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
  updateTest,
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
} from "@ant-design/icons";
import { generateKYCEmailHTML } from "../emailtemplate/kycLinkEmailui";

const { Search } = Input;
const { Title, Text } = Typography;

const UsersComp = () => {
  const allTests = useSelector((state) => state.tests.value);
  const allStudents = useSelector((state) => state.students.allStudents);
  const allStudentsStatus = useSelector((state) => state.students.status);
  const searchedStudent = useSelector(
    (state) => state.students.serchedStudent.value,
  );
  const bulkEmailState = useSelector((state) => state.tests.bulkEmail);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const Students = searchedStudent.length ? searchedStudent : allStudents;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const dispatch = useDispatch();
  const [modalBlock, setModalBlock] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Modal states
  const [bulkEmailModal, setBulkEmailModal] = useState(false);
  const [sendingModal, setSendingModal] = useState(false);
  const [showBulkResults, setShowBulkResults] = useState(false);

  useEffect(() => {
    if (!allTests?.length) dispatch(getTests({ cursor: null, limit: 100 }));
  }, []);

  // ✅ Email Column Search Filter Handler
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  // ✅ Email Column Search Filter Dropdown
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search email or username`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#27ae60" : undefined,
          fontSize: 16,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase()) ||
      record.userName?.toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

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
        "token",
      )}`
    );
  };

  // ✅ Single KYC Email - Using unified template
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

  // ✅ Bulk KYC Email Handler with Loading Modal
  const handleBulkKYCEmail = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one student");
      return;
    }

    setBulkEmailModal(false);
    setSendingModal(true);

    const selectedStudents = Students.filter((student) =>
      selectedRowKeys.includes(student._id),
    );

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
      }),
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
          const incompleteKeys = Students.filter(
            (student) => !student.faceData,
          ).map((student) => student._id);
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
  const columns = [
    // Serial Number Column
    {
      title: "S.No",
      key: "serial",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },

    // Name Column
    {
      title: "Name",
      key: "name",
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        const fullName = `${record?.firstName || ""} ${
          record?.lastName || ""
        }`.trim();
        return <Text strong>{fullName || "N/A"}</Text>;
      },
    },

    // Email Column with Search Filter
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
      ...getColumnSearchProps("email"),
      render: (email, record) => (
        <Text
          copyable={{
            text: email,
            tooltips: ["Copy email", "Copied!"],
          }}
          style={{ cursor: "pointer" }}
        >
          {email || "N/A"}
        </Text>
      ),
    },

    // KYC Status Column with Filter
    {
      title: "KYC Status",
      key: "kycStatus",
      width: 130,
      align: "center",
      filters: [
        { text: "Verified", value: true },
        { text: "Pending", value: false },
      ],
      onFilter: (value, record) => !!record.faceData === value,
      render: (_, record) => (
        <Tag
          icon={
            record?.faceData ? <CheckCircleOutlined /> : <CloseCircleOutlined />
          }
          color={record?.faceData ? "success" : "warning"}
          style={{
            borderRadius: 6,
            padding: "4px 12px",
            fontWeight: 500,
          }}
        >
          {record?.faceData ? "Verified" : "Pending"}
        </Tag>
      ),
    },

    // KYC Image Column
    {
      title: "KYC Image",
      key: "kycImage",
      width: 130,
      align: "center",
      render: (_, record) =>
        record?.faceData ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={record.faceData.file}
              alt="KYC Verification"
              style={{
                width: 70,
                height: 70,
                borderRadius: 8,
                objectFit: "cover",
                border: "2px solid #52c41a",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
              onClick={() => {
                Modal.info({
                  title: "KYC Verification Image",
                  icon: null,
                  content: (
                    <div style={{ textAlign: "center", marginTop: 20 }}>
                      <img
                        src={record.faceData.file}
                        alt="KYC"
                        style={{
                          width: "100%",
                          maxWidth: "400px",
                          borderRadius: 8,
                          border: "2px solid #52c41a",
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            No Image
          </Text>
        ),
    },

    // KYC Action Column - FIXED RIGHT
    {
      title: "Action",
      key: "kycAction",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type={record?.faceData ? "default" : "primary"}
          size="middle"
          block
          icon={
            record?.faceData ? <MailOutlined /> : <SafetyCertificateOutlined />
          }
          onClick={() => handleCaptureFaceData(record)}
        >
          {record?.faceData ? "Resend" : "Send Link"}
        </Button>
      ),
    },
  ];
  return (
    <div className={userCompStyles.mainContainer}>
      {/* ✅ Selection Info Card with Bulk Email Button */}
      {selectedRowKeys.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, #e6f7f8 0%, #f0f9fa 100%)",
            border: "1px solid #b3e5e7",
            width: "40%",
            padding: ".5rem 1rem",
            display: "flex",
            alignSelf: "flex-end",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: ".3rem",
            borderRadius: "10px",
          }}
        >
          <div>
            <Avatar
              style={{ backgroundColor: "#27ae60" }}
              icon={<CheckCircleOutlined />}
            />
            <Text strong style={{ color: "#27ae60" }}>
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

      {/* ✅ Table Container WITHOUT Toolbar */}
      <div className={userCompStyles.tableContainer}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          styles={{ body: { padding: "16px" } }}
        >
          <Table
            loading={allStudentsStatus === "pending"}
            dataSource={Students}
            columns={columns}
            rowSelection={rowSelection}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: Students.length,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 30, 40, 50],
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} students`,
            }}
            onChange={handleTableChange}
            rowKey="_id"
            locale={{ emptyText: "No students found" }}
            scroll={{ x: 1500, y: "calc(100vh - 280px)" }}
          />
        </Card>
      </div>

      {/* ✅ Bulk Email Confirmation Modal */}
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

      {/* ✅ Sending Progress Modal */}
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

      {/* ✅ Bulk Email Results Modal */}
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
                    100,
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
            }),
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
