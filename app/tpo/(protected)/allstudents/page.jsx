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
import { Button, Col, Input, message, Modal, Row, Upload } from "antd";
import { restUrl } from "@/utils/universalUtils/urls";
import { handleS3Upload as uploadToS3 } from "@/utils/universalUtils/s3uploads";
import { FaUniversity, FaUserGraduate, FaUserTie } from "react-icons/fa";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  
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
    if (departmentStatus !== "sucess" && departmentStatus !== "loading") {
      dispatch(getAllDepartments());
    }
    if (studentsStatus !== "succeeded" && studentsStatus !== "loading") {
      dispatch(fetchAllStudents({}));
    }
  }, [dispatch, departmentStatus, studentsStatus]);

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
          setInputChange({ ...departmentDetails });
          setIsModalOpen(true);
        }
        return;
      case "DELETE":
        handleDeleteDepartment(departmentId);
        return;
      case "DELETE_ALL_STUDENTS":
        dispatch(deleteAllStudents({ departmentId, dispatch }));
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
    const { name, value } = e.target;
    setInputChange((prev) => ({ ...prev, [name]: value }));
  };

  // Search functionality
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Summary Metrics
  const departmentsCount = departMent?.data?.length || 0;
  const studentsCount = studentsList.length;
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
        } else if (filterType === "Incomplete") {
          const hasIncomplete = !department.hodName || department.hodName === "N/A" || !department.spoc || department.spoc === "N/A";
          if (!hasIncomplete) return false;
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

  const totalDepartments = filteredDepartments.length;
  const totalPages = Math.ceil(totalDepartments / pageSize) || 1;
  const activePage = currentPage > totalPages ? 1 : currentPage;
  const paginatedDepartments = filteredDepartments.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  return (
    <div className={allStudents.container}>
      {/* Reusable Global Header Section */}
      <PageHeader
        breadcrumb="All departments"
        title="All departments"
        subtitle="Manage departments, HODs, SPOCs and placement data"
        actionText="+ Add department"
        onActionClick={showModal}
      />

      <div className={allStudents.mainContent}>
        {/* Department Summary Cards */}
        <div className={allStudents.summaryGrid}>
          <div className={`${allStudents.summaryCard} ${allStudents.deptsCard}`}>
            <div className={`${allStudents.iconWrapper} ${allStudents.depts}`}>
              <FaUniversity />
            </div>
            <div className={allStudents.summaryInfo}>
              <span className={allStudents.summaryValue}>{departmentsCount}</span>
              <span className={allStudents.summaryLabel}>Departments</span>
            </div>
          </div>
          <div className={`${allStudents.summaryCard} ${allStudents.studentsCard}`}>
            <div className={`${allStudents.iconWrapper} ${allStudents.students}`}>
              <FaUserGraduate />
            </div>
            <div className={allStudents.summaryInfo}>
              <span className={allStudents.summaryValue}>{studentsCount}</span>
              <span className={allStudents.summaryLabel}>Students registered</span>
            </div>
          </div>
          <div className={`${allStudents.summaryCard} ${allStudents.spocsCard}`}>
            <div className={`${allStudents.iconWrapper} ${allStudents.spocs}`}>
              <FaUserTie />
            </div>
            <div className={allStudents.summaryInfo}>
              <span className={allStudents.summaryValue}>{spocsCount}</span>
              <span className={allStudents.summaryLabel}>SPOCs assigned</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Chips Row */}
        <div className={allStudents.searchFilterRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
              <span
                className={`${allStudents.chip} ${filterType === "Incomplete" ? allStudents.activeChip : ""}`}
                onClick={() => setFilterType("Incomplete")}
              >
                Incomplete data
              </span>
            </div>
          </div>
          <Button type="primary" onClick={showModal}>
            + Add department
          </Button>
        </div>

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

        {/* Pagination Row */}
        <div className={allStudents.paginationRow}>
          <div className={allStudents.showingText}>
            Showing {paginatedDepartments.length} departments • Page {activePage} of {totalPages}
          </div>
          <div className={allStudents.paginationControls}>
            <button
              className={allStudents.pageBtn}
              disabled={activePage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${allStudents.pageBtn} ${activePage === page ? allStudents.activePageBtn : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={allStudents.pageBtn}
              disabled={activePage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
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
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>Department Name</label>
              <Input
                name="title"
                value={inputChange.title}
                onChange={handleChange}
                placeholder="Enter department name"
              />
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>Name of HOD</label>
              <Input
                name="hodName"
                value={inputChange.hodName}
                onChange={handleChange}
                placeholder="Enter HOD name"
              />
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>Mobile</label>
              <Input
                name="mobile"
                value={inputChange.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}>Email</label>
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
