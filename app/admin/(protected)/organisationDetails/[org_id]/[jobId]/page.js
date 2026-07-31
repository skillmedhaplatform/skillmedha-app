"use client";

import { useState, useEffect } from "react";
import styles from "./JobDetailsDisplay.module.scss";
import { getLstorage, decrypt, encrypt } from "@/utils/windowMW";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  IoCaretForwardOutline, 
  IoLocationOutline, 
  IoCashOutline, 
  IoBriefcaseOutline, 
  IoBusinessOutline,
  IoPeopleOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoHomeOutline,
  IoSchoolOutline,
  IoBookOutline,
  IoRibbonOutline,
  IoCheckmarkCircleOutline,
  IoPersonOutline,
  IoCallOutline,
  IoMailOutline,
  IoPricetagOutline,
  IoTimeOutline
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrgs } from "@/redux/slices/admin/adminOrgSlice";

import axios from "axios";
import { restUrl } from "@/utils/universalUtils/urls";
// Custom Breadcrumb Item Component
const BreadcrumbItem = ({ title, onClick, isLast }) => {
  const truncatedTitle =
    title && title.length > 25 ? `${title.substring(0, 25)}...` : title;

  return (
    <>
      {isLast ? (
        <span
          className={styles.breadcrumbCurrent}
          style={{ maxWidth: "200px" }}
        >
          {truncatedTitle}
        </span>
      ) : (
        <span
          onClick={onClick}
          className={styles.breadcrumbLink}
          style={{ maxWidth: "200px" }}
        >
          {truncatedTitle}
        </span>
      )}
      {!isLast && (
        <IoCaretForwardOutline
          style={{
            fontSize: "14px",
            margin: "0 8px",
            color: "#64748b",
            flexShrink: 0,
          }}
        />
      )}
    </>
  );
};

