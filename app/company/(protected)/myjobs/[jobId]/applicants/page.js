"use client";
import StudentCard from "@/app/company/(protected)/skillsets/components/candidateCard";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import applicantStyles from "./applicants.module.scss";
import { DatePicker, Input, Button, Empty, Drawer, Modal } from "antd";
import dayjs from "dayjs";
import {
  getAllAppliedStudents,
} from "@/redux/slices/company/skillMedhaData";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { useParams } from "next/navigation";
import PageHeader from "@/modules/tpo/components/PageHeader";
import { FilterOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";

const Applicants = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const appliedStudents = useSelector((s) => s.skillmedha?.appliedStudents || []);
  const { value: { data: oneJobData } = {} } = useSelector(
    (state) => state.placement.OneJob || {}
  );

  const [dateRange, setDateRange] = useState(null);
  const [passYear, setPassYear] = useState(null);
  const [cgpa, setCgpa] = useState(null);
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
        dispatch(
          getAllAppliedStudents({
            studentIds: oneJobData?.applicants?.map((e) => e._id),
            jobId: oneJobData?._id,
            filter: {},
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // -------------------------------
  // 1. Fetch Job Once
  // -------------------------------
  useEffect(() => {
    dispatch(GetOneJob({ jobid: params.jobId }));
  }, [params.jobId, dispatch]);

  // -------------------------------
  // 2. Filter API Call Function
  // (memoized to prevent re-renders)
  // -------------------------------
  const applyFilter = useCallback(() => {
    if (!oneJobData?.applicants) return;

    const hasValidDates = dateRange && dateRange[0] && dateRange[1];

    dispatch(
      getAllAppliedStudents({
        studentIds: oneJobData?.applicants?.map((e) => e._id),
        jobId: oneJobData?._id,
        filter: {
          startDate: hasValidDates ? dateRange[0].format("YYYY-MM-DD") : null,
          endDate: hasValidDates ? dateRange[1].format("YYYY-MM-DD") : null,
          yearOfPass: passYear,
          CGPA: cgpa && parseFloat(cgpa) > 0 ? cgpa : null,
        },
      })
    );
  }, [dateRange, passYear, cgpa, oneJobData, dispatch]);

  // -------------------------------
  // 3. Call filter only when inputs change
  // -------------------------------
  useEffect(() => {
    if (oneJobData?.applicants?.length) {
      applyFilter();
    }
  }, [dateRange, passYear, cgpa, oneJobData?.applicants?.length, applyFilter]);

  // -------------------------------
  // 4. Clear selections when list changes
  // -------------------------------
  useEffect(() => {
    setSelectedStudentIds([]);
  }, [appliedStudents]);

  const onChangePassYear = (_, dateString) => setPassYear(dateString);

  const handleStudentSelect = (id, checked) => {
    setSelectedStudentIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const bannerStats = (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", paddingRight: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: "28px", fontWeight: "800", lineHeight: "1", color: "#ffffff" }}>
          {oneJobData?.applicants?.length || 0}
        </span>
        <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)", fontWeight: "600", marginTop: "4px" }}>
          Total Applicants
        </span>
      </div>

      <div style={{ width: "1px", height: "36px", backgroundColor: "rgba(255, 255, 255, 0.2)" }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: "28px", fontWeight: "800", lineHeight: "1", color: "#ffffff" }}>
          {appliedStudents?.length || 0}
        </span>
        <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)", fontWeight: "600", marginTop: "4px" }}>
          Filtered
        </span>
      </div>
    </div>
  );

  return (
    <div className={applicantStyles.container}>
      <PageHeader
        title={oneJobData?.jobTitle ? `${oneJobData.jobTitle} - Applicants` : "Job Applicants"}
        subtitle="Review candidate profiles, filter by qualifications, and manage job applications"
        rightSlot={bannerStats}
      />

      <div className={applicantStyles.filterCard}>
        <div className={applicantStyles.filterHeader}>
          <FilterOutlined style={{ color: "#1E69DA", fontSize: "1.1rem" }} />
          <span className={applicantStyles.filterTitle}>Filter Candidates</span>
        </div>

        <div className={applicantStyles.filterSec}>
          <div className={applicantStyles.filterGroup}>
            <label className={applicantStyles.filterLabel}>Min CGPA</label>
            <Input
              style={{ width: "9rem" }}
              allowClear
              type="number"
              title="CGPA"
              placeholder="CGPA (0-10)"
              max={10}
              value={cgpa || ""}
              onChange={(e) => {
                let val = e.target.value;
                if (parseFloat(val) > 10) val = 10;
                setCgpa(val);
              }}
            />
          </div>

          <div className={applicantStyles.filterGroup}>
            <label className={applicantStyles.filterLabel}>Passout Year</label>
            <DatePicker picker="year" placeholder="Select year" onChange={onChangePassYear} style={{ width: "10rem" }} />
          </div>

          <div className={applicantStyles.filterGroup}>
            <label className={applicantStyles.filterLabel}>Applied Date Range</label>
            <RangePicker
              format={dateFormat}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: "16rem" }}
            />
          </div>
        </div>
      </div>

      <div className={applicantStyles.bodyStyles}>
        {appliedStudents && appliedStudents.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className={applicantStyles.desktopOnly}>
              {appliedStudents.map((student) => (
                <StudentCard
                  key={student._id}
                  student={student}
                  width="100%"
                  jobId={oneJobData?._id}
                  assessmentId={oneJobData?.AssessmentId}
                  isSelected={selectedStudentIds.includes(student._id)}
                  onSelect={(checked) => handleStudentSelect(student._id, checked)}
                />
              ))}
            </div>

            {/* Mobile View: Small tiles */}
            <div className={`${applicantStyles.mobileOnly} ${applicantStyles.mobileTileList}`}>
              {appliedStudents.map((student) => {
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
                        style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }}
                      />
                    ) : (
                      <div className={applicantStyles.tileAvatar} style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#e0f2fe", color: "#0284c7", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", height: "auto" }}
                    >
                      {isSingleInvited ? "Assigned" : "Invite"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className={applicantStyles.emptyState}>
            <Empty description="No candidate applications match the selected criteria" />
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
                  style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div className={applicantStyles.drawerAvatar} style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#e0f2fe", color: "#0284c7", fontSize: "1.3rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            <div className={applicantStyles.actionRow} style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
              <Button
                type="default"
                disabled={!selectedStudentForDrawer.resumeDoc || selectedStudentForDrawer.resumeDoc.length < 5}
                onClick={() => {
                  setActiveResumeUrl(selectedStudentForDrawer.resumeDoc);
                  setIsPdfModalOpen(true);
                }}
                style={{ flex: 1, height: "40px", borderRadius: "8px", fontWeight: "600" }}
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
                style={{ flex: 1, height: "40px", borderRadius: "8px", fontWeight: "600" }}
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
              style={{ width: "100%", height: "100%", border: "none" }}
              title="Resume Document"
            />
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              No Resume Uploaded
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Applicants;
