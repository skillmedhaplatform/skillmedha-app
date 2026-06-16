// "use client";
// import React, { useState } from "react";
// import {
//   Card,
//   Avatar,
//   Typography,
//   Row,
//   Col,
//   Button,
//   Modal,
//   Tooltip,
// } from "antd";
// import { UserOutlined } from "@ant-design/icons";
// import { useSelector } from "react-redux";
// import { useParams, useRouter } from "next/navigation";
// import { useDispatch } from "react-redux";
// import { addAssessmentToStudent, getAllAppliedStudents, getOneJobAssessment } from "@/redux/slices/company/skillMedhaData";

// const { Title, Text } = Typography;

// const StudentCard = ({ student, width, type = "", jobId="" ,
//         assessmentId="" }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const router = useRouter();
//   const params = useParams();
//   const showModal = () => {
//     setIsModalOpen(true);
//   };

//   const handleClose = () => {
//     setIsModalOpen(false);
//   };

//   const dispatch = useDispatch()
//   if (!student) return null;

//   const {
//     firstName,
//     lastName,
//     email,
//     phone,
//     college,
//     yearOfPassing,
//     verified,
//     userName,
//     middleName,
//     experiences = [],
//     languages = [],
//     technical = [],
//     profile,
//     addresses,
//     professionalSummary,
//     educationDetails = [],
//   } = student;

//   const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
//     student?.resumeDoc
//   )}&embedded=true`;
//   const { value: { data: oneJobData } = {}, status } = useSelector(
//     (state) => state.placement.OneJob || {}
//   );

//   const fullName = `${firstName || ""} ${middleName ? middleName + " " : ""}${
//     lastName || ""
//   }`.trim();

//   // Updated function to handle your actual data structure
//   const calculateExperienceFromDates = (experiences) => {
//     const validExperiences =
//       experiences?.filter(
//         (exp) =>
//           exp?.company?.trim() &&
//           exp?.role?.trim() &&
//           exp?.start?.trim() &&
//           exp?.end?.trim()
//       ) || [];

//     if (validExperiences.length === 0) return { years: 0, text: "Fresher" };

//     let totalMonths = 0;

//     validExperiences.forEach((exp) => {
//       try {
//         const parseDate = (dateStr) => {
//           if (!dateStr) return null;

//           const mmYyyyMatch = dateStr.match(/^(\d{2})\/(\d{4})$/);
//           if (mmYyyyMatch) {
//             const month = parseInt(mmYyyyMatch[1]) - 1;
//             const year = parseInt(mmYyyyMatch[2]);
//             return new Date(year, month, 1);
//           }

//           return new Date(dateStr);
//         };

//         const startDate = parseDate(exp.start);
//         const endDate = parseDate(exp.end);

//         if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
//           const startYear = startDate.getFullYear();
//           const startMonth = startDate.getMonth();
//           const endYear = endDate.getFullYear();
//           const endMonth = endDate.getMonth();

//           const monthsDiff =
//             (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
//           totalMonths += Math.max(0, monthsDiff);
//         }
//       } catch (error) {
//         console.warn("Error parsing experience dates:", exp, error);
//       }
//     });

//     const totalYears = totalMonths / 12;

//     if (totalMonths < 1)
//       return { years: totalYears, text: "Less than 1 month" };
//     if (totalMonths < 6)
//       return {
//         years: totalYears,
//         text: `${totalMonths} month${totalMonths > 1 ? "s" : ""}`,
//       };
//     if (totalYears < 1) return { years: totalYears, text: "6+ months" };
//     if (totalYears < 2) return { years: totalYears, text: "1+ Years" };
//     if (totalYears < 3) return { years: totalYears, text: "2+ Years" };
//     if (totalYears < 5)
//       return { years: totalYears, text: `${Math.floor(totalYears)}+ Years` };

//     return { years: totalYears, text: `${Math.floor(totalYears)}+ Years` };
//   };

//   const isValidExperience = (exp) => {
//     return (
//       exp &&
//       exp.company &&
//       exp.company.trim() !== "" &&
//       exp.role &&
//       exp.role.trim() !== ""
//     );
//   };

