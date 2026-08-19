"use client";
import StudentCard from "@/app/company/(protected)/skillsets/components/candidateCard";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import applicantStyles from "./styles/applicants.module.scss";
import { DatePicker, Input, Button, Checkbox, Empty, Drawer, Modal, Tooltip, Avatar } from "antd";
import dayjs from "dayjs";
import {
  getAllAppliedStudents,
  addAssessmentToStudent,
} from "@/redux/slices/company/skillMedhaData";
import { useDispatch } from "react-redux";

const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";

const Applicants = () => {
  const dispatch = useDispatch();
  const appliedStudents = useSelector((s) => s.skillmedha?.appliedStudents ?? {});
  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.placement.OneJob || {}
  );

  const [dateRange, setDateRange] = useState(null);
  const [passYear, setPassYear] = useState(null);
  const [cgpa, setCgpa] = useState(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  // Drawer and Modal States for Mobile view
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activeResumeUrl, setActiveResumeUrl] = useState("");

  // Helper calculation functions for Candidate Details
  const getInitials = (name = "") => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name[0] || "U").toUpperCase();
  };

  const getFullName = (s) => {
    if (!s) return "";
    return `${s.firstName || ""} ${s.middleName ? s.middleName + " " : ""}${s.lastName || ""}`.trim() || s.userName || "Unnamed";
  };

  const getLocation = (s) => {
    const addr = s?.addresses;
    if (addr?.currentAddress?.cityName && addr?.currentAddress?.stateName) {
      return `${addr.currentAddress.cityName}, ${addr.currentAddress.stateName}`;
    }
    if (addr?.permanentAddress?.cityName && addr?.permanentAddress?.stateName) {
      return `${addr.permanentAddress.cityName}, ${addr.permanentAddress.stateName}`;
    }
    return addr?.currentAddress?.cityName || addr?.permanentAddress?.cityName || "Not specified";
  };

  const formatGrade = (edu) => {
    if (!edu) return "Not specified";
    const grade = edu.grade;
    const gradingSystem = edu.gradingSystem;
    if (gradingSystem === "percentage") {
      return `${grade} %`;
    } else if (gradingSystem === "cgpa" || gradingSystem === "gpa") {
      return `${grade} CGPA`;
    } else if (grade < 10) {
      return `${grade} CGPA`;
    } else {
      return `${grade} %`;
    }
  };

  const getLatestEducation = (eduDetails) => {
    if (!eduDetails || eduDetails.length === 0) return null;
    const valid = eduDetails.filter((edu) => edu.grade && edu.grade.trim() !== "");
    if (valid.length === 0) return null;
    return valid.sort((a, b) => (b.yearofPass || 0) - (a.yearofPass || 0))[0] || eduDetails[0];
  };

  const calculateExperience = (exps) => {
    const valid = exps?.filter(
      (exp) =>
        exp?.company?.trim() &&
        exp?.role?.trim() &&
        exp?.start?.trim() &&
        exp?.end?.trim()
    ) || [];

    if (valid.length === 0) return "Fresher";

    let totalMonths = 0;
    valid.forEach((exp) => {
      try {
        const parseDate = (dateStr) => {
          if (!dateStr) return null;
          const mmYyyyMatch = dateStr.match(/^(\d{2})\/(\d{4})$/);
          if (mmYyyyMatch) {
            return new Date(parseInt(mmYyyyMatch[2], 10), parseInt(mmYyyyMatch[1], 10) - 1, 1);
          }
          return new Date(dateStr);
        };
        const startDate = parseDate(exp.start);
        const endDate = parseDate(exp.end);
        if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
          const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
          totalMonths += Math.max(0, monthsDiff);
        }
      } catch (e) {}
    });

    const totalYears = totalMonths / 12;
    if (totalMonths < 1) return "Fresher";
    if (totalMonths < 6) return `${totalMonths} months`;
    if (totalYears < 1) return "6+ months";
    return `${Math.floor(totalYears)}+ Years`;
  };

  const handleInviteSingle = async (studentId) => {
    try {
      const addAssessmentResult = await dispatch(
        addAssessmentToStudent({
          studentIds: [studentId],
          jobId: oneJobData?._id,
          assessmentId: oneJobData?.AssessmentId,
        })
      );

      if (addAssessmentResult) {
        await dispatch(
          getAllAppliedStudents({
            studentIds: oneJobData?.applicants?.map((e) => e?._id),
            jobId: oneJobData?._id,
          })
        );
      }
    } catch (error) {
      console.error("Error in individual invite:", error);
    }
  };

  const applyFilter = () => {
    const hasValidDates = dateRange && dateRange[0] && dateRange[1];

    dispatch(
      getAllAppliedStudents({
        studentIds: oneJobData?.applicants?.map((e) => e?._id),
        jobId: oneJobData?._id,
        filter: {
          startDate: hasValidDates ? dateRange[0].format("YYYY-MM-DD") : null,
          endDate: hasValidDates ? dateRange[1].format("YYYY-MM-DD") : null,
          yearOfPass: passYear,
          CGPA: cgpa && parseFloat(cgpa) > 0 ? cgpa : null,
        },
      })
    );
  };

  // Apply filters when any filter value changes
  useEffect(() => {
    if (oneJobData?.applicants?.length > 0) {
      applyFilter();
    }
  }, [dateRange, passYear, cgpa, oneJobData?.applicants]);

  // Clear selected students when applied students change (after filtering)
  useEffect(() => {
    setSelectedStudentIds([]);
  }, [appliedStudents]);

  const onChange = (date, dateString) => {
    setPassYear(dateString);
  };

  // Handle select all functionality
  const handleSelectAll = (checked) => {
    if (checked) {
      const allStudentIds =
        appliedStudents?.map((student) => student._id) || [];
      setSelectedStudentIds(allStudentIds);
    } else {
      setSelectedStudentIds([]);
    }
  };

  // Handle individual student selection
  const handleStudentSelect = (studentId, checked) => {
    if (checked) {
      setSelectedStudentIds((prev) => [...prev, studentId]);
    } else {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  // Handle bulk invite
  const handleBulkInvite = async () => {
    if (selectedStudentIds.length === 0) return;

    try {
      const addAssessmentResult = await dispatch(
        addAssessmentToStudent({
          studentIds: selectedStudentIds,
          jobId: oneJobData?._id,
          assessmentId: oneJobData?.AssessmentId,
        })
      );

      if (addAssessmentResult) {
        await dispatch(
          getAllAppliedStudents({
            studentIds: oneJobData?.applicants?.map((e) => e?._id),
            jobId: oneJobData?._id,
          })
        );

        // Clear selection after successful invite
        setSelectedStudentIds([]);
      }
    } catch (error) {
    }
  };

  // Check if all students are selected
  const isAllSelected =
    appliedStudents?.length > 0 &&
    selectedStudentIds.length === appliedStudents.length;

  // Check if some students are selected (for indeterminate state)
  const isSomeSelected =
    selectedStudentIds.length > 0 &&
    selectedStudentIds.length < appliedStudents?.length;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const onPageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const currentApplicants = appliedStudents || [];

  return (
    <div className={applicantStyles.container}>
      <div className={applicantStyles.headContainer} style={{ justifyContent: "flex-end" }}>
        <div className={applicantStyles.filterSec}>
          <Input
            style={{ width: "10rem" }}
            allowClear
            type="number"
            title="CGPA"
            placeholder="CGPA (0-10)"
            max="10"
            value={cgpa || ""}
            onChange={(e) => {
              let val = e.target.value;
              if (parseFloat(val) > 10) {
                val = 10;
              }
              setCgpa(val);
            }}
          />
          <DatePicker onChange={onChange} picker="year" />
          <RangePicker
            popupClassName={applicantStyles.mobileRangePicker}
            format={dateFormat}
            onChange={(dates) => setDateRange(dates)}
            value={dateRange}
          />
        </div>
      </div>

      {/* Selection Controls */}
      {appliedStudents?.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "1rem 0",
            padding: "0.75rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "0.5rem",
          }}
        >
          <Checkbox
            checked={isAllSelected}
            indeterminate={isSomeSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            Select All ({appliedStudents.length} students)
          </Checkbox>

          {selectedStudentIds.length > 0 && (
            <span style={{ color: "#666", fontSize: "0.875rem" }}>
              {selectedStudentIds.length} selected
            </span>
          )}

          <Button
            type="primary"
            disabled={selectedStudentIds.length === 0}
            onClick={handleBulkInvite}
            style={{ marginLeft: "auto" }}
          >
            Invite Selected ({selectedStudentIds.length})
          </Button>
        </div>
      )}
      <div className={applicantStyles.bodyStyles}>
        {appliedStudents?.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className={applicantStyles.desktopOnly}>
              {currentApplicants.map((student, index) => {
                return (
                  <StudentCard
                    student={student}
                    key={student?._id}
                    width={"100%"}
                    type="results"
                    jobId={oneJobData?._id}
                    assessmentId={oneJobData?.AssessmentId}
                    isSelected={selectedStudentIds.includes(student._id)}
                    onSelect={(checked) =>
                      handleStudentSelect(student._id, checked)
                    }
                  />
                );
              })}
            </div>

            {/* Mobile View: Small tiles */}
            <div className={`${applicantStyles.mobileOnly} ${applicantStyles.mobileTileList}`}>
              {currentApplicants.map((student) => {
                const sName = getFullName(student);
                const isSingleInvited = student?.appliedJobs?.find((e) => e?.id === oneJobData?._id)?.assessments;

                return (
                  <div
                    key={student._id}
                    className={applicantStyles.studentMobileTile}
                    onClick={() => {
                      setSelectedStudentForDrawer(student);
                      setIsDrawerOpen(true);
                    }}
                  >
                    <input
                      type="checkbox"
                      className={applicantStyles.tileCheckbox}
                      checked={selectedStudentIds.includes(student._id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStudentSelect(student._id, e.target.checked)}
                    />
                    {student.profile ? (
                      <img
                        src={student.profile}
                        alt="avatar"
                        className={applicantStyles.tileAvatarImg}
                      />
                    ) : (
                      <div className={applicantStyles.tileAvatar}>
                        {getInitials(sName)}
                      </div>
                    )}
                    <div className={applicantStyles.tileInfo}>
                      <span className={applicantStyles.tileName}>{sName}</span>
                      <span className={applicantStyles.tileEmail}>{student.email || "No Email"}</span>
                    </div>

                    <Button
                      type="primary"
                      className={applicantStyles.inviteButton}
                      disabled={isSingleInvited}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInviteSingle(student._id);
                      }}
                    >
                      {isSingleInvited ? "Assigned" : "Invite"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ padding: "50px", textAlign: "center" }}>
            <Empty
              description="No students have applied for this position yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>

      {/* Bottom Drawer for Mobile View */}
      <Drawer
        title="Applicant Details"
        placement="bottom"
        closable={true}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        height="90vh"
        bodyStyle={{ padding: "1.25rem" }}
        headerStyle={{ borderBottom: "1px solid #f1f5f9" }}
        style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px", overflow: "hidden" }}
      >
        {selectedStudentForDrawer && (
          <div className={applicantStyles.drawerContent}>
            {/* Drawer Header */}
            <div className={applicantStyles.drawerHeader}>
              {selectedStudentForDrawer.profile ? (
                <img
                  src={selectedStudentForDrawer.profile}
                  alt="Avatar"
                  className={applicantStyles.drawerAvatarImg}
                />
              ) : (
                <div className={applicantStyles.drawerAvatar}>
                  {getInitials(getFullName(selectedStudentForDrawer))}
                </div>
              )}
              <div className={applicantStyles.drawerMainInfo}>
                <span className={applicantStyles.drawerName}>
                  {getFullName(selectedStudentForDrawer)}
                </span>
                <span className={applicantStyles.drawerEmail}>
                  {selectedStudentForDrawer.email || "No Email"}
                </span>
              </div>
            </div>

            {/* Candidate details */}
            <div className={applicantStyles.drawerDetailGrid}>
              <div className={applicantStyles.detailItem}>
                <span className={applicantStyles.detailLabel}>ACADEMICS</span>
                <span className={applicantStyles.detailValue}>
                  {formatGrade(getLatestEducation(selectedStudentForDrawer.educationDetails))}
                </span>
                {getLatestEducation(selectedStudentForDrawer.educationDetails) && (
                  <span className={applicantStyles.detailSubText}>
                    {getLatestEducation(selectedStudentForDrawer.educationDetails).degreeName || 
                     getLatestEducation(selectedStudentForDrawer.educationDetails).type} ({getLatestEducation(selectedStudentForDrawer.educationDetails).yearofPass})
                  </span>
                )}
              </div>

              <div className={applicantStyles.detailItem}>
                <span className={applicantStyles.detailLabel}>EDUCATION</span>
                <span className={applicantStyles.detailValue}>
                  {selectedStudentForDrawer.college?.name || 
                   getLatestEducation(selectedStudentForDrawer.educationDetails)?.school || 
                   "Not specified"}
                </span>
              </div>

              <div className={applicantStyles.detailItem}>
                <span className={applicantStyles.detailLabel}>EXPERIENCE</span>
                <span className={applicantStyles.detailValue}>
                  {calculateExperience(selectedStudentForDrawer.experiences)}
                </span>
              </div>

              <div className={applicantStyles.detailItem}>
                <span className={applicantStyles.detailLabel}>LANGUAGES</span>
                <span className={applicantStyles.detailValue}>
                  {selectedStudentForDrawer.languages?.length ? 
                   selectedStudentForDrawer.languages.join(", ") : "Not specified"}
                </span>
              </div>

              <div className={applicantStyles.detailItem}>
                <span className={applicantStyles.detailLabel}>TECHNICAL SKILLS</span>
                <span className={applicantStyles.detailValue}>
                  {selectedStudentForDrawer.technical?.length ? 
                   selectedStudentForDrawer.technical.join(", ") : "Not specified"}
                </span>
              </div>

              <div className={applicantStyles.detailItem}>
                <span className={applicantStyles.detailLabel}>CONTACT NUMBER</span>
                <span className={applicantStyles.detailValue}>
                  {selectedStudentForDrawer.phone || "Not provided"}
                </span>
              </div>

              <div className={applicantStyles.detailItem}>
                <span className={applicantStyles.detailLabel}>LOCATION</span>
                <span className={applicantStyles.detailValue}>
                  {getLocation(selectedStudentForDrawer)}
                </span>
              </div>

              <div className={applicantStyles.detailItem}>
                <span className={applicantStyles.detailLabel}>GRADUATION YEAR</span>
                <span className={applicantStyles.detailValue}>
                  {selectedStudentForDrawer.yearOfPassing || "Not specified"}
                </span>
              </div>
            </div>

            {/* Action Row */}
            <div className={applicantStyles.actionRow}>
              <Button
                type="default"
                disabled={!selectedStudentForDrawer.resumeDoc || selectedStudentForDrawer.resumeDoc.length < 5}
                onClick={() => {
                  setActiveResumeUrl(selectedStudentForDrawer.resumeDoc);
                  setIsPdfModalOpen(true);
                }}
              >
                View Resume
              </Button>
              <Button
                type="primary"
                disabled={selectedStudentForDrawer?.appliedJobs?.find((e) => e?.id === oneJobData?._id)?.assessments}
                onClick={() => {
                  handleInviteSingle(selectedStudentForDrawer._id);
                  setIsDrawerOpen(false);
                }}
              >
                {selectedStudentForDrawer?.appliedJobs?.find((e) => e?.id === oneJobData?._id)?.assessments ? 
                 "Assigned" : "Invite"}
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* PDF View Modal */}
      <Modal
        title="PDF Viewer"
        open={isPdfModalOpen}
        onCancel={() => {
          setIsPdfModalOpen(false);
          setActiveResumeUrl("");
        }}
        footer={null}
        width={null}
        style={{
          width: "98vw",
          maxWidth: "1000px",
          top: "10px",
        }}
        bodyStyle={{
          height: "80vh",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div style={{ height: "100%", width: "100%" }}>
          {activeResumeUrl ? (
            <iframe
              src={`${activeResumeUrl}#view=FitH`}
              width="100%"
              height="100%"
              style={{ border: "none", minHeight: "70vh" }}
              title="PDF Viewer"
            />
          ) : (
            <p style={{ textAlign: "center", padding: "2rem" }}>
              Resume not available
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Applicants;
