"use client";
import React, { useEffect, useState } from "react";
import Search from "antd/es/input/Search";
import allStudents from "./allstudents.module.scss";
import { useRouter } from "@bprogress/next/app";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAllStudents,
  removeAllStudents,
} from "@/redux/slices/tpo/getAllStudentsSlice";
import {
  createDepartment,
  DeleteDepartment,
  getAllDepartments,
  UpdateDepartment,
} from "@/redux/slices/tpo/departmentSlice";
import { getAllStudents as fetchAllStudents } from "@/redux/slices/tpo/dashboardSlice";
import DepartmentCard from "@/modules/tpo/components/DepartmentCard";
import PageHeader from "@/modules/tpo/components/PageHeader";
import { Button, Col, Input, message, Modal, Row, Select, Upload } from "antd";
import { restUrl } from "@/utils/universalUtils/urls";
import { handleS3Upload as uploadToS3 } from "@/utils/universalUtils/s3uploads";
import { FaUniversity, FaUserGraduate, FaUserTie } from "react-icons/fa";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  
  const [inputChange, setInputChange] = useState({
    title: "",
    hodName: "",
    mobile: "",
    email: "",
    spoc: "",
    branchLogo: "",
  });

  const { value: departMent, status: departmentStatus } = useSelector(
    (state) => state.department.getAllDepartments
  );

  const { value: StudentsLength, status: studentsStatus } = useSelector(
    (state) => state.dashboard.AllStudents
  );

  const studentsList = Array.isArray(StudentsLength?.data)
    ? StudentsLength.data
    : Array.isArray(StudentsLength)
    ? StudentsLength
    : [];

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllDepartments());
    dispatch(fetchAllStudents({}));
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const handleDetail = (departmentId, type) => {
    dispatch(removeAllStudents());
    switch (type) {
      case "EDIT":
        setIsEditing(true);
        const departmentDetails = departMent?.data?.find(
          (d) => d?._id === departmentId
        );
        if (departmentDetails) {
          let cleanMobile = (departmentDetails.mobile || "").replace(/\D/g, "");
          if (cleanMobile.length > 10) cleanMobile = cleanMobile.slice(-10);
          setInputChange({ ...departmentDetails, mobile: cleanMobile });
          setIsModalOpen(true);
        }
        return;
      case "DELETE":
        Modal.confirm({
          title: "Delete Department",
          content: "Are you sure you want to delete this department? This action cannot be undone.",
          okText: "Yes, Delete",
          okType: "danger",
          cancelText: "Cancel",
          onOk: () => handleDeleteDepartment(departmentId),
        });
        return;
      case "DELETE_ALL_STUDENTS":
        Modal.confirm({
          title: "Delete All Students",
          content: "Are you sure you want to delete all students in this department?",
          okText: "Yes, Delete All",
          okType: "danger",
          cancelText: "Cancel",
          onOk: () => dispatch(deleteAllStudents({ departmentId, dispatch })),
        });
        return;
      case "GET":
        router.push(`/tpo/allstudents/${departmentId}`);
        return;
      default:
        return;
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = (departmentId) => {
    dispatch(DeleteDepartment({ dispatch, DepartmentId: departmentId }));
  };

  const handleOk = (submitType) => {
    const { _id = "", ...rest } = inputChange;

    if (!rest.title?.trim() || !rest.hodName?.trim() || !rest.mobile?.trim() || !rest.email?.trim()) {
      return message.error("Please fill all required fields (Department Name, HOD, Mobile, Email)");
    }

    if (rest.mobile && rest.mobile.length > 0 && rest.mobile.length !== 10) {
      return message.error("Mobile number must be exactly 10 digits");
    }

    if (submitType === "Update") {
      dispatch(
        UpdateDepartment({ dispatch, payload: rest, DepartmentId: _id })
      );
    } else {
      dispatch(createDepartment({ dispatch, data: rest }));
    }

    setIsModalOpen(false);
    setIsEditing(false);
    setInputChange({
      title: "",
      hodName: "",
      mobile: "",
      email: "",
      spoc: "",
      branchLogo: "",
    });
    message.success("Department saved successfully");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setInputChange({
      title: "",
      hodName: "",
      mobile: "",
      email: "",
      spoc: "",
      branchLogo: "",
    });
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setInputChange((prev) => ({ ...prev, [name]: value }));
  };

  // Search functionality
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Summary Metrics
  const departmentsCount = departMent?.data?.length || 0;
  const studentsCount = (departMent?.data || []).reduce((acc, dept) => {
    const deptIdStr = dept?._id?.toString();
    const count = studentsList.filter(s => {
      const sDeptId = typeof s.department === 'object' ? s.department?._id?.toString() : s.department?.toString();
      return sDeptId === deptIdStr;
    }).length || 0;
    return acc + count;
  }, 0);
  const spocsCount = departMent?.data?.filter(
    (d) => d.spoc && d.spoc !== "N/A" && d.spoc !== "Not set" && d.spoc.trim() !== ""
  ).length || 0;

  // Filter & Search logic combined
  const filteredDepartments = Array.isArray(departMent?.data)
    ? departMent.data.filter((department) => {
        // Chip Filter
        if (filterType === "Active") {
          // Assume true unless explicitly marked inactive
          if (department.active === false) return false;
        } else if (filterType === "SPOC") {
          if (!department.spoc || department.spoc === "N/A" || department.spoc.trim() === "") return false;
        }

        // Search Query Filter
        if (!searchQuery.trim()) {
          return true;
        }
        const query = searchQuery.toLowerCase().trim();
        return (
          (department.title &&
            department.title.toLowerCase().includes(query)) ||
          (department.hodName &&
            department.hodName.toLowerCase().includes(query)) ||
          (department.mobile &&
            department.mobile.toLowerCase().includes(query)) ||
          (department.email &&
            department.email.toLowerCase().includes(query)) ||
          (department.spoc && department.spoc.toLowerCase().includes(query))
        );
      })
    : [];

  // Display all departments on a single page
  const paginatedDepartments = filteredDepartments;

  return (
    <div className={allStudents.container}>
      {/* Reusable Global Header Section */}
      <PageHeader
        title="All departments"
        subtitle="Manage departments, HODs, SPOCs and placement data"
        actionText="+ Add department"
        onActionClick={showModal}
      />

      <div className={allStudents.topSectionWrapper}>
        <div className={allStudents.leftControls}>
          <div className={allStudents.searchInput}>
            <Search
              placeholder="Search by name, HOD, email or SPOC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              allowClear
              onClear={() => setSearchQuery("")}
            />
          </div>
          
          <div className={allStudents.chipsContainer}>
            <span
              className={`${allStudents.chip} ${filterType === "All" ? allStudents.activeChip : ""}`}
              onClick={() => setFilterType("All")}
            >
              All • {departmentsCount}
            </span>
            <span
              className={`${allStudents.chip} ${filterType === "Active" ? allStudents.activeChip : ""}`}
              onClick={() => setFilterType("Active")}
            >
              Active
            </span>
            <span
              className={`${allStudents.chip} ${filterType === "SPOC" ? allStudents.activeChip : ""}`}
              onClick={() => setFilterType("SPOC")}
            >
              SPOC
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className={allStudents.miniStatsContainer}>
            <div className={`${allStudents.miniStat} ${allStudents.deptsStat}`}>
              <span className={allStudents.miniStatValue}>{departmentsCount}</span>
              <span className={allStudents.miniStatLabel}>Departments</span>
            </div>
            <div className={`${allStudents.miniStat} ${allStudents.studentsStat}`}>
              <span className={allStudents.miniStatValue}>{studentsCount}</span>
              <span className={allStudents.miniStatLabel}>Students</span>
            </div>
            <div className={`${allStudents.miniStat} ${allStudents.spocsStat}`}>
              <span className={allStudents.miniStatValue}>{spocsCount}</span>
              <span className={allStudents.miniStatLabel}>SPOCs</span>
            </div>
          </div>

          <Button type="primary" onClick={showModal}>
            + Add department
          </Button>
        </div>
      </div>

      <div className={allStudents.mainContent}>
        {/* Department Cards Grid */}
        <div className={allStudents.cardsList}>
          <div className={allStudents.cards}>
            {paginatedDepartments.map((item) => (
              <DepartmentCard
                key={item._id}
                item={item}
                studentsList={studentsList}
                handleClick={handleDetail}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      <Modal
        title={isEditing ? "Edit Department" : "Add New Department"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        style={{ marginTop: "-2rem" }}
        width={"60%"}
      >
        <div style={{ padding: "1rem" }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Department Name <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                name="title"
                value={inputChange.title}
                onChange={handleChange}
                placeholder="Enter department name"
              />
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Name of HOD <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                name="hodName"
                value={inputChange.hodName}
                onChange={handleChange}
                placeholder="Enter HOD name"
              />
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Mobile <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                name="mobile"
                value={inputChange.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                maxLength={10}
              />
              {inputChange.mobile && inputChange.mobile.length !== 10 && (
                <span style={{ color: "red", fontSize: "12px" }}>Must be exactly 10 digits</span>
              )}
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <Input
                name="email"
                value={inputChange.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>SPOC</label>
              <Input
                name="spoc"
                value={inputChange.spoc}
                onChange={handleChange}
                placeholder="Enter SPOC name"
              />
            </Col>
            <Col span={12}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
                Branch Logo
              </label>
              <Upload
                listType="picture-card"
                showUploadList={false}
                customRequest={({ file, onSuccess, onError }) =>
                  uploadToS3({
                    file,
                    restUrl,
                    onUploaded: (uploadedFile) =>
                      setInputChange((prev) => ({
                        ...prev,
                        branchLogo: uploadedFile,
                      })),
                    onSuccess,
                    onError,
                  })
                }
              >
                {inputChange.branchLogo ? (
                  <img
                    src={inputChange.branchLogo}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <div style={{ padding: "4px 12px" }}>+ Upload</div>
                )}
              </Upload>
            </Col>
          </Row>
          <div style={{ textAlign: "right", marginTop: "2rem" }}>
            <Button
              type="primary"
              onClick={() => handleOk(isEditing ? "Update" : "Create")}
              className="!bg-gradient-to-br !from-[#6BA8ED] !to-[#A3CCFA] !border-none !text-white"
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
