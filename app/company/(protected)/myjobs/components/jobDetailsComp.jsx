"use client";
import { useParams, useRouter } from "next/navigation";
import styles from "../[jobId]/job.module.scss";
export default function JobDetails({ JOBPROFILE, ALLPLACEMENTS }) {
  const { id, jobId:jobid } = useParams();
  const router = useRouter();
  const baseurl = `/myjobs/${jobid}/createjob/basicdetails`;
  return (
    <div className={styles.contentCont}>
      <button
        className={styles.editButton}
        onClick={() => router.replace(baseurl)}
      >
        Edit
      </button>
      <div className={styles.titleCont}>
        <h1 className={styles.title}>{JOBPROFILE?.jobTitle || "Job Title"}</h1>
        <p className={styles.location}>
          {JOBPROFILE?.city || "City not specified"},{" "}
          {JOBPROFILE?.country || "Country not specified"}
        </p>
      </div>

      <p className={styles.subheading} id="basicDetails">
        Company Coordinator
      </p>
      <div className={styles.infoBox}>
        <div>
          <strong>Name:</strong>{" "}
          <p>{JOBPROFILE?.coordinatorName || "Mr/Mrs."}</p>
        </div>
        <div>
          <strong>Phone:</strong>{" "}
          <p>{JOBPROFILE?.coordinatorPhone || "+91 123 456 7890"}</p>
        </div>
        <div>
          <strong>Email:</strong>{" "}
          <p>{JOBPROFILE?.coordinatorEmail || "abc@example.com"}</p>
        </div>
      </div>

      <h3 className={styles.subheading}>Summary</h3>
      <div className={styles.infoBox}>
        <div>
          <strong>Company:</strong>
          <p>{JOBPROFILE?.companyName || "Company"}</p>
        </div>
        <div>
          <strong>Drive:</strong>
          <p>
            {ALLPLACEMENTS?.data?.find((p) => p._id === id)?.driveName ||
              "Drive Name"}
          </p>
        </div>
        <div>
          <strong>Application Start/End date:</strong>
          <p>
            {JOBPROFILE?.startDate || "Start Date"} ➖{" "}
            {JOBPROFILE?.endDate || "End Date"}
          </p>
        </div>
      </div>

      <h3 className={styles.subheading}>Applicable Courses</h3>
      <div className={styles.infoBox}>
        {JOBPROFILE?.applicableCourses?.length > 0 ? (
          JOBPROFILE?.applicableCourses?.map((course, i) => (
            <p key={i}>
              {course?.degree} - {course?.department}
            </p>
          ))
        ) : (
          <p>No course data available</p>
        )}
      </div>

      <h3 className={styles.subheading}>Eligibility Criteria</h3>
      <div className={styles.infoBox}>
        <div>
          <p>Applicants must have scored :</p>
          {(JOBPROFILE?.eligibilityCriteria?.length > 0
            ? JOBPROFILE?.eligibilityCriteria
            : ["No eligibility data available"]
          ).map((criteria, i) => (
            <strong key={i}>
              {criteria?.minMarksPercentage}% marks in{" "}
              {criteria?.educationLevel}
            </strong>
          ))}
        </div>
      </div>

      <h3 className={styles.subheading} id="profileDetails">
        Job Profile Details
      </h3>
      <div className={styles.infoBox}>
        <div>
          <strong>Type:</strong>
          <p>{JOBPROFILE?.jobType || "N/A"}</p>
        </div>

        <div>
          <strong>Job Location:</strong>
          <p>
            {JOBPROFILE?.street}, {JOBPROFILE?.area}, {JOBPROFILE?.city},{" "}
            {JOBPROFILE?.zip}, {JOBPROFILE?.country}
          </p>
        </div>

        <div>
          <strong>Sector:</strong>
          <p>{JOBPROFILE?.sector || "N/A"}</p>
        </div>

        <div>
          <strong>Cost-to-company (CTC):</strong>
          <p>
            ₹{" "}
            {JOBPROFILE?.ctc
              ? `${JOBPROFILE.ctc.toLocaleString("en-IN")} per annum`
              : "N/A"}
          </p>
        </div>

        <div>
          <strong>Supplemental Pay:</strong>
          <p>{JOBPROFILE?.supplementalPay?.join(", ") || "N/A"}</p>
        </div>
      </div>

      <h3 className={styles.subheading}>Job Description</h3>
      <div className={styles.infoBox}>
        <div>
          <p>{JOBPROFILE?.description || "No job description provided."}</p>
        </div>
      </div>

      <h3 className={styles.subheading} id="interview">
        Interview Process
      </h3>
      {JOBPROFILE?.interviewRounds?.length > 0 ? (
        JOBPROFILE?.interviewRounds?.map((round, idx) => (
          <div key={idx} className={styles.infoBox}>
            <h4>Round {idx + 1}</h4>
            <div className={styles.infoBox}>
              <div>
                <strong>Type:</strong>
                <p>{round?.type || "N/A"}</p>
              </div>
              <div>
                <strong>Mode:</strong>
                <p>{round?.mode || "N/A"}</p>
              </div>
              <div>
                <strong>Name:</strong>
                <p>{round?.roundName || "N/A"}</p>
              </div>
              <div>
                <strong>Venue:</strong>
                <p>{round?.venue || "N/A"}</p>
              </div>
              <div>
                <strong>Schedule:</strong>
                <p>{round?.schedule?.startDate || "N/A"}</p>
                <p>{round?.schedule?.endDate || "N/A"}</p>
              </div>
              <div>
                <strong>Venue:</strong>
                <p>{round?.description || "N/A"}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No interview process available</p>
      )}
    </div>
  );
}
