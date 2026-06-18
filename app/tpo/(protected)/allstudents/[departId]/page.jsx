"use client";
import React, { useEffect, useState } from "react";
;
import Search from "antd/es/input/Search";
import {
  Table,
  Modal,
  Upload,
  Button,
  message,
  Input,
  Dropdown,
  Pagination
} from "antd";
import { EllipsisOutlined, UploadOutlined } from "@ant-design/icons";
import students from "./students.module.scss";
import Image from "next/image";
import trueImage from "@/public/tpo/right.svg";
import falseImage from "@/public/tpo/wrong.svg";
import PageHeader from "@/modules/tpo/components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import {
  DeleteStudentAccount,
  getStudentsInDepartments,
  getStudentsWithoutValidDepartment,
  updateStudent
} from "@/redux/slices/tpo/getAllStudentsSlice";
import { restUrl } from "@/utils/universalUtils/urls";
import styles from "./students.module.scss";
import { CreateStudentAccount } from "@/redux/slices/tpo/getAllDetailsSlice";
import { GetToken } from "@/utils/universalUtils/token";
import { getLstorage, getSstorage } from "@/utils/universalUtils/windowMW";
import axios from "axios";
import { allFields, fieldDisplayNames } from "@/utils/universalUtils/fields";
import StudentDownloader from "@/modules/tpo/components/downloadstdudents";
import { getUpdatedFields } from "../../myprofile/(components)/functions";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { FaCaretRight, FaCheckCircle } from "react-icons/fa";

import { HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";

const StudentData = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const path = usePathname();
  const pathSegments = path?.split("/").filter((e) => e);

  const resolveName = (segment, index) => {
    if (segment === "allstudents") return "All Departments";
    if (index > 0 && pathSegments[index - 1] === "allstudents") {
      return getSstorage("departmentTitle") || "Department";
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const { value, loading } = useSelector((state) => state.students.allStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [fileList, setFileList] = useState([]);
  const [original, setOriginal] = useState({});
  const [viewMode, setViewMode] = useState("cards"); // Default to cards view as tiles
  const [studentPayload, setStudentPayload] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    yearOfPassing: ""
  });

  // Download modal state
  const [downloadModal, setDownloadModal] = useState(false);

  useEffect(() => {
    dispatch(getStudentsInDepartments({ id: params?.departId }));
  }, [dispatch, params?.departId]);

  useEffect(() => {
    const dataArray = Array.isArray(value) ? value : value?.data || [];
    setFilteredData(dataArray);
  }, [value]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    const trimmedQuery = query.trim();
    const dataArray = Array.isArray(value) ? value : value?.data || [];

    if (trimmedQuery.length === 0 || trimmedQuery.length < 3) {
      setFilteredData(dataArray);
      setIsSearchPerformed(false);
      return;
    }
    setIsSearchPerformed(true);
    const lower = trimmedQuery.toLowerCase();
    const filtered = dataArray.filter((s) =>
      [s.firstName, s.lastName, s.userName, s.email, s.phone, s.rollNumber]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(lower))
    );

    setFilteredData(filtered);
  };

  const handleEdit = (student) => {
    setOriginal(student);
    setModalType("single");
    setIsModalOpen(true);
    setStudentPayload({
      ...student
    });
    setSelectedStudentId(student?._id);
  };

  const handleDelete = (student) => {
    const { globalId } = student;
    dispatch(
      DeleteStudentAccount({ globalId, dapartment: params.departId, dispatch })
    );
  };

  const isUpdate = !!selectedStudentId;

  const handleAddStudent = async () => {
    const departmentId = params?.departId;
    const {
      firstName,
      lastName,
      userName,
      email,
      phone,
      password,
      yearOfPassing,
      globalId } = studentPayload;
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return message.error("Invalid or missing email address");
    }

    // Validate phone
    const phoneRegex = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;
    const cleanPhone = (phone || "").replace(/[\s-]/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      return message.error(
        "Invalid phone number. Must be 10 digits starting with 6-9 or +91xxxxxxxxxx"
      );
    }

    // Optionally validate other required fields
    if (!firstName || !lastName || !userName) {
      return message.error("Missing required fields");
    }
    const requiredFields = [
      { field: departmentId, name: "Department" },
      { field: firstName, name: "First Name" },
      { field: lastName, name: "Last Name" },
      { field: userName, name: "User Name" },
      { field: email, name: "Email" },
      { field: phone, name: "Phone" },
      { field: yearOfPassing, name: "Year Of Passing" },
      ...(!isUpdate ? [{ field: password, name: "Password" }] : []),
    ];

    const missingField = requiredFields.find(
      ({ field }) => !field || !field.toString().trim()
    );

    if (missingField) {
      message.error(`Please fill in the required field: ${missingField.name}`);
      return;
    }

    try {
      if (selectedStudentId) {
        const originalPayload = {
          firstName: original.firstName,
          lastName: original.lastName,
          userName: original.userName,
          email: original.email,
          phone: original.phone,
          yearOfPassing: original.yearOfPassing,
          globalId: original.globalId,
          _id: original.globalId
        };

        const updatedInput = {
          firstName,
          lastName,
          userName,
          email,
          phone,
          yearOfPassing,
          globalId
        };

        const updatedPayload = getUpdatedFields(originalPayload, updatedInput);

        if (Object.keys(updatedPayload).length > 0) {
          await dispatch(
            updateStudent({
              aboutDetails: { ...updatedPayload, _id: globalId, globalId },
              departmentId: params?.departId
            })
          );
        } else {
          message.info("No changes to update.");
        }
      } else {
        const createPayload = {
          ...studentPayload,
          department: departmentId,
          firstName,
          lastName
        };

        await dispatch(
          CreateStudentAccount({ dispatch, payload: createPayload })
        );
      }
    } catch (error) {
      console.error("Error adding/updating student:", error);
      message.error("Something went wrong. Please try again.");
    } finally {
      closeModal();
    }
  };

  const handleClick = (record) => {
    router.push(`/tpo/allstudents/${params.departId}/${record.globalId}`);
  };

  const showModal = (modalType) => {
    setModalType(modalType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setFileList([]);
    setStudentPayload({
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      phone: "",
      password: "",
      yearOfPassing: ""
    });
    setIsModalOpen(false);
    setSelectedStudentId("");
  };

  // Download modal handlers
  const openDownloadModal = () => setDownloadModal(true);
  const closeDownloadModal = () => setDownloadModal(false);

  const handleUpload = () => {
    message.info("Bulk upload is not configured yet.");
    closeModal();
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
    onRemove: () => setFileList([]),
  };

  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });

  const yearOptions = Array.from(
    new Set((filteredData || []).map((s) => s.yearOfPassing))
  )
    .filter(Boolean)
    .sort((a, b) => b - a)
    .map((year) => ({
      text: String(year),
      value: String(year)
    }));

  const isStudentApproved = (record) => {
    const topVals = Object.keys(record)
      .filter((k) => k.endsWith("VerificationType"))
      .map((k) => record[k]);

    const nestedArrays = [
      "accomplishments",
      "projects",
      "volunteerings",
      "responsibilities",
      "experiences",
      "educationDetails",
    ];
    const nestedVals = nestedArrays.flatMap((arr) =>
      (record[arr] || [])
        .map((item) => item?.verificationType)
        .filter(Boolean)
    );

    const allVerifications = [...topVals, ...nestedVals];
    return (
      allVerifications.length > 0 &&
      allVerifications.every((v) => v === "approved")
    );
  };

  const columns = [
    {
      title: "Sl. No.",
      dataIndex: "slno",
      key: "slno",
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 50
    },
    {
      title: "Name",
      key: "name",
      width: 150,
      sorter: (a, b) => {
        const nameA = ((a.firstName || "") + " " + (a.lastName || ""))
          .trim()
          .toLowerCase();
        const nameB = ((b.firstName || "") + " " + (b.lastName || ""))
          .trim()
          .toLowerCase();
        return nameA.localeCompare(nameB);
      },
      render: (_, record) => {
        const fullName =
          (record?.firstName || "") + " " + (record?.lastName || "");
        return (
          <span>
            {fullName.trim() || (
              <span style={{ color: "#999", fontStyle: "italic" }}>
                Not Provided
              </span>
            )}
          </span>
        );
      }
    },
    { title: "Email", dataIndex: "email", key: "email", width: 180 },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 80 },
    {
      title: "Year of Passing",
      dataIndex: "yearOfPassing",
      key: "yearOfPassing",
      width: 100,
      filters: yearOptions,
      onFilter: (value, record) =>
        String(record.yearOfPassing) === String(value)
    },
    {
      title: "Status",
      key: "status",
      width: 50,
      render: (_, record) => {
        const allApproved = isStudentApproved(record);
        return allApproved ? (
          <FaCheckCircle style={{ color: "#6BA8ED", fontSize: "20px" }} />
        ) : (
          <Image
            src={falseImage}
            width={20}
            height={20}
            alt="Status"
          />
        );
      }
    },
    {
      title: "Action",
      key: "action",
      width: 50,
      render: (_, record) => {
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Edit",
                },
                {
                  key: "delete",
                  label: "Delete",
                  danger: true,
                },
              ],
              onClick: (e) => {
                if (e.domEvent) {
                  e.domEvent.stopPropagation();
                }
                if (e.key === "edit") {
                  handleEdit(record);
                } else if (e.key === "delete") {
                  handleDelete(record);
                }
              },
            }}
            trigger={["click"]}
          >
            <Button type="text" onClick={(e) => e.stopPropagation()}>
              <EllipsisOutlined style={{ fontSize: 20, cursor: "pointer" }} />
            </Button>
          </Dropdown>
        );
      }
    },
  ];

  const getInitials = (firstName = "", lastName = "") => {
    return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();
  };

  const paginatedData = (filteredData || []).slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  return (
    <>
      <PageHeader
        breadcrumb="All departments"
        title={getSstorage("departmentTitle") || "Department"}
        subtitle="Manage students registered in this department"
      />
      <div className={students.container}>
        {/* Breadcrumbs Trail */}
        <div className={students.headerCont}>
          {pathSegments.map((segment, index) => {
            const displayName = resolveName(segment, index);
            const isLast = index === pathSegments.length - 1;
            let pathToHere = "/" + pathSegments.slice(0, index + 1).join("/");
            if (pathToHere === "/tpo") {
              pathToHere = "/tpo/dashboard";
            }
            return (
              <span
                key={index}
                className={isLast ? students.activeCrumb : students.crumb}
                onClick={() => {
                  if (!isLast) router.push(pathToHere);
                }}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                {displayName}&nbsp;
                {index < pathSegments.length - 1 && (
                  <FaCaretRight style={{ fontSize: "14px", color: "#64748b", margin: "0 4px" }} />
                )}
              </span>
            );
          })}
        </div>

        {params?.departId !== "noDept" && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <Button onClick={() => showModal("bulk")} type="primary" style={{ background: "linear-gradient(135deg, #6BA8ED 0%, #A3CCFA 100%)", borderColor: "transparent" }}>
              Bulk Upload Students
            </Button>
            <Button onClick={() => showModal("single")} type="primary" style={{ background: "linear-gradient(135deg, #6BA8ED 0%, #A3CCFA 100%)", borderColor: "transparent" }}>
              Add Single Student
            </Button>
            <Button onClick={openDownloadModal} type="primary" style={{ background: "linear-gradient(135deg, #6BA8ED 0%, #A3CCFA 100%)", borderColor: "transparent" }}>
              Download Students
            </Button>
          </div>
        )}

        {/* Toolbar containing search query and layout controls */}
        <div className={students.toolbar}>
          <Search
            placeholder="Search by name, email, phone, or roll no."
            style={{ flex: 1 }}
            allowClear
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className={students.viewToggle}>
            <button
              className={`${students.toggleBtn} ${viewMode === "cards" ? students.toggleBtnActive : ""}`}
              onClick={() => setViewMode("cards")}
              title="Tile view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
            <button
              className={`${students.toggleBtn} ${viewMode === "table" ? students.toggleBtnActive : ""}`}
              onClick={() => setViewMode("table")}
              title="Table view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Condition on View Mode */}
        {viewMode === "cards" ? (
          <>
            {paginatedData.length > 0 ? (
              <div className={students.cardsList}>
                {paginatedData.map((record) => {
                  const fullName = ((record?.firstName || "") + " " + (record?.lastName || "")).trim() || "Not Provided";
                  const allApproved = isStudentApproved(record);
                  return (
                    <div
                      key={record._id}
                      className={students.studentCard}
                      onClick={() => handleClick(record)}
                    >
                      <div className={students.cardHeader}>
                        <div className={students.studentAvatar}>
                          {getInitials(record.firstName, record.lastName) || "ST"}
                        </div>
                        <div className={students.studentInfo}>
                          <span className={students.studentName}>{fullName}</span>
                          <span className={students.studentYear}>Class of {record.yearOfPassing || "N/A"}</span>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          {allApproved ? (
                            <FaCheckCircle style={{ color: "#6BA8ED", fontSize: "20px" }} />
                          ) : (
                            <Image
                              src={falseImage}
                              width={20}
                              height={20}
                              alt="Verification Status"
                            />
                          )}
                        </div>
                      </div>

                      <div className={students.cardMeta}>
                        <div className={students.metaRow}>
                          <span className={students.metaIcon}><HiOutlineEnvelope /></span>
                          <span>{record.email || "No Email"}</span>
                        </div>
                        <div className={students.metaRow}>
                          <span className={students.metaIcon}><HiOutlinePhone /></span>
                          <span>{record.phone || "No Phone"}</span>
                        </div>
                      </div>

                      <div className={students.cardActions} onClick={(e) => e.stopPropagation()}>
                        <button
                          className={students.viewBtn}
                          onClick={() => handleClick(record)}
                        >
                          View Profile
                        </button>
                        <Dropdown
                          menu={{
                            items: [
                              { key: "edit", label: "Edit" },
                              { key: "delete", label: "Delete", danger: true }
                            ],
                            onClick: (e) => {
                              if (e.domEvent) e.domEvent.stopPropagation();
                              if (e.key === "edit") {
                                handleEdit(record);
                              } else if (e.key === "delete") {
                                handleDelete(record);
                              }
                            }
                          }}
                          trigger={["click"]}
                        >
                          <Button type="text" style={{ padding: 0 }}>
                            <EllipsisOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                          </Button>
                        </Dropdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#64748b", margin: "2rem 0" }}>
                No students found matching current filters.
              </div>
            )}

            {/* Pagination Component for Cards */}
            {filteredData && filteredData.length > pagination.pageSize && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={filteredData.length}
                  onChange={(page) => setPagination((prev) => ({ ...prev, current: page }))}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {paginatedData.length > 0 ? (
              <div className={students.horizontalList}>
                {paginatedData.map((record) => {
                  const fullName = ((record?.firstName || "") + " " + (record?.lastName || "")).trim() || "Not Provided";
                  const allApproved = isStudentApproved(record);
                  return (
                    <div
                      key={record._id}
                      className={students.horizontalCard}
                      onClick={() => handleClick(record)}
                    >
                      <div className={students.cardHeader}>
                        <div className={students.studentAvatar}>
                          {getInitials(record.firstName, record.lastName) || "ST"}
                        </div>
                        <div className={students.studentInfo}>
                          <span className={students.studentName}>{fullName}</span>
                          <span className={students.studentYear}>Class of {record.yearOfPassing || "N/A"}</span>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          {allApproved ? (
                            <FaCheckCircle style={{ color: "#6BA8ED", fontSize: "20px" }} />
                          ) : (
                            <Image
                              src={falseImage}
                              width={20}
                              height={20}
                              alt="Verification Status"
                            />
                          )}
                        </div>
                      </div>

                      <div className={students.cardMeta}>
                        <div className={students.metaRow}>
                          <span className={students.metaIcon}><HiOutlineEnvelope /></span>
                          <span>{record.email || "No Email"}</span>
                        </div>
                        <div className={students.metaRow}>
                          <span className={students.metaIcon}><HiOutlinePhone /></span>
                          <span>{record.phone || "No Phone"}</span>
                        </div>
                      </div>

                      <div className={students.cardActions} onClick={(e) => e.stopPropagation()}>
                        <button
                          className={students.viewBtn}
                          onClick={() => handleClick(record)}
                        >
                          View Profile
                        </button>
                        <Dropdown
                          menu={{
                            items: [
                              { key: "edit", label: "Edit" },
                              { key: "delete", label: "Delete", danger: true }
                            ],
                            onClick: (e) => {
                              if (e.domEvent) e.domEvent.stopPropagation();
                              if (e.key === "edit") {
                                handleEdit(record);
                              } else if (e.key === "delete") {
                                handleDelete(record);
                              }
                            }
                          }}
                          trigger={["click"]}
                        >
                          <Button type="text" style={{ padding: 0 }}>
                            <EllipsisOutlined style={{ fontSize: 20, cursor: "pointer" }} />
                          </Button>
                        </Dropdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#64748b", margin: "2rem 0" }}>
                No students found matching current filters.
              </div>
            )}

            {filteredData && filteredData.length > pagination.pageSize && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={filteredData.length}
                  onChange={(page) => setPagination((prev) => ({ ...prev, current: page }))}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}

        {/* Single / Bulk Add Modal */}
        <Modal
          title={
            modalType === "single"
              ? isUpdate
                ? "Update Student"
                : "Add Single Student"
              : "Bulk Upload Students"
          }
          open={isModalOpen}
          onOk={modalType === "single" ? handleAddStudent : handleUpload}
          onCancel={closeModal}
          okText={
            modalType === "single" ? (isUpdate ? "Update" : "Submit") : "Upload"
          }
        >
          {modalType === "single" ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <strong>First Name *</strong>
                <Input
                  name="firstName"
                  placeholder="Enter first name"
                  value={studentPayload.firstName}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setStudentPayload((prev) => ({ ...prev, [name]: value }));
                  }}
                />
              </div>
              <div>
                <strong>Last Name *</strong>
                <Input
                  name="lastName"
                  placeholder="Enter last name"
                  value={studentPayload.lastName}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setStudentPayload((prev) => ({ ...prev, [name]: value }));
                  }}
                />
              </div>
              <div>
                <strong>Username *</strong>
                <Input
                  name="userName"
                  placeholder="Enter username"
                  value={studentPayload.userName}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setStudentPayload((prev) => ({ ...prev, [name]: value }));
                  }}
                />
              </div>
              <div>
                <strong>Email *</strong>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={studentPayload.email}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setStudentPayload((prev) => ({ ...prev, [name]: value }));
                  }}
                />
              </div>
              <div>
                <strong>Phone *</strong>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={studentPayload.phone}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setStudentPayload((prev) => ({ ...prev, [name]: value }));
                  }}
                />
              </div>
              <div>
                <strong>Year of passing *</strong>
                <Input
                  name="yearOfPassing"
                  type="number"
                  placeholder="Enter year (e.g., 2022)"
                  value={studentPayload.yearOfPassing}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setStudentPayload((prev) => ({ ...prev, [name]: value }));
                  }}
                />
              </div>
              {!isUpdate && (
                <div>
                  <strong>Password *</strong>
                  <Input.Password
                    name="password"
                    placeholder="Enter password"
                    value={studentPayload.password}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setStudentPayload((prev) => ({ ...prev, [name]: value }));
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Select .xlsx or .csv</Button>
              </Upload>
              <a
                href="/students_sample.xlsx"
                download
                style={{ width: "fit-content" }}
              >
                <Button type="primary" onClick={() => setIsModalOpen(false)}>
                  📩 Download Sample File
                </Button>
              </a>
            </div>
          )}
        </Modal>

        {/* Reusable Download Component */}
        <StudentDownloader
          isOpen={downloadModal}
          onClose={closeDownloadModal}
          studentData={filteredData?.map((item) => ({
            ...item,
            department: getSstorage("departmentTitle")
          }))}
          allFields={allFields}
          fieldDisplayNames={fieldDisplayNames}
          title="Select fields to download"
          filename="students"
        />
      </div>
    </>
  );
};

export default StudentData;