//   // Get latest education with grade
//   const getLatestEducation = (educationDetails) => {
//     if (!educationDetails || educationDetails.length === 0) return null;

//     // Filter out education entries without grades
//     const validEducation = educationDetails.filter(
//       (edu) => edu.grade && edu.grade.trim() !== ""
//     );

//     if (validEducation.length === 0) return null;

//     // Sort by year of passing (most recent first)
//     const sortedEducation = validEducation.sort(
//       (a, b) => (b.yearofPass || 0) - (a.yearofPass || 0)
//     );

//     return sortedEducation[0];
//   };

//   // Calculate experience based on actual duration
//   const experienceCalculation = calculateExperienceFromDates(experiences);
//   const experienceYears = experienceCalculation.text;

//   // Get latest valid experience for designation
//   const validExperiences = experiences?.filter(isValidExperience) || [];
//   const latestExperience =
//     validExperiences.length > 0 ? validExperiences[0] : null;

//   // Get latest education
//   const latestEducation = getLatestEducation(educationDetails);

//   // Format grade display
//   const formatGrade = (education) => {
//     if (!education) return "Not specified";

//     const grade = education.grade;
//     const gradingSystem = education.gradingSystem;

//     if (gradingSystem === "percentage") {
//       return `${grade} %`;
//     } else if (gradingSystem === "cgpa" || gradingSystem === "gpa") {
//       return `${grade} CGPA`;
//     } else if (grade < 10) {
//       return `${grade} CGPA`;
//     } else {
//       return `${grade} %`;
//     }
//   };

//   // Fixed location logic
//   const location =
//     addresses?.currentAddress?.cityName && addresses?.currentAddress?.stateName
//       ? `${addresses.currentAddress.cityName}, ${addresses.currentAddress.stateName}`
//       : addresses?.permanentAddress?.cityName &&
//         addresses?.permanentAddress?.stateName
//       ? `${addresses.permanentAddress.cityName}, ${addresses.permanentAddress.stateName}`
//       : addresses?.currentAddress?.cityName ||
//         addresses?.permanentAddress?.cityName ||
//         "Not specified";

// const onInvite = async () => {
//   try {
//     const addAssessmentResult = await dispatch(addAssessmentToStudent({
//       studentIds: [student?._id],
//       jobId,
//       assessmentId
//     }));

//     // Check if the assessment was successfully added
//     if (addAssessmentResult) {
//       // Call getAllAppliedStudents immediately after successful assessment assignment
//       await dispatch(
//         getAllAppliedStudents({
//           studentIds: oneJobData?.applicants?.map((e) => e?._id),
//           jobId: oneJobData?._id
//         })
//       );

//       // Optional: Show success message
//       console.log('Assessment assigned and students data refreshed successfully');
//     } else {
//       console.error('Failed to add assessment to student');
//     }
//   } catch (error) {
//     console.error('Error in onInvite:', error);
//   }
// };

//     const studentInviteDisable = student?.appliedJobs?.find((e) => e?.id == jobId)
//   return (
//     <Card
//       bodyStyle={{ padding: "1.5rem" }}
//       style={{
//         borderRadius: "0.75rem",
//         boxShadow: "0 0.125rem 0.5rem rgba(0,0,0,0.06)",
//         position: "relative",
//         width: width ? width : "80%", // Changed from 100% to 80%
//         margin: "0 auto",
//         marginBottom: "1rem",
//         border: "1px solid #00000033",
//       }}
//     >
//       {/* Header with Avatar and Basic Info */}
//       <Row gutter={16} align="top">
//         <Col>
//           <Avatar
//             size={80}
//             src={profile}
//             icon={<UserOutlined />}
//             style={{ marginBottom: "0.5rem" }}
//           />
//         </Col>

//         <Col flex="auto">
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "flex-start",
//             }}
//           >
//             <div>
//               <Title
//                 level={4}
//                 style={{
//                   marginBottom: "0.25rem",
//                   color: "#25A3A6",
//                   fontSize: "1.25rem",
//                   textAlign: "left",
//                   margin: 0,
//                   textDecoration: "underline",
//                   cursor: "pointer",
//                 }}
//               >
//                 {fullName || userName || "Unnamed"}
//               </Title>
//               {/* Added email below name */}
//               <Text
//                 style={{
//                   fontSize: "0.875rem",
//                   color: "#666",
//                   display: "block",
//                 }}
//               >
//                 {email || "Not provided"}
//               </Text>
//             </div>