export default function JobDetailsDisplay() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const adminOrgState = useSelector((state) => state.adminOrg);
  const AllOrgs = adminOrgState?.orgs?.value;
  
  const [applicantNames, setApplicantNames] = useState({});

  useEffect(() => {
    loadJobData();
    dispatch(getAllOrgs({ type: "college" }));
  }, [dispatch, params.jobId]);

  useEffect(() => {
    if (jobData && jobData.length > 0) {
      const allApplicants = [];
      jobData.forEach(job => {
        if (job.applicants && Array.isArray(job.applicants)) {
          job.applicants.forEach(app => {
            const appId = (typeof app === 'object' && app !== null) ? (app._id || app.studentId) : app;
            if (appId) allApplicants.push(appId.toString());
          });
        }
      });
      
      const uniqueApplicants = [...new Set(allApplicants)];
      
      if (uniqueApplicants.length > 0) {
        const fetchApplicantNames = async () => {
          try {
            const token = getLstorage("token");
            const res = await axios.post(
              restUrl + "/getUsersFromIds",
              { ids: uniqueApplicants },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            
            if (res.data && res.data.data) {
              const nameMap = {};
              res.data.data.forEach(user => {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                nameMap[user._id] = fullName || user.userName || user.name || user.email || user._id;
              });
              console.log("Fetched applicant names mapping:", nameMap);
              setApplicantNames(nameMap);
            }
          } catch (err) {
            console.error("Error fetching applicant names:", err);
          }
        };
        fetchApplicantNames();
      }
    }
  }, [jobData]);

  const loadJobData = () => {
    try {
      const cachedData = getLstorage("jobDetails");

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setJobData(Array.isArray(parsedData) ? parsedData : [parsedData]);
        setLoading(false);
      } else {
        setJobData([]);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error loading job data:", err);
      setError("Failed to load job data");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCollegeName = (id) => {
    if (!AllOrgs || !Array.isArray(AllOrgs)) return id;
    const clg = AllOrgs.find(c => c.orgId === id || c._id === id);
    return clg ? clg.orgName || clg.collegeName || id : id;
  };

  if (loading) {
    return <div className={styles.loading}>Loading job details...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!jobData || jobData.length === 0) {
    return <div className={styles.noData}>No job data available</div>;
  }

  const orgNameParam = searchParams.get("orgName");
  const orgName = orgNameParam ? decrypt(orgNameParam) : (jobData[0]?.companyName || "Company");

  const breadcrumbItems = [
    {
      title: "Companies",
      onClick: () => router.push("/admin/companies"),
    },
    {
      title: orgName,
      onClick: () =>
        router.push(
          `/admin/companies/jobs?orgId=${encrypt(params.org_id)}&orgName=${encrypt(orgName)}`
        ),
    },
    {
      title: "Jobs",
      onClick: () =>
        router.push(
          `/admin/companies/jobs?orgId=${encrypt(params.org_id)}&orgName=${encrypt(orgName)}`
        ),
    },
    {
      title: jobData[0]?.jobTitle || "Job Details",
      isLast: true,
    },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Top Header Section (White Background) */}
      <div className={styles.topHeader}>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem
            key={index}
            title={item.title}
            onClick={item.onClick}
            isLast={index === breadcrumbItems.length - 1}
          />
        ))}
      </div>

      <div className={styles.jobListContainer}>
      {jobData.map((job, index) => {
        const isStatusActive = job.status === "active";
        const isStatusExpired = job.status === "expired";
        
        return (
          <div key={job._id || index} className={styles.jobDetailsLayout}>
            
            {/* 1. Header Card */}
            <div className={styles.sectionCard}>
              <div className={styles.headerCard}>
                <div className={styles.titleArea}>
                  <div className={styles.iconWrapper}>
                    <IoBusinessOutline />
                  </div>
                  <div className={styles.titleContent}>
                    <h3 className={styles.jobTitle}>{job.jobTitle || "Untitled Job"}</h3>
                    <p className={styles.companyName}>{job.companyName || orgName}</p>
                  </div>
                </div>
                <div className={styles.badgeArea}>
                  <span className={`${styles.badge} ${
                    isStatusActive ? styles.active : 
                    isStatusExpired ? styles.expired : 
                    styles.default
                  }`}>
                    {job.status || job.type || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Quick Details Grid (4 items) */}
            <div className={styles.grid4}>
              <div className={styles.infoBox}>
                <div className={`${styles.iconCirc} ${styles.blue}`}>
                  <IoBriefcaseOutline />
                </div>
                <div className={styles.content}>
                  <span className={styles.label}>Job Type</span>
                  <span className={styles.value}>{job.jobType || "N/A"}</span>
                </div>
              </div>

              <div className={styles.infoBox}>
                <div className={`${styles.iconCirc} ${styles.green}`}>
                  <IoLocationOutline />
                </div>
                <div className={styles.content}>
                  <span className={styles.label}>Location</span>
                  <span className={styles.value}>
                    {job.city ? `${job.city}${job.street ? `, ${job.street}` : ''}` : "N/A"}
                  </span>
                </div>
              </div>

              <div className={styles.infoBox}>
                <div className={`${styles.iconCirc} ${styles.purple}`}>
                  <IoCashOutline />
                </div>
                <div className={styles.content}>
                  <span className={styles.label}>CTC / Salary</span>
                  <span className={styles.value}>
                    {job.ctc ? `${job.ctc} LPA` : "N/A"}
                  </span>
                </div>
              </div>

              <div className={styles.infoBox}>
                <div className={`${styles.iconCirc} ${styles.orange}`}>
                  <IoBusinessOutline />
                </div>
                <div className={styles.content}>
                  <span className={styles.label}>Sector</span>
                  <span className={styles.value}>{job.sector || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* 3. Job Description & Benefits */}
            {(job.jobDescription || (job.supplementalPay && job.supplementalPay.length > 0) || (job.benefits && job.benefits.length > 0)) && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <IoDocumentTextOutline />
                  <span>Job Description & Benefits</span>
                </div>
                
                {job.jobDescription && (
                  <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {job.jobDescription}
                  </div>
                )}
                
                {(job.supplementalPay && job.supplementalPay.length > 0) && (
                  <div className={styles.subSection}>
                    <div className={styles.subHeader}>Supplemental Pay</div>
                    <div className={styles.pillContainer}>
                      {job.supplementalPay.map((pay, idx) => (
                        <span key={idx} className={styles.pill}>
                          <IoPricetagOutline />
                          {pay}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(job.benefits && job.benefits.length > 0) && (
                  <div className={styles.subSection}>
                    <div className={styles.subHeader}>Benefits</div>
                    <div className={styles.pillContainer}>
                      {job.benefits.map((benefit, idx) => (
                        <span key={idx} className={styles.pill}>
                          <IoRibbonOutline />
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Duration & Work Details */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <IoCalendarOutline />
                <span>Duration & Work Details</span>
              </div>
              <div className={styles.grid3}>
                <div className={styles.infoBoxVertical}>
                  <div className={`${styles.iconCirc} ${styles.green}`}>
                    <IoCalendarOutline />
                  </div>
                  <div className={styles.content}>
                    <span className={styles.label}>Start Date</span>
                    <span className={styles.value}>{formatDate(job.startDate)}</span>
                  </div>
                </div>
                
                <div className={styles.infoBoxVertical}>
                  <div className={`${styles.iconCirc} ${styles.orange}`}>
                    <IoCalendarOutline />
                  </div>
                  <div className={styles.content}>
                    <span className={styles.label}>End Date</span>
                    <span className={styles.value}>{formatDate(job.endDate)}</span>
                  </div>
                </div>

                <div className={styles.infoBoxVertical}>
                  <div className={`${styles.iconCirc} ${styles.purple}`}>
                    <IoHomeOutline />
                  </div>
                  <div className={styles.content}>
                    <span className={styles.label}>Remote Work Allowed</span>
                    <span className={`${styles.value} ${styles.capitalize}`}>{job.remoteWorkAllowed || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 & 6. Colleges and Courses Grid */}
            <div className={styles.grid2}>
              {/* Colleges */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <IoSchoolOutline />
                  <span>Associated Colleges</span>
                </div>
                {job.colleges && job.colleges.length > 0 ? (
                  <div className={styles.pillContainer}>
                    {job.colleges.map((collegeId, idx) => (
                      <span key={idx} className={styles.pill} style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                        {getCollegeName(collegeId)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>N/A</div>
                )}
              </div>

              {/* Courses */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <IoBookOutline />
                  <span>Applicable Courses</span>
                </div>
                {job.applicableCourses && job.applicableCourses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {job.applicableCourses.map((course, idx) => (
                      <div key={idx} className={styles.infoBlock}>
                        <div className={styles.label}>Degree</div>
                        <div className={styles.value}>{course.degree || "N/A"}</div>
                        <div className={styles.label}>Department</div>
                        <div className={styles.value}>{course.department || "N/A"}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>N/A</div>
                )}
              </div>
            </div>

            {/* 7. Eligibility Criteria */}
            {job.eligibilityCriteria && job.eligibilityCriteria.length > 0 && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <IoRibbonOutline />
                  <span>Eligibility Criteria</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {job.eligibilityCriteria.map((criteria, idx) => (
                    <div key={idx} className={styles.eligibilityBox}>
                      <div className={styles.grid3}>
                        <div className={styles.eligItem}>
                          <div className={styles.iconCirc}>
                            <IoBookOutline />
                          </div>
                          <div className={styles.content}>
                            <span className={styles.label}>Education Level</span>
                            <span className={styles.value}>{criteria.educationLevel || "N/A"}</span>
                          </div>
                        </div>
                        
                        <div className={styles.eligItem}>
                          <div className={styles.iconCirc}>
                            <span>%</span>
                          </div>
                          <div className={styles.content}>
                            <span className={styles.label}>Minimum Marks</span>
                            <span className={styles.value}>{criteria.minMarksPercentage ? `${criteria.minMarksPercentage}%` : "N/A"}</span>
                          </div>
                        </div>

                        <div className={styles.eligItem}>
                          <div className={styles.iconCirc}>
                            <IoCheckmarkCircleOutline />
                          </div>
                          <div className={styles.content}>
                            <span className={styles.label}>Backlogs Allowed</span>
                            <span className={`${styles.value} ${styles.capitalize}`}>{job.backlogsAllowed || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Applicants Table */}
            {job.applicants && Array.isArray(job.applicants) && job.applicants.length > 0 && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <IoPeopleOutline />
                  <span>Applicants</span>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Applicant ID / Name</th>
                        <th>Status / Applied At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.applicants.map((app, idx) => {
                        const isObj = typeof app === 'object' && app !== null;
                        const rawAppId = isObj ? app._id || app.studentId : app;
                        const appIdStr = rawAppId ? rawAppId.toString() : "";
                        const nameOrId = applicantNames[appIdStr] || appIdStr;

                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{nameOrId}</td>
                            <td>
                              <span className={styles.statusBadge}>Applied</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 9. Coordinator Details */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <IoPersonOutline />
                <span>Coordinator Details</span>
              </div>
              <div className={styles.grid3}>
                <div className={styles.infoBoxVertical}>
                  <div className={`${styles.iconCirc} ${styles.blue}`}>
                    <IoPersonOutline />
                  </div>
                  <div className={styles.content}>
                    <span className={styles.label}>Name</span>
                    <span className={styles.value}>{job.coordinatorName || "N/A"}</span>
                  </div>
                </div>
                
                <div className={styles.infoBoxVertical}>
                  <div className={`${styles.iconCirc} ${styles.green}`}>
                    <IoCallOutline />
                  </div>
                  <div className={styles.content}>
                    <span className={styles.label}>Phone</span>
                    <span className={styles.value}>{job.coordinatorPhone || "N/A"}</span>
                  </div>
                </div>

                <div className={styles.infoBoxVertical}>
                  <div className={`${styles.iconCirc} ${styles.purple}`}>
                    <IoMailOutline />
                  </div>
                  <div className={styles.content}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{job.coordinatorEmail || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 10. Footer Metadata */}
            <div className={styles.grid2}>
              <div className={styles.infoBox}>
                <div className={`${styles.iconCirc} ${styles.blue}`}>
                  <IoTimeOutline />
                </div>
                <div className={styles.content}>
                  <span className={styles.label}>Job Created At</span>
                  <span className={styles.value}>{formatDateTime(job.createdAt)}</span>
                </div>
              </div>

              <div className={styles.infoBox}>
                <div className={`${styles.iconCirc} ${styles.blue}`}>
                  <span style={{ fontWeight: 'bold' }}>#</span>
                </div>
                <div className={styles.content}>
                  <span className={styles.label}>System Job ID</span>
                  <span className={styles.value} style={{ fontSize: '0.85rem' }}>{job._id || "N/A"}</span>
                </div>
              </div>
            </div>
            
          </div>
        );
      })}
      </div>
    </div>
  );
}
