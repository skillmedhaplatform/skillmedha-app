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
  Pagination,
  Select,
  Checkbox
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
import { getAllDepartments } from "@/redux/slices/tpo/departmentSlice";
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
  const { value: departMent } = useSelector((state) => state.department.getAllDepartments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [moveTargetDepartment, setMoveTargetDepartment] = useState(null);
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
  const [uploadResultModal, setUploadResultModal] = useState(false);
  const [uploadResultData, setUploadResultData] = useState(null);
  useEffect(() => {
    dispatch(getStudentsInDepartments({ id: params?.departId }));
    dispatch(getAllDepartments());
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
      setPagination((prev) => ({ ...prev, current: 1 }));
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
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleEdit = (student) => {
    setOriginal(student);
    setModalType("single");
    setIsModalOpen(true);
    let cleanPhone = (student.phone || "").replace(/\D/g, "");
    if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

    setStudentPayload({
      ...student,
      phone: cleanPhone
    });
    setSelectedStudentId(student?._id);
  };

  const handleDelete = (student) => {
    const { globalId } = student;
    Modal.confirm({
      title: "Delete Student",
      content: "Are you sure you want to delete this student? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        dispatch(
          DeleteStudentAccount({ globalId, dapartment: params.departId, dispatch })
        );
      },
    });
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: `Delete ${selectedStudentIds.length} Students`,
      content: "Are you sure you want to delete the selected students? This action cannot be undone.",
      okText: "Yes, Delete All",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const hide = message.loading("Deleting students...", 0);
        try {
          await Promise.all(
            selectedStudentIds.map(globalId =>
              dispatch(DeleteStudentAccount({ globalId, dapartment: params.departId, dispatch }))
            )
          );
          setSelectedStudentIds([]);
          dispatch(getStudentsInDepartments({ id: params?.departId }));
        } finally {
          hide();
        }
      },
    });
  };

  const handleBulkMove = async () => {
    if (!moveTargetDepartment) {
      return message.warning("Please select a target department first.");
    }
    const hide = message.loading("Moving students...", 0);
    try {
      await Promise.all(
        selectedStudentIds.map(globalId =>
          dispatch(
            updateStudent({
              aboutDetails: { _id: globalId, globalId, department: moveTargetDepartment },
              departmentId: params?.departId
            })
          )
        )
      );
      setSelectedStudentIds([]);
      setIsMoveModalOpen(false);
      setMoveTargetDepartment(null);
      dispatch(getStudentsInDepartments({ id: params?.departId }));
    } finally {
      hide();
    }
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
    const cleanPhone = (phone || "").replace(/[\s-]/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      return message.error(
        "Phone number must be exactly 10 digits"
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

  const handleUpload = async () => {
    if (params?.departId === "noDept") {
      message.error(
        "Cannot upload students to 'No Department' category. Please select a valid department."
      );
      return;
    }

    const hide = message.loading(
      "Please wait while creating student accounts",
      0
    );
    if (fileList.length === 0) {
      hide();
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);

    try {
      const response = await axios.post(
        `${restUrl}/bulkUploadStudentsToDepartment/${params.departId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${getLstorage("token") || GetToken()}` }
        }
      );

      dispatch(getStudentsInDepartments({ id: params.departId }));

      const { success, failed, errors } = response.data;
      if (failed > 0) {
        if (success > 0) {
          message.success(`${success} students created successfully. ${failed} students failed.`);
        } else {
          message.error(`Failed to create students. ${failed} students failed.`);
        }
        setUploadResultData({ success, failed, errors: errors || [] });
        setUploadResultModal(true);
      } else {
        message.success(`Students uploaded successfully. ${success} students created.`);
      }
    } catch (e) {
      console.error(e);
      const errMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Failed to upload students. Please try again.";
      message.error(errMsg);
    } finally {
      hide();
      closeModal();
    }
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

  // Display all students on a single page
  const paginatedData = filteredData || [];

  return (
    <>
      <PageHeader
        title={getSstorage("departmentTitle") || "Department"}
        subtitle="Manage students registered in this department"
      />

      <div className={students.topSectionWrapper}>
        <div className={students.leftControls}>
          <Search
            placeholder="Search by name, email, phone, or roll no."
            style={{ width: 400 }}
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

        {params?.departId !== "noDept" && (
          <div className={students.rightControls}>
            {selectedStudentIds.length > 0 && (
              <Button onClick={() => setIsBulkModalOpen(true)} type="primary" style={{ background: "linear-gradient(135deg, #6BA8ED 0%, #A3CCFA 100%)", borderColor: "transparent" }}>
                Bulk Actions ({selectedStudentIds.length})
              </Button>
            )}
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
      </div>

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
                        <Checkbox 
                          style={{ marginRight: '8px' }}
                          checked={selectedStudentIds.includes(record.globalId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds(prev => [...prev, record.globalId]);
                            } else {
                              setSelectedStudentIds(prev => prev.filter(id => id !== record.globalId));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
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
                        <Checkbox 
                          style={{ marginRight: '8px' }}
                          checked={selectedStudentIds.includes(record.globalId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds(prev => [...prev, record.globalId]);
                            } else {
                              setSelectedStudentIds(prev => prev.filter(id => id !== record.globalId));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
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
                  maxLength={10}
                  value={studentPayload.phone}
                  onChange={(e) => {
                    let { name, value } = e.target;
                    if (name === "phone") {
                      value = value.replace(/\D/g, "").slice(0, 10);
                    }
                    setStudentPayload((prev) => ({ ...prev, [name]: value }));
                  }}
                />
                {studentPayload.phone && studentPayload.phone.length !== 10 && (
                  <span style={{ color: "red", fontSize: "12px" }}>Must be exactly 10 digits</span>
                )}
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

        <Modal
          title="Bulk Upload Summary"
          open={uploadResultModal}
          onCancel={() => setUploadResultModal(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setUploadResultModal(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {uploadResultData && (
            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>{uploadResultData.success}</strong> students created successfully.
              </p>
              <p style={{ color: 'red' }}>
                <strong>{uploadResultData.failed}</strong> students failed.
              </p>
              {uploadResultData.errors && uploadResultData.errors.length > 0 && (
                <Table
                  dataSource={uploadResultData.errors}
                  rowKey={(record, index) => `${record.row}-${index}`}
                  pagination={false}
                  columns={[
                    { title: "Row", dataIndex: "row", key: "row", width: 80 },
                    { title: "Email", dataIndex: "email", key: "email" },
                    { title: "Reason", dataIndex: "reason", key: "reason" }
                  ]}
                  size="small"
                  style={{ marginTop: '1rem' }}
                />
              )}
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


      <Modal
        title="Bulk Actions"
        open={isBulkModalOpen}
        onCancel={() => setIsBulkModalOpen(false)}
        footer={null}
      >
        <p style={{ fontSize: '16px', marginBottom: '24px' }}>
          You have selected <strong>{selectedStudentIds.length}</strong> students. What would you like to do with them?
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button onClick={() => { setIsBulkModalOpen(false); setSelectedStudentIds([]); }}>Cancel Selection</Button>
          <Button type="primary" onClick={() => { setIsBulkModalOpen(false); setIsMoveModalOpen(true); }}>Move Selected</Button>
          <Button type="primary" danger onClick={() => { setIsBulkModalOpen(false); handleBulkDelete(); }}>Delete Selected</Button>
        </div>
      </Modal>

      <Modal
        title="Move Students"
        open={isMoveModalOpen}
        onOk={handleBulkMove}
        onCancel={() => {
          setIsMoveModalOpen(false);
          setMoveTargetDepartment(null);
        }}
        okText="Move"
      >
        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <p style={{ marginBottom: '8px' }}>Select target department:</p>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a department"
            value={moveTargetDepartment}
            onChange={setMoveTargetDepartment}
          >
            {departMent?.data?.map(d => (
              <Select.Option key={d._id} value={d._id}>{d.title}</Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
    </>
  );
};

export default StudentData;