//             {/* View Resume Button */}
//             <Tooltip
//               title={
//                 !student?.resumeDoc || student.resumeDoc.length < 5
//                   ? "Resume not updated"
//                   : ""
//               }
//             >
//               <Button
//                 type="link"
//                 style={{
//                   padding: 0,
//                   color: "#25A3A6",
//                   fontSize: "0.875rem",
//                 }}
//                 onClick={showModal}
//                 disabled={!student?.resumeDoc || student.resumeDoc.length < 5}
//               >
//                 View Resume
//               </Button>
//             </Tooltip>
//           </div>
//         </Col>
//       </Row>

//       {/* Main Content Grid */}
//       <Row gutter={[24, 16]} style={{ marginTop: "1.25rem" }}>
//         {/* Left Column */}
//         <Col xs={24} md={8}>
//           {/* Latest Education Grade - Replaced Designation */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               LATEST EDUCATION GRADE
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>
//                 {formatGrade(latestEducation)}
//               </Text>
//               {latestEducation && (
//                 <Text
//                   style={{
//                     fontSize: "0.75rem",
//                     color: "#999",
//                     display: "block",
//                   }}
//                 >
//                   {latestEducation.degreeName || latestEducation.type} (
//                   {latestEducation.yearofPass})
//                 </Text>
//               )}
//             </div>
//           </div>

//           {/* Education */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               EDUCATION
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>
//                 {college?.name || latestEducation?.school || "Not specified"}
//               </Text>
//             </div>
//           </div>

//           {/* Experience - Now based on actual duration */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               EXPERIENCE
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>{experienceYears}</Text>
//             </div>
//           </div>
//         </Col>

//         {/* Middle Column */}
//         <Col xs={24} md={8}>
//           {/* Languages */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               LANGUAGES
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>
//                 {languages.length ? languages.join(", ") : "Not specified"}
//               </Text>
//             </div>
//           </div>

//           {/* Technical Skills */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               TECHNICAL SKILLS
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>
//                 {technical.length ? technical.join(", ") : "Not specified"}
//               </Text>
//             </div>
//           </div>

//           {/* Contact Number */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               CONTACT NUMBER
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>
//                 {phone || "Not provided"}
//               </Text>
//             </div>
//           </div>
//         </Col>

//         {/* Right Column */}
//         <Col xs={24} md={8}>
//           {/* Current Role - Moved Email to header */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               CURRENT ROLE
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>
//                 {latestExperience?.role || "Student"}
//               </Text>
//             </div>
//           </div>

//           {/* Location */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               LOCATION
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>{location}</Text>
//             </div>
//           </div>

//           {/* Graduation Year */}
//           <div style={{ marginBottom: "1rem" }}>
//             <Text
//               strong
//               style={{
//                 color: "#666",
//                 fontSize: "0.75rem",
//                 letterSpacing: "0.05em",
//               }}
//             >
//               GRADUATION YEAR
//             </Text>
//             <div>
//               <Text style={{ fontSize: "0.875rem" }}>
//                 {yearOfPassing || "Not specified"}
//               </Text>
//             </div>
//           </div>

//           {/* Invite Button */}
//         </Col>
//       </Row>
//       <div
//         style={{
//           alignItems: "flex-end",
//           justifyContent: "flex-end",
//           display: "flex",
//           width: "100%",
//           gap: "2rem",
//         }}
//       >
//         {type === "results" &&<Button type="primary" disabled={studentInviteDisable?.assessments?.[0] ? true : false} onClick={onInvite}>{studentInviteDisable?.assessments?.[0] ? "Assigned" :"Invite"}</Button>}
//       </div>

