// "use client";
// import StudentCard from "@/app/company/(protected)/skillsets/components/candidateCard";
// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import applicantStyles from "./styles/applicants.module.scss";
// import { DatePicker, Input } from "antd";
// import dayjs from "dayjs";
// import { getAllAppliedStudents } from "@/redux/slices/company/skillMedhaData";
// import { useDispatch } from "react-redux";

// const { RangePicker } = DatePicker;
// const dateFormat = "YYYY/MM/DD";

// const Applicants = () => {
//   const dispatch = useDispatch();
//   const appliedStudents = useSelector((s) => s.companySkillMedhaData?.appliedStudents);
//   const { value: { data: oneJobData } = {}, status } = useSelector(
//     (state) => state.companyPlacements?.OneJob || {}
//   );

//   const [dateRange, setDateRange] = useState(null);
//   const [passYear, setPassYear] = useState(null);
//   const [cgpa, setCgpa] = useState(0);

//   const applyFilter = () => {
//     const hasValidDates = dateRange && dateRange[0] && dateRange[1];

//     dispatch(
//       getAllAppliedStudents({
//         studentIds: oneJobData?.applicants?.map((e) => e?._id),
//         jobId: oneJobData?._id,
//         filter: {
//           startDate: hasValidDates ? dateRange[0].format("YYYY-MM-DD") : null,
//           endDate: hasValidDates ? dateRange[1].format("YYYY-MM-DD") : null,
//           yearOfPass: passYear,
//           CGPA: cgpa && parseFloat(cgpa) > 0 ? cgpa : null,
//         },
//       })
//     );
//   };

//   // Apply filters when any filter value changes
//   useEffect(() => {
//     if (oneJobData?.applicants?.length > 0) {
//       applyFilter();
//     }
//   }, [dateRange, passYear, cgpa, oneJobData?.applicants]);

//   const onChange = (date, dateString) => {
//     setPassYear(dateString);
//   };

//   return (
//     <div className={applicantStyles.container}>
//       <div className={applicantStyles.headContainer}>
//         <div className={applicantStyles.title}>{oneJobData?.jobTitle}</div>
//         <div className={applicantStyles.filterSec}>
//           <Input
//             style={{ width: "10rem" }}
//             allowClear
//             type="number"
//             title="CGPA"
//             placeholder="CGPA (0-10)"
//             max="10"
//             value={cgpa || ""}
//             onChange={(e) => {
//               let val = e.target.value;
//               if (parseFloat(val) > 10) {
//                 val = 10;
//               }
//               setCgpa(val);
//             }}
//           />
//           <DatePicker onChange={onChange} picker="year" />
//           <RangePicker
//             format={dateFormat}
//             onChange={(dates) => {
//               setDateRange(dates);
//               if (dates && dates[0] && dates[1]) {
//                 dispatch(
//                   getAllAppliedStudents({
//                     studentIds: oneJobData?.applicants?.map((e) => e?._id),
//                     jobId: oneJobData?._id,
//                     filter: {
//                       startDate: dates[0].format("YYYY-MM-DD"),
//                       endDate: dates[1].format("YYYY-MM-DD"),
//                       yearOfPass: passYear,
//                       CGPA: cgpa && parseFloat(cgpa) > 0 ? cgpa : null,
//                     },
//                   })
//                 );
//               }
//             }}
//             value={dateRange}
//           />
//         </div>
//       </div>

//       <div className={applicantStyles.bodyStyles}>
//         {appliedStudents?.map((student, index) => {
//           const isNearEnd = appliedStudents.length === index + 3;

//           return (
//             <StudentCard
//               student={student}
//               key={student?._id}
//               width={"100%"}
//               type="results"
//                jobId={ oneJobData?._id}
//               assessmentId={ oneJobData?.AssessmentId}
//             />
//           );

//         })}
//       </div>
//     </div>
//   );
// };

// export default Applicants;

"use client";
import StudentCard from "@/app/company/(protected)/skillsets/components/candidateCard";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import applicantStyles from "./styles/applicants.module.scss";
import { DatePicker, Input, Button, Checkbox, Empty } from "antd";
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
  const appliedStudents = useSelector((s) => s.companySkillMedhaData?.appliedStudents ?? {});
  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.companyPlacements?.OneJob || {}
  );

  const [dateRange, setDateRange] = useState(null);
  const [passYear, setPassYear] = useState(null);
  const [cgpa, setCgpa] = useState(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const applyFilter = () => {
    const hasValidDates = dateRange && dateRange[0] && dateRange[1];

    dispatch(
      getAllAppliedStudents({
        studentIds: oneJobData?.applicants?.map((e) => e?._id),
        jobId: oneJobData?._id,
        filter: {
          startDate: hasValidDates ? dateRange[0].format("YYYY-MM-DD") : null,
          endDate: hasValidDates ? dateRange.format("YYYY-MM-DD") : null,
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
        console.log("Bulk assessment assigned successfully");
      } else {
        console.error("Failed to add assessment to students");
      }
    } catch (error) {
      console.error("Error in bulk invite:", error);
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

  return (
    <div className={applicantStyles.container}>
      <div className={applicantStyles.headContainer}>
        <div className={applicantStyles.title}>{oneJobData?.jobTitle}</div>
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
            format={dateFormat}
            onChange={(dates) => {
              setDateRange(dates);
              if (dates && dates[0] && dates) {
                dispatch(
                  getAllAppliedStudents({
                    studentIds: oneJobData?.applicants?.map((e) => e?._id),
                    jobId: oneJobData?._id,
                    filter: {
                      startDate: dates[0].format("YYYY-MM-DD"),
                      endDate: dates.format("YYYY-MM-DD"),
                      yearOfPass: passYear,
                      CGPA: cgpa && parseFloat(cgpa) > 0 ? cgpa : null,
                    },
                  })
                );
              }
            }}
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
          appliedStudents.map((student, index) => {
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
          })
        ) : (
          <div style={{ padding: "50px", textAlign: "center" }}>
            <Empty
              description="No students have applied for this position yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;
