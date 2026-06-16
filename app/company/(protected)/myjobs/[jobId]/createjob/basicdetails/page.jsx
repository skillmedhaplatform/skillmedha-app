"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./basicdetail.module.scss";
import {
  Button,
  Divider,
  Input,
  message,
  Radio,
  Select,
  Space,
  DatePicker,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { CreateJob, UpdateJob } from "@/redux/slices/company/placementsSlice";
import { useParams, useRouter } from "next/navigation";
import { getSstorage } from "@/utils/universalUtils/windowMW";
import { PlusOneOutlined } from "@mui/icons-material";
import educationDegreeOptions from "@/utils/universalUtils/educationData";
import dayjs from "dayjs";
import { fetchPartnerColleges } from "@/redux/slices/company/skillMedhaData";
const { RangePicker } = DatePicker;
export default function BasicDetailsPage() {
  const { id, jobId: jobid } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const [basicDetails, setBasicDetails] = useState({
    jobTitle: "",
    startDate: "",
    endDate: "",
    remoteWorkAllowed: "",
    backlogsAllowed: "",
    coordinatorName: "",
    coordinatorPhone: "",
    coordinatorEmail: "",
  });

  const [courses, setCourses] = useState([{ degree: "", department: "" }]);
  const [eligibilityCriteria, setEligibilityCriteria] = useState([
    { educationLevel: "", minMarksPercentage: "" },
  ]);
  const USER_DETAILS = useSelector((state) => state?.user?.singleUser || null);
  // const { value: ALLPLACEMENTS } = useSelector(
  //   (state) => state.placement.AllPlacements
  // );

  // const companyName = ALLPLACEMENTS?.data?.find(
  //   (p) => p?._id === id
  // )?.companyName;

  const ONEJOB = useSelector((state) => state.companyPlacements?.OneJob?.value);
  const partnerColleges = useSelector((state) => state.companySkillMedhaData?.partnerColleges);
  const { value: colleges = [], pagination: clgPagination = {} } = partnerColleges || {};

  const [originalDetails, setOriginalDetails] = useState(null);

  const SessionJobid = getSstorage("jobid");
  const baseUrl = `/company/myjobs/${SessionJobid || jobid}/createjob/profiledetails`;
  useEffect(() => {
    dispatch(fetchPartnerColleges());
  }, []);
  useEffect(() => {
    const defaultBasicDetails = {
      jobTitle: "",
      startDate: "",
      endDate: "",
      remoteWorkAllowed: "",
      backlogsAllowed: "",
      coordinatorName: "",
      coordinatorPhone: "",
      coordinatorEmail: "",
    };

    const defaultCourses = [{ degree: "", department: "" }];
    const defaultEligibility = [{ educationLevel: "", minMarksPercentage: "" }];

    const jobData = ONEJOB?.data;

    if (jobData) {
      const {
        applicableCourses = defaultCourses,
        eligibilityCriteria = defaultEligibility,
        ...rest
      } = jobData;

      const updatedDetails = {
        ...defaultBasicDetails,
        ...rest,
      };

      setBasicDetails(updatedDetails);
      setCourses(applicableCourses);
      setEligibilityCriteria(eligibilityCriteria);
      setOriginalDetails({
        ...updatedDetails,
        applicableCourses,
        eligibilityCriteria,
      });
    } else {
      setBasicDetails(defaultBasicDetails);
      setCourses(defaultCourses);
      setEligibilityCriteria(defaultEligibility);
    }
  }, [ONEJOB?.data]);

  const handleInputChange = (key, value) => {
    setBasicDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleArrayChange = (type, index, field, value) => {
    const updated =
      type === "courses"
        ? courses.map((item, i) => (i === index ? { ...item } : item))
        : eligibilityCriteria.map((item, i) =>
            i === index ? { ...item } : item
          );

    updated[index][field] = value;

    if (type === "courses") {
      setCourses(updated);
    } else {
      setEligibilityCriteria(updated);
    }
  };

  const handleAddItem = (type) => {
    const typeConfigs = {
      courses: {
        list: courses,
        setList: setCourses,
        emptyItem: { degree: "", department: "" },
        fieldsToCheck: ["degree", "department"],
      },
      eligibility: {
        list: eligibilityCriteria,
        setList: setEligibilityCriteria,
        emptyItem: { educationLevel: "", minMarksPercentage: "" },
        fieldsToCheck: ["educationLevel", "minMarksPercentage"],
      },
    };
    const config = typeConfigs[type];

    if (!config) return;

    const allFilled = config.list.every((item) =>
      config.fieldsToCheck.every((field) => item[field] !== "")
    );

    if (allFilled) {
      config.setList([...config.list, config.emptyItem]);
    } else {
      message.warning("Please fill all fields before adding more.");
    }
  };

  const handleDeleteItem = (type, index) => {
    if (type === "courses") {
      const updated = courses.filter((_, i) => i !== index);
      setCourses(updated);
    } else if (type === "eligibility") {
      const updated = eligibilityCriteria.filter((_, i) => i !== index);
      setEligibilityCriteria(updated);
    }
  };
  const handleSave = async () => {
    const { jobTitle } = basicDetails;

    if (!jobTitle) {
      message.warning("Please fill in all required fields before saving.");
      return;
    }

    const payload = {
      ...basicDetails,
      applicableCourses: courses,
      eligibilityCriteria,
      type: "company",
      companyName: USER_DETAILS?.companyName,
    };

    try {
      // 👇 Wait for dispatch to resolve
      const data = await dispatch(
        CreateJob({ dispatch, placementId: id, payload })
      ).unwrap();

      // ✅ data will now have your API response
      const insertedId = data?.insertedId;

      if (insertedId) {
        router.replace(`/company/myjobs/${insertedId}/createjob/profiledetails`);
      } else {
        message.error("Something went wrong. Job ID not returned.");
      }
    } catch (error) {
      console.error("Job creation failed:", error);
      message.error("Failed to create job.");
    }
  };

  const getUpdatedFields = () => {
    const updates = {};

    for (const key in basicDetails) {
      if (basicDetails[key] !== originalDetails?.[key]) {
        updates[key] = basicDetails[key];
      }
    }

    if (
      JSON.stringify(courses) !==
      JSON.stringify(originalDetails?.applicableCourses)
    ) {
      updates.applicableCourses = courses;
    }

    if (
      JSON.stringify(eligibilityCriteria) !==
      JSON.stringify(originalDetails?.eligibilityCriteria)
    ) {
      updates.eligibilityCriteria = eligibilityCriteria;
    }

    return updates;
  };

  const handleUpdate = async () => {
    const updatedFields = getUpdatedFields();

    if (Object.keys(updatedFields).length === 0) {
      message.info("No changes to update.");
      return;
    }

    const { payload } = dispatch(
      UpdateJob({
        dispatch,
        jobid,
        payload: { ...updatedFields, companyName: USER_DETAILS?.companyName },
      })
    );
    router.replace(
      `/company/myjobs/${payload?.data?._id || jobid}/createjob/profiledetails`
    );
  };

  const [degreeOptions, setDegreeOptions] = useState(educationDegreeOptions);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [newDegree, setNewDegree] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

  const degreeInputRef = useRef(null);
  const deptInputRef = useRef(null);

  const addDegree = (e) => {
    e.preventDefault();
    if (newDegree && !degreeOptions.includes(newDegree)) {
      setDegreeOptions([...degreeOptions, newDegree]);
    }
    setNewDegree("");
    setTimeout(() => degreeInputRef.current?.focus(), 0);
  };

  const addDepartment = (e) => {
    e.preventDefault();
    if (newDepartment && !departmentOptions.includes(newDepartment)) {
      setDepartmentOptions([...departmentOptions, newDepartment]);
    }
    setNewDepartment("");
    setTimeout(() => deptInputRef.current?.focus(), 0);
  };

  return (
    <div className={styles.mainCont}>
      <div className={styles.fieldCont}>
        <label>Job Title</label>
        <input
          type="text"
          placeholder="Job Title"
          value={basicDetails.jobTitle}
          onChange={(e) => handleInputChange("jobTitle", e.target.value)}
        />
      </div>

      <div className={styles.fieldCont}>
        <label>Coordinator Name</label>
        <input
          type="text"
          placeholder="Coordinator Name"
          value={basicDetails.coordinatorName}
          onChange={(e) => handleInputChange("coordinatorName", e.target.value)}
        />
      </div>

      <div className={styles.fieldCont}>
        <label>Coordinator Phone</label>
        <input
          type="text"
          placeholder="Phone Number"
          value={basicDetails.coordinatorPhone}
          onChange={(e) =>
            handleInputChange("coordinatorPhone", e.target.value)
          }
        />
      </div>

      <div className={styles.fieldCont}>
        <label>Coordinator Email</label>
        <input
          type="text"
          placeholder="Email"
          value={basicDetails.coordinatorEmail}
          onChange={(e) =>
            handleInputChange("coordinatorEmail", e.target.value)
          }
        />
      </div>

      <div className={styles.fieldCont}>
        <label>Start Date / End Date</label>
        <div className={styles.inpuCont}>
          <RangePicker
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
            placeholder={["Start", "End"]}
            variant="borderless"
            minDate={dayjs()}
            format="YYYY-MM-DD"
            style={{ width: "100%", padding: "0.2rem 0" }}
            value={
              basicDetails?.startDate && basicDetails?.endDate
                ? [dayjs(basicDetails?.startDate), dayjs(basicDetails?.endDate)]
                : []
            }
            onChange={(dates) => {
              const [start, end] = dates || [];
              handleInputChange("startDate", start);
              handleInputChange("endDate", end);
            }}
          />
        </div>
      </div>
      <div className={styles.fieldCont}>
        <label>Colleges</label>
        <div className={styles.inpuCont}>
          <Select
            className={styles.clgSelect}
            placeholder="Select Colleges"
            mode="tags"
            value={basicDetails.colleges}
            options={colleges?.map((e) => ({
              label: e?.orgName,
              value: e?.orgId,
            }))}
            allowClear
            onChange={(e) => {
              handleInputChange("colleges", e);
            }}
          />
        </div>
      </div>
      <div className={styles.coursefieldCont}>
        <label>Applicable Courses</label>
        <div className={styles.courseInputmainCont}>
          {courses?.map((course, index) => (
            <div className={styles.CourseInpuCont} key={index}>
              <Select
                showSearch
                value={course?.degree}
                placeholder="Select or add degree"
                style={{ flex: 1 }}
                onChange={(value, option) => {
                  setDepartmentOptions(option?.education?.departments);
                  handleArrayChange("courses", index, "degree", value);
                }}
                popupRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 4px" }}>
                      <Input
                        placeholder="Add new degree"
                        ref={degreeInputRef}
                        value={newDegree}
                        onChange={(e) => setNewDegree(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                      <Button
                        type="text"
                        icon={<PlusOneOutlined />}
                        onClick={addDegree}
                      >
                        Add
                      </Button>
                    </Space>
                  </>
                )}
                options={degreeOptions?.map((item) => ({
                  label: item?.label,
                  value: item?.label,
                  education: item,
                }))}
              />
              <Select
                allowClear
                showSearch
                value={course?.department}
                placeholder="Select or add department"
                style={{ flex: 1 }}
                onChange={(value) =>
                  handleArrayChange("courses", index, "department", value)
                }
                popupRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 4px" }}>
                      <Input
                        placeholder="Add new department"
                        ref={deptInputRef}
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                      <Button
                        type="text"
                        icon={<PlusOneOutlined />}
                        onClick={addDepartment}
                      >
                        Add
                      </Button>
                    </Space>
                  </>
                )}
                options={departmentOptions?.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteItem("courses", index)}
              >
                ❌
              </button>
            </div>
          ))}
          <button
            className={styles.saveBtn}
            style={{ alignSelf: "flex-end" }}
            onClick={() => handleAddItem("courses")}
          >
            + Add Course
          </button>
        </div>
      </div>

      <div className={styles.coursefieldCont}>
        <label>Eligibility Criteria</label>
        <div className={styles.courseInputmainCont}>
          {eligibilityCriteria?.map((item, index) => (
            <div className={styles.CourseInpuCont} key={index}>
              <Select
                showSearch
                value={item?.educationLevel}
                placeholder="Select Education"
                style={{ flex: 2 }}
                onChange={(value) =>
                  handleArrayChange(
                    "eligibility",
                    index,
                    "educationLevel",
                    value
                  )
                }
                options={courses?.map((item) => ({
                  label: item?.degree,
                  value: item?.degree,
                }))}
              />
              <input
                className={styles.departmentInput}
                type="number"
                min="0"
                placeholder="Min. % Marks"
                value={item?.minMarksPercentage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 3 && Number(value) <= 100) {
                    handleArrayChange(
                      "eligibility",
                      index,
                      "minMarksPercentage",
                      value
                    );
                  }
                }}
              />
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteItem("eligibility", index)}
              >
                ❌
              </button>
            </div>
          ))}
          <button
            className={styles.saveBtn}
            style={{ alignSelf: "flex-end" }}
            onClick={() => handleAddItem("eligibility")}
          >
            + Add Eligibility
          </button>
        </div>
      </div>

      <div className={styles.fieldCont}>
        <label>Accepting Candidates with Backlogs?</label>
        <div className={styles.inpuCont}>
          <Radio.Group
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
            value={basicDetails?.backlogsAllowed}
            onChange={(e) =>
              handleInputChange("backlogsAllowed", e.target.value)
            }
            optionType="button"
            buttonStyle="solid"
            style={{ width: "60%" }}
          />
        </div>
        {/* <label>Remote Work Allowed?</label>
        <div className={styles.inpuCont}>
          <Radio.Group
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
            value={basicDetails.remoteWorkAllowed}
            onChange={(e) =>
              handleInputChange("remoteWorkAllowed", e.target.value)
            }
            optionType="button"
            buttonStyle="solid"
            style={{ width: "60%" }}
          />
        </div> */}
      </div>

      {ONEJOB?.data?._id ? (
        <Button
          type="primary"
          style={{ width: "10rem", display: "flex", alignSelf: "center" }}
          onClick={handleUpdate}
        >
          Update
        </Button>
      ) : (
        <Button
          type="primary"
          style={{ width: "10rem", display: "flex", alignSelf: "center" }}
          onClick={handleSave}
        >
          Save
        </Button>
      )}
    </div>
  );
}