//       <Modal
//         title="PDF Viewer"
//         open={isModalOpen}
//         onCancel={handleClose}
//         footer={null}
//         width="60%"
//         style={{
//           height: "80vh",
//           maxWidth: "90vw",
//           marginTop: "-5rem",
//         }}
//         bodyStyle={{
//           height: "80vh",
//           padding: 0,
//           overflow: "hidden",
//         }}
//         modalRender={(modal) => <div style={{ height: "80vh" }}>{modal}</div>}
//       >
//         <div
//           style={{
//             height: "100%",
//             width: "100%",
//           }}
//         >
//           <iframe
//             src={student?.resumeDoc}
//             width="100%"
//             height="100%"
//             style={{
//               border: "none",
//               minHeight: "70vh",
//             }}
//             title="PDF Viewer"
//           />
//         </div>
//       </Modal>
//     </Card>
//   );
// };

// export default StudentCard;

"use client";
import React, { useState, useMemo } from "react";
import {
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Button,
  Modal,
  Tooltip,
  Checkbox,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  addAssessmentToStudent,
  getAllAppliedStudents,
  getOneJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import { RiVerifiedBadgeFill } from "react-icons/ri";
const { Title, Text } = Typography;

const nestedArraysForVerification = [
  "accomplishments",
  "projects",
  "volunteerings",
  "responsibilities",
  "experiences",
  "educationDetails",
];

// mirror the Status column check
const computeAllApproved = (record) => {
  if (!record) return false;

  const topVals = Object.keys(record)
    .filter((k) => k.endsWith("VerificationType"))
    .map((k) => record[k])
    .filter(Boolean);

  const nestedVals = nestedArraysForVerification.flatMap((arr) =>
    (record[arr] || []).map((item) => item?.verificationType).filter(Boolean)
  );

  const allVerifications = [...topVals, ...nestedVals];
  return (
    allVerifications.length > 0 &&
    allVerifications.every((v) => v === "approved")
  );
};

const StudentCard = ({
  student,
  width,
  type = "",
  jobId = "",
  assessmentId = "",
  isSelected = false,
  onSelect,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const dispatch = useDispatch();

  if (!student) return null;

  // compute verified flag once per render based on student data
  const isVerified = useMemo(() => {
    return Boolean(student?.verified) || computeAllApproved(student);
  }, [student]);

  const {
    firstName,
    lastName,
    email,
    phone,
    college,
    yearOfPassing,
    verified,
    userName,
    middleName,
    experiences = [],
    languages = [],
    technical = [],
    profile,
    addresses,
    professionalSummary,
    educationDetails = [],
  } = student;

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    student?.resumeDoc
  )}&embedded=true`;
  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.companyPlacements?.OneJob || {}
  );

  const fullName = `${firstName || ""} ${middleName ? middleName + " " : ""}${
    lastName || ""
  }`.trim();

  // ... (keep all the existing functions like calculateExperienceFromDates, etc.)
  // Updated function to handle your actual data structure
  const calculateExperienceFromDates = (experiences) => {
    const validExperiences =
      experiences?.filter(
        (exp) =>
          exp?.company?.trim() &&
          exp?.role?.trim() &&
          exp?.start?.trim() &&
          exp?.end?.trim()
      ) || [];

    if (validExperiences.length === 0) return { years: 0, text: "Fresher" };

    let totalMonths = 0;

    validExperiences.forEach((exp) => {
      try {
        const parseDate = (dateStr) => {
          if (!dateStr) return null;

          const mmYyyyMatch = dateStr.match(/^(\d{2})\/(\d{4})$/);
          if (mmYyyyMatch) {
            const month = parseInt(mmYyyyMatch[9]) - 1;
            const year = parseInt(mmYyyyMatch);
            return new Date(year, month, 1);
          }

          return new Date(dateStr);
        };

        const startDate = parseDate(exp.start);
        const endDate = parseDate(exp.end);

        if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
          const startYear = startDate.getFullYear();
          const startMonth = startDate.getMonth();
          const endYear = endDate.getFullYear();
          const endMonth = endDate.getMonth();

          const monthsDiff =
            (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
          totalMonths += Math.max(0, monthsDiff);
        }
      } catch (error) {
        console.warn("Error parsing experience dates:", exp, error);
      }
    });

    const totalYears = totalMonths / 12;

    if (totalMonths < 1)
      return { years: totalYears, text: "Less than 1 month" };
    if (totalMonths < 6)
      return {
        years: totalYears,
        text: `${totalMonths} month${totalMonths > 1 ? "s" : ""}`,
      };
    if (totalYears < 1) return { years: totalYears, text: "6+ months" };
    if (totalYears < 2) return { years: totalYears, text: "1+ Years" };
    if (totalYears < 3) return { years: totalYears, text: "2+ Years" };
    if (totalYears < 5)
      return { years: totalYears, text: `${Math.floor(totalYears)}+ Years` };

    return { years: totalYears, text: `${Math.floor(totalYears)}+ Years` };
  };

  const isValidExperience = (exp) => {
    return (
      exp &&
      exp.company &&
      exp.company.trim() !== "" &&
      exp.role &&
      exp.role.trim() !== ""
    );
  };

  // Get latest education with grade
  const getLatestEducation = (educationDetails) => {
    if (!educationDetails || educationDetails.length === 0) return null;

    const validEducation = educationDetails.filter(
      (edu) => edu.grade && edu.grade.trim() !== ""
    );

    if (validEducation.length === 0) return null;

    const sortedEducation = validEducation.sort(
      (a, b) => (b.yearofPass || 0) - (a.yearofPass || 0)
    );

    return sortedEducation;
  };

  const experienceCalculation = calculateExperienceFromDates(experiences);
  const experienceYears = experienceCalculation.text;

  const validExperiences = experiences?.filter(isValidExperience) || [];
  const latestExperience =
    validExperiences.length > 0 ? validExperiences : null;

  const latestEducation = getLatestEducation(educationDetails);

  const formatGrade = (education) => {
    if (!education) return "Not specified";

    const grade = education.grade;
    const gradingSystem = education.gradingSystem;

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

  const location =
    addresses?.currentAddress?.cityName && addresses?.currentAddress?.stateName
      ? `${addresses.currentAddress.cityName}, ${addresses.currentAddress.stateName}`
      : addresses?.permanentAddress?.cityName &&
        addresses?.permanentAddress?.stateName
      ? `${addresses.permanentAddress.cityName}, ${addresses.permanentAddress.stateName}`
      : addresses?.currentAddress?.cityName ||
        addresses?.permanentAddress?.cityName ||
        "Not specified";

  const onInvite = async () => {
    try {
      const addAssessmentResult = await dispatch(
        addAssessmentToStudent({
          studentIds: [student?._id],
          jobId,
          assessmentId,
        })
      );

      if (addAssessmentResult) {
        await dispatch(
          getAllAppliedStudents({
            studentIds: oneJobData?.applicants?.map((e) => e?._id),
            jobId: oneJobData?._id,
          })
        );

        console.log(
          "Assessment assigned and students data refreshed successfully"
        );
      } else {
        console.error("Failed to add assessment to student");
      }
    } catch (error) {
      console.error("Error in onInvite:", error);
    }
  };

  const studentInviteDisable = student?.appliedJobs?.find(
    (e) => e?.id == jobId
  );

  return (
    <Card
      styles={{ body: { padding: "1.5rem" } }}
      style={{
        borderRadius: "0.75rem",
        boxShadow: "0 0.125rem 0.5rem rgba(0,0,0,0.06)",
        position: "relative",
        width: width ? width : "80%",
        margin: "0 auto",
        marginBottom: "1rem",
        border: isSelected ? "2px solid #25A3A6" : "1px solid #00000033",
        backgroundColor: isSelected ? "#f6ffff" : "white",
      }}
    >
      {/* Selection Checkbox */}
      {type === "results" && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 1,
          }}
        >
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect && onSelect(e.target.checked)}
          />
        </div>
      )}

      {/* Header with Avatar and Basic Info */}
      <Row
        gutter={16}
        align="top"
        style={{ display: "flex", alignItems: "center" }}
      >
        <Col>
          <Avatar
            size={80}
            src={profile}
            icon={<UserOutlined />}
            style={{ marginBottom: "0.5rem" }}
          />
        </Col>

        <Col
          flex="auto"
          style={{
            paddingRight: type === "results" ? "3rem" : "0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
              style={{
                color: "#25A3A6",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
              onClick={() => {
                router.push(
                  `/student/${student?.globalId}__${
                    student?.sourceOrgId
                      ? student?.sourceOrgId
                      : student?.college?.orgId
                  }/basic-details`
                );
                // console.log(student);
              }}
            >
              <div>
                <Title
                  level={4}
                  style={{
                    marginBottom: "0.25rem",
                    color: "#25A3A6",
                    fontSize: "1.25rem",
                    textAlign: "left",
                    margin: 0,
                    cursor: "pointer",
                  }}
                >
                  {fullName || userName || "Unnamed"}
                </Title>
                <Text
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    display: "block",
                    cursor: "pointer",
                  }}
                >
                  {email || "Not provided"}
                </Text>
              </div>
              {isVerified && (
                <RiVerifiedBadgeFill
                  style={{
                    fontSize: "2rem",
                    color: "#25A3A6",
                    cursor: "pointer",
                  }}
                  title="Verified"
                />
              )}
            </div>

            {/* View Resume Button */}
            <Tooltip
              title={
                !student?.resumeDoc || student.resumeDoc.length < 5
                  ? "Resume not updated"
                  : ""
              }
            >
              <Button
                type="link"
                style={{
                  padding: 0,
                  color: "#25A3A6",
                  fontSize: "0.875rem",
                }}
                onClick={showModal}
                disabled={!student?.resumeDoc || student.resumeDoc.length < 5}
              >
                View Resume
              </Button>
            </Tooltip>
          </div>
        </Col>
      </Row>

      {/* Main Content Grid - Keep all existing content */}
      <Row gutter={[24, 16]} style={{ marginTop: "1.25rem" }}>
        {/* Left Column */}
        <Col xs={24} md={8}>
          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              {latestEducation?.gradingSystem?.toUpperCase()}
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>
                {formatGrade(latestEducation)}
              </Text>
              {latestEducation && (
                <Text
                  style={{
                    fontSize: "0.75rem",
                    color: "#999",
                    display: "block",
                  }}
                >
                  {latestEducation.degreeName || latestEducation.type} (
                  {latestEducation.yearofPass})
                </Text>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              EDUCATION
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>
                {college?.name || latestEducation?.school || "Not specified"}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              EXPERIENCE
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>{experienceYears}</Text>
            </div>
          </div>
        </Col>

        {/* Middle Column */}
        <Col xs={24} md={8}>
          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              LANGUAGES
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>
                {languages.length ? languages.join(", ") : "Not specified"}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              TECHNICAL SKILLS
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>
                {technical.length ? technical.join(", ") : "Not specified"}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              CONTACT NUMBER
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>
                {phone || "Not provided"}
              </Text>
            </div>
          </div>
        </Col>

        {/* Right Column */}
        <Col xs={24} md={8}>
          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              CURRENT ROLE
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>
                {latestExperience?.role || "Student"}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              LOCATION
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>{location}</Text>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <Text
              strong
              style={{
                color: "#666",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              GRADUATION YEAR
            </Text>
            <div>
              <Text style={{ fontSize: "0.875rem" }}>
                {yearOfPassing || "Not specified"}
              </Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Individual Invite Button */}
      <div
        style={{
          alignItems: "flex-end",
          justifyContent: "flex-end",
          display: "flex",
          width: "100%",
          gap: "2rem",
        }}
      >
        {type === "results" && (
          <Button
            type="primary"
            disabled={studentInviteDisable?.assessments ? true : false}
            onClick={onInvite}
          >
            {studentInviteDisable?.assessments ? "Assigned" : "Invite"}
          </Button>
        )}
      </div>

      {/* Modal remains the same */}
      <Modal
        title="PDF Viewer"
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width="60%"
        style={{
          height: "80vh",
          maxWidth: "90vw",
          marginTop: "-5rem",
        }}
        styles={{
          body: {
            height: "80vh",
            padding: 0,
            overflow: "hidden",
          }
        }}
        modalRender={(modal) => <div style={{ height: "80vh" }}>{modal}</div>}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <iframe
            src={student?.resumeDoc}
            width="100%"
            height="100%"
            style={{
              border: "none",
              minHeight: "70vh",
            }}
            title="PDF Viewer"
          />
        </div>
      </Modal>
    </Card>
  );
};

export default StudentCard;
