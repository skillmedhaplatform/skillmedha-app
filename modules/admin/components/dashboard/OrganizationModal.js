"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrganizationById,
  fetchDepartmentsByOrg,
  fetchStudentsByDepartment,
  clearSelectedOrg,
} from "@/redux/slices/admin/adminDashboardSlice";
import { X, Building2, Users, FolderTree, ChevronRight } from "lucide-react";
import styles from "./OrganizationModal.module.scss";

export default function OrganizationModal({ orgId, onClose }) {
  const dispatch = useDispatch();
  const { selectedOrg, departments, students, loading } = useSelector(
    (state) => state.adminDashboard
  );

  const [activeTab, setActiveTab] = useState("departments"); // departments, students
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (orgId) {
      dispatch(fetchOrganizationById(orgId));
      dispatch(fetchDepartmentsByOrg(orgId));
    }

    return () => {
      dispatch(clearSelectedOrg());
    };
  }, [orgId, dispatch]);

  const handleDepartmentClick = (deptId) => {
    setSelectedDeptId(deptId);
    setActiveTab("students");
    dispatch(
      fetchStudentsByDepartment({
        orgId,
        departmentId: deptId,
        page: 1,
        search: searchQuery,
      })
    );
  };

  const handleBackToDepartments = () => {
    setActiveTab("departments");
    setSelectedDeptId(null);
  };

  const handleSearchStudents = (e) => {
    e.preventDefault();
    if (selectedDeptId) {
      dispatch(
        fetchStudentsByDepartment({
          orgId,
          departmentId: selectedDeptId,
          page: 1,
          search: searchQuery,
        })
      );
    }
  };

  if (!selectedOrg) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <Building2 size={24} className={styles.headerIcon} />
            <div>
              <h2>{selectedOrg.orgName}</h2>
              <p>{selectedOrg.email}</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={activeTab === "departments" ? styles.active : ""}
            onClick={() => setActiveTab("departments")}
          >
            <FolderTree size={18} />
            Departments ({departments.length})
          </button>
          <button
            className={activeTab === "students" ? styles.active : ""}
            disabled={!selectedDeptId}
          >
            <Users size={18} />
            Students {selectedDeptId && `(${students.totalCount})`}
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalBody}>
          {activeTab === "departments" && (
            <div className={styles.departmentsList}>
              {loading.departments ? (
                <div className={styles.loading}>Loading departments...</div>
              ) : departments.length === 0 ? (
                <div className={styles.empty}>No departments found</div>
              ) : (
                departments.map((dept) => (
                  <div
                    key={dept._id}
                    className={styles.departmentCard}
                    onClick={() => handleDepartmentClick(dept._id)}
                  >
                    <div className={styles.deptInfo}>
                      <FolderTree size={20} />
                      <div>
                        <h4>{dept.title}</h4>
                        <p>HOD: {dept.hodName}</p>
                      </div>
                    </div>
                    <div className={styles.deptStats}>
                      <span>
                        <Users size={16} /> {dept.studentCount || 0} students
                      </span>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "students" && (
            <div className={styles.studentsList}>
              <div className={styles.studentsHeader}>
                <button
                  className={styles.backButton}
                  onClick={handleBackToDepartments}
                >
                  ← Back to Departments
                </button>

                <form
                  className={styles.searchForm}
                  onSubmit={handleSearchStudents}
                >
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit">Search</button>
                </form>
              </div>

              {loading.students ? (
                <div className={styles.loading}>Loading students...</div>
              ) : students.list.length === 0 ? (
                <div className={styles.empty}>No students found</div>
              ) : (
                <div className={styles.studentsGrid}>
                  {students.list.map((student) => (
                    <div key={student._id} className={styles.studentCard}>
                      <div className={styles.studentAvatar}>
                        {student.userName?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div className={styles.studentInfo}>
                        <h5>{student.userName}</h5>
                        <p>{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {students.totalPages > 1 && (
                <div className={styles.pagination}>
                  <span>
                    Page {students.currentPage} of {students.totalPages}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
