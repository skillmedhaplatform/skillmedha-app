"use client";
import React, { useEffect } from "react";
import styles from "./dashboard.module.scss";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { getAllStudents } from "@/redux/slices/tpo/dashboardSlice";
import {
  FaUserGraduate,
  FaBriefcase,
  FaUserTie,
  FaBuilding,
} from "react-icons/fa";
import { GetAllPlacements } from "@/redux/slices/tpo/placementsSlice";
import { getAllDepartments } from "@/redux/slices/tpo/departmentSlice";
import { getDashboardStats } from "@/redux/slices/tpo/dashboardStatsSlice";
import PageHeader from "@/modules/tpo/components/PageHeader";

const SectorPlacementChart = dynamic(() => import("./piechart"), {
  ssr: false,
});
const DepartmentPlacementChart = dynamic(() => import("./columchart"), {
  ssr: false,
});
const PlacementActivityChart = dynamic(() => import("./linechart"), {
  ssr: false,
});

const PlacementRateWidget = ({ total = 0, placed = 0 }) => {
  const placementRate = total > 0 ? Math.round((placed / total) * 100) : 0;
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (placementRate / 100) * circumference;

  return (
    <div className={styles.placementRateCard}>
      <h3 className={styles.chartTitle}>Placement rate</h3>
      <div className={styles.circularProgressContainer}>
        <div className={styles.svgWrapper}>
          <svg height={radius * 2} width={radius * 2}>
            <circle
              stroke="#f3f3f3"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="#1fbb9c"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <div className={styles.circularText}>
            <span className={styles.percentage}>{placementRate}%</span>
            <span className={styles.subtext}>placed so far</span>
          </div>
        </div>
      </div>
      <div className={styles.targetText}>
        Target: 80% by Dec 2026
      </div>
    </div>
  );
};

