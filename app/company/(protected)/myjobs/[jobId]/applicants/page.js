"use client";
import StudentCard from "@/app/company/(protected)/skillsets/components/candidateCard";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import applicantStyles from "./applicants.module.scss";
import { DatePicker, Input, Button, Checkbox } from "antd";
import dayjs from "dayjs";
import {
  getAllAppliedStudents,
  addAssessmentToStudent,
} from "@/redux/slices/company/skillMedhaData";
import Home from "@/app/page";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { useParams } from "next/navigation";

const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";

const Applicants = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const appliedStudents = useSelector((s) => s.companySkillMedhaData?.appliedStudents ?? {});
  const { value: { data: oneJobData } = {} } = useSelector(
    (state) => state.companyPlacements?.OneJob || {}
  );

  const [dateRange, setDateRange] = useState(null);
  const [passYear, setPassYear] = useState(null);
  const [cgpa, setCgpa] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

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

  return (
    <>
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
              max={10}
              value={cgpa || ""}
              onChange={(e) => {
                let val = e.target.value;
                if (parseFloat(val) > 10) val = 10;
                setCgpa(val);
              }}
            />

            <DatePicker picker="year" onChange={onChangePassYear} />

            <RangePicker
              format={dateFormat}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </div>
        </div>

        <div className={applicantStyles.bodyStyles}>
          {appliedStudents?.map((student) => (
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
      </div>
    </>
  );
};

export default Applicants;