const Page = () => {
  const dispatch = useDispatch();
  const StudentsLength = useSelector(
    (state) => state.dashboard.AllStudents.value
  );

  const { value: ALLPLACEMENTS } = useSelector(
    (state) => state.placement.AllPlacements
  );

  const { value: departMent } = useSelector(
    (state) => state.department.getAllDepartments
  );

  const { stats, loading: isDashboardLoading } = useSelector(
    (state) => state.dashboardStats
  );

  useEffect(() => {
    dispatch(getAllStudents({}));
    dispatch(GetAllPlacements());
    dispatch(getAllDepartments());
    dispatch(getDashboardStats());
  }, [dispatch]);

  const studentsList = Array.isArray(StudentsLength?.data)
    ? StudentsLength.data
    : Array.isArray(StudentsLength)
    ? StudentsLength
    : [];
  const studentsCount = studentsList.length;

  const placementsList = Array.isArray(ALLPLACEMENTS?.data)
    ? ALLPLACEMENTS.data
    : Array.isArray(ALLPLACEMENTS)
    ? ALLPLACEMENTS
    : [];

  const departmentsList = Array.isArray(departMent?.data)
    ? departMent.data
    : Array.isArray(departMent)
    ? departMent
    : [];

  // Companies count: unique company names from all jobs in all placement drives
  const uniqueCompanies = new Set();
  let totalJobsCount = 0;
  
  placementsList.forEach((drive) => {
    drive.companies?.forEach((job) => {
      totalJobsCount++;
      const name = job.companyName || job.company;
      if (name) {
        uniqueCompanies.add(name);
      }
    });
  });
  
  const companiesCount = uniqueCompanies.size;
  const jobProfilesCount = totalJobsCount;

  // Count placed students
  const placedStudentsList = studentsList.filter(
    (student) => student.placementStatus === "placed"
  );
  const placedCount = placedStudentsList.length;

  const formatKey = (key) => {
    if (key === "averageCTC") return "Average CTC";
    if (key === "highestCTC") return "Highest CTC";
    if (key === "medianCTC") return "Median CTC";
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const formatCTCValue = (value) => {
    if (typeof value === "number") {
      const lpa = value / 100000;
      const formatted = Number.isInteger(lpa) ? lpa.toString() : lpa.toFixed(1);
      return `${formatted} LPA`;
    }
    return value;
  };

  // A. Top Recruiters - Students Placed
  const recruiterPlacementMap = {};
  placementsList.forEach((drive) => {
    drive.companies?.forEach((job) => {
      const company = job.companyName || job.company || "Unknown";
      const placedNum = job.approvedStudents?.length || 0;
      if (placedNum > 0) {
        recruiterPlacementMap[company] = (recruiterPlacementMap[company] || 0) + placedNum;
      }
    });
  });
  const topRecruitersByPlacement = Object.entries(recruiterPlacementMap)
    .map(([recruiter, studentsPlaced]) => ({ recruiter, studentsPlaced }))
    .sort((a, b) => b.studentsPlaced - a.studentsPlaced)
    .slice(0, 5);

  // B. Top Recruiters - CTC Offered
  const recruiterCTCMap = {};
  placementsList.forEach((drive) => {
    drive.companies?.forEach((job) => {
      const company = job.companyName || job.company || "Unknown";
      let ctcVal = 0;
      if (typeof job.ctc === "number") {
        ctcVal = job.ctc;
      } else if (typeof job.ctc === "string") {
        const clean = job.ctc.replace(/[^\d.]/g, "");
        const parsed = parseFloat(clean) || 0;
        if (parsed > 0) {
          ctcVal = parsed < 100 ? parsed * 100000 : parsed;
        }
      }
      if (ctcVal > 0) {
        if (!recruiterCTCMap[company] || recruiterCTCMap[company] < ctcVal) {
          recruiterCTCMap[company] = ctcVal;
        }
      }
    });
  });
  const topRecruitersByCTC = Object.entries(recruiterCTCMap)
    .map(([recruiter, ctcNum]) => ({
      recruiter,
      ctcNum,
      ctc: formatCTCValue(ctcNum)
    }))
    .sort((a, b) => b.ctcNum - a.ctcNum)
    .slice(0, 5);

  // C. CTC Statistics
  const placedCTCs = [];
  placementsList.forEach((drive) => {
    drive.companies?.forEach((job) => {
      let ctcVal = 0;
      if (typeof job.ctc === "number") {
        ctcVal = job.ctc;
      } else if (typeof job.ctc === "string") {
        const clean = job.ctc.replace(/[^\d.]/g, "");
        const parsed = parseFloat(clean) || 0;
        if (parsed > 0) {
          ctcVal = parsed < 100 ? parsed * 100000 : parsed;
        }
      }
      if (ctcVal > 0) {
        const placedNum = job.approvedStudents?.length || 0;
        if (placedNum > 0) {
          for (let i = 0; i < placedNum; i++) {
            placedCTCs.push(ctcVal);
          }
        }
      }
    });
  });

  const targetCTCs = placedCTCs.length > 0 ? placedCTCs : [];
  if (targetCTCs.length === 0) {
    placementsList.forEach((drive) => {
      drive.companies?.forEach((job) => {
        let ctcVal = 0;
        if (typeof job.ctc === "number") {
          ctcVal = job.ctc;
        } else if (typeof job.ctc === "string") {
          const clean = job.ctc.replace(/[^\d.]/g, "");
          const parsed = parseFloat(clean) || 0;
          if (parsed > 0) {
            ctcVal = parsed < 100 ? parsed * 100000 : parsed;
          }
        }
        if (ctcVal > 0) {
          targetCTCs.push(ctcVal);
        }
      });
    });
  }

  let averageCTC = 0;
  let highestCTC = 0;
  let medianCTC = 0;
  if (targetCTCs.length > 0) {
    targetCTCs.sort((a, b) => a - b);
    highestCTC = targetCTCs[targetCTCs.length - 1];
    const sum = targetCTCs.reduce((a, b) => a + b, 0);
    averageCTC = Math.round(sum / targetCTCs.length);
    const mid = Math.floor(targetCTCs.length / 2);
    medianCTC = targetCTCs.length % 2 !== 0 ? targetCTCs[mid] : Math.round((targetCTCs[mid - 1] + targetCTCs[mid]) / 2);
  }

  const ctcStats = {
    averageCTC,
    highestCTC,
    medianCTC,
  };

  // D. Department-wise Placement Statistics
  const departmentPlacements = departmentsList.map((dept) => {
    const deptIdStr = dept._id?.toString();
    const deptStudents = studentsList.filter(s => s.department?.toString() === deptIdStr);
    const eligible = deptStudents.length;
    const placed = deptStudents.filter(s => s.placementStatus === "placed").length;
    return {
      _id: dept._id,
      title: dept.title || dept.name || "Unknown",
      eligible,
      placed
    };
  });

  // E. Sector-wise Placement Breakdown (rebranded to dynamic company recruiter breakdown)
  const companyPlacementCounts = {};
  let totalPlacedCount = 0;
  placementsList.forEach((drive) => {
    drive.companies?.forEach((job) => {
      const company = job.companyName || job.company || "Unknown";
      const placedNum = job.approvedStudents?.length || 0;
      if (placedNum > 0) {
        companyPlacementCounts[company] = (companyPlacementCounts[company] || 0) + placedNum;
        totalPlacedCount += placedNum;
      }
    });
  });
  const sectorPlacements = Object.entries(companyPlacementCounts).map(([company, count]) => ({
    sector: company,
    value: totalPlacedCount > 0 ? parseFloat(((count / totalPlacedCount) * 100).toFixed(1)) : 0,
  }));

  // Placement Activity - Last 6 months
  const now = new Date();
  const activityMonths = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    activityMonths.push({
      month: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      monthNum: d.getMonth(),
      count: 0
    });
  }

  let totalTimeToOfferDays = 0;
  let offersWithTimeCount = 0;
  studentsList.forEach(student => {
    student.appliedJobs?.forEach(appliedJob => {
      if (appliedJob.status === "selected" || appliedJob.status === "approved") {
        const offerDate = appliedJob.createdAt ? new Date(appliedJob.createdAt) : new Date();
        const mIndex = activityMonths.findIndex(m => m.year === offerDate.getFullYear() && m.monthNum === offerDate.getMonth());
        if (mIndex !== -1) {
          activityMonths[mIndex].count++;
        }
        
        let timeDifferenceDays = 14; // Default fallback if no interview details
        if (appliedJob.interviewDetails?.date) {
          const applyDate = appliedJob.createdAt ? new Date(appliedJob.createdAt) : null;
          const interviewDate = new Date(appliedJob.interviewDetails.date);
          if (applyDate && !isNaN(interviewDate.getTime())) {
            const diffTime = Math.abs(interviewDate - applyDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
              timeDifferenceDays = diffDays;
            }
          }
        }
        totalTimeToOfferDays += timeDifferenceDays;
        offersWithTimeCount++;
      }
    });
  });

  const offersThisMonth = activityMonths[5].count;
  const averageTimeToOffer = offersWithTimeCount > 0 ? Math.round(totalTimeToOfferDays / offersWithTimeCount) : 0;

  const dashboardStats = [
    {
      label: "Students",
      value: studentsCount,
      icon: FaUserGraduate,
      badge: "+2 this wk",
      bgColor: "#1fbb9c",
      bgLightColor: "#e8f7ee",
      iconBgColor: "rgba(31, 187, 156, 0.1)",
    },
    {
      label: "Job profiles",
      value: jobProfilesCount,
      icon: FaBriefcase,
      badge: "Active",
      bgColor: "#1d70b8",
      bgLightColor: "#e8f2ff",
      iconBgColor: "rgba(29, 112, 184, 0.1)",
    },
    {
      label: "Placed",
      value: placedCount,
      icon: FaUserTie,
      badge: `${studentsCount > 0 ? Math.round((placedCount / studentsCount) * 100) : 0}% placed`,
      bgColor: "#c5782b",
      bgLightColor: "#fff2e6",
      iconBgColor: "rgba(197, 120, 43, 0.1)",
    },
    {
      label: "Companies",
      value: companiesCount,
      icon: FaBuilding,
      badge: "Hiring",
      bgColor: "#593cc1",
      bgLightColor: "#f3ecff",
      iconBgColor: "rgba(89, 60, 193, 0.1)",
    },
  ];

  if (isDashboardLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: "100px",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              height: "280px",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }} />
          ))}
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={styles.mainCont}>
      <PageHeader
        title="Dashboard"
        subtitle="June 2026 - Batch A"
      />

      <div className={styles.dashboardContent}>
        <div className={styles.cardsList}>
          {dashboardStats.map(({ label, value, icon: Icon, badge, bgColor, bgLightColor, iconBgColor }) => (
            <div
              key={label}
              className={styles.card}
              style={{ backgroundColor: bgLightColor }}
            >
              <div
                className={styles.statIcon}
                style={{ backgroundColor: iconBgColor, color: bgColor }}
              >
                <Icon style={{ fontSize: "20px" }} />
              </div>
              <span className={styles.statValue}>{value}</span>
              <div className={styles.statTextCont}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statSub}>{badge}</span>
              </div>
            </div>
          ))}
        </div>

      <div className={styles.secondCont}>
        {/* Top Recruiters - Students Placed */}
        <div className={styles.tableCard}>
          <h3 className={styles.chartTitle}>Top recruiters - students placed</h3>
          <div className={styles.listContent}>
            {topRecruitersByPlacement && topRecruitersByPlacement.length > 0 ? (
              topRecruitersByPlacement.map(({ recruiter, studentsPlaced }, index) => {
                const maxPlaced = Math.max(...topRecruitersByPlacement.map(r => r.studentsPlaced)) || 1;
                const pct = (studentsPlaced / maxPlaced) * 100;
                return (
                  <div className={styles.recruiterRow} key={index}>
                    <span className={styles.rank}>{index + 1}</span>
                    <span className={styles.name}>{recruiter}</span>
                    <div className={styles.progressWrapper}>
                      <div className={styles.progressBar} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.val}>{studentsPlaced}</span>
                  </div>
                );
              })
            ) : (
              <div className={styles.noDataMessage}>❕No data available</div>
            )}
          </div>
        </div>

        {/* Top Recruiters - CTC Offered */}
        <div className={styles.tableCard}>
          <h3 className={styles.chartTitle}>Top recruiters - CTC offered</h3>
          <div className={styles.listContent}>
            {topRecruitersByCTC && topRecruitersByCTC.length > 0 ? (
              topRecruitersByCTC.map(({ recruiter, ctc }, index) => {
                const valNum = parseFloat(ctc) || 0;
                const maxCTC = Math.max(...topRecruitersByCTC.map(r => parseFloat(r.ctc) || 1)) || 1;
                const pct = (valNum / maxCTC) * 100;
                return (
                  <div className={styles.recruiterRow} key={index}>
                    <span className={styles.rank}>{index + 1}</span>
                    <span className={styles.name}>{recruiter}</span>
                    <div className={styles.progressWrapper}>
                      <div className={styles.progressBar} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.val}>{ctc}</span>
                  </div>
                );
              })
            ) : (
              <div className={styles.noDataMessage}>❕No data available</div>
            )}
          </div>
        </div>

        {/* CTC Statistics */}
        <div className={styles.tableCard}>
          <h3 className={styles.chartTitle}>CTC statistics</h3>
          <div className={styles.listContent}>
            {ctcStats && Object.keys(ctcStats).length > 0 ? (
              Object.entries(ctcStats).map(([key, value]) => (
                <div className={styles.ctcRow} key={key}>
                  <span className={styles.ctcLabel}>{formatKey(key)}</span>
                  <span className={styles.ctcVal}>{formatCTCValue(value)}</span>
                </div>
              ))
            ) : (
              <div className={styles.noDataMessage}>❕No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsCont}>
        <div className={styles.chartAndWidgetRow}>
          <div className={styles.mainChartCol}>
            <DepartmentPlacementChart data={departmentPlacements} />
          </div>
          <div className={styles.widgetCol}>
            <PlacementRateWidget total={studentsCount} placed={placedCount} />
          </div>
        </div>
        
        <div className={styles.chartAndWidgetRow}>
          <div className={styles.donutCol}>
            <SectorPlacementChart data={sectorPlacements} />
          </div>
          <div className={styles.missingWidgetCol}>
            <PlacementActivityChart 
              data={activityMonths}
              offersThisMonth={offersThisMonth}
              averageTimeToOffer={averageTimeToOffer}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Page;
