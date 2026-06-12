"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./basicdetail.module.scss";
import { Button, Divider, Input, message, Radio, Select, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { CreateJob, UpdateJob } from "@/redux/slices/tpo/placementsSlice";
;
import { getSstorage } from "@/utils/universalUtils/windowMW";
import { PlusOneOutlined } from "@mui/icons-material";
import educationDegreeOptions from "@/utils/universalUtils/educationData";
import { useRouter } from "@bprogress/next/app";
import { useParams } from "next/navigation";

export default function BasicDetailsPage() {
  const { id, jobid } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const [basicDetails, setBasicDetails] = useState({
    jobTitle: "",
    startDate: "",
    endDate: "",
    remoteWorkAllowed: "",
    coordinatorName: "",
    coordinatorPhone: "",
    coordinatorEmail: ""
  });

  const [courses, setCourses] = useState([{ degree: "", department: "" }]);
  const [eligibilityCriteria, setEligibilityCriteria] = useState([
    { educationLevel: "", minMarksPercentage: "" },
  ]);

  const { value: ALLPLACEMENTS } = useSelector(
    (state) => state.placement.AllPlacements
  );

  const companyName = ALLPLACEMENTS?.data?.find(
    (p) => p?._id === id
  )?.companyName;

  const { value: ONEJOB } = useSelector((state) => state.placement.OneJob);

  const [originalDetails, setOriginalDetails] = useState(null);

  const SessionJobid = getSstorage("jobid");
  const baseUrl = `/tpo/placementdrive/${id}/${SessionJobid || jobid
    }/createjob/profiledetails`;

  useEffect(() => {
    const defaultBasicDetails = {
      jobTitle: "",
      startDate: "",
      endDate: "",
      remoteWorkAllowed: "",
      coordinatorName: "",
      coordinatorPhone: "",
      coordinatorEmail: ""
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
        ...rest
      };

      setBasicDetails(updatedDetails);
      setCourses(applicableCourses);
      setEligibilityCriteria(eligibilityCriteria);
      setOriginalDetails({
        ...updatedDetails,
        applicableCourses,
        eligibilityCriteria
      });
    } else {
      setBasicDetails(defaultBasicDetails);
      setCourses(defaultCourses);
      setEligibilityCriteria(defaultEligibility);
    }
  }, [ONEJOB?.data]);

  const handleInputChange = (key, value) => {
    if (key === "coordinatorPhone") {
      // Allow only integers and limit to 10 digits
      const cleanedValue = value.replace(/\D/g, "").slice(0, 10);
      setBasicDetails((prev) => ({ ...prev, [key]: cleanedValue }));
    } else {
      setBasicDetails((prev) => ({ ...prev, [key]: value }));
    }
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
        fieldsToCheck: ["degree", "department"]
      },
      eligibility: {
        list: eligibilityCriteria,
        setList: setEligibilityCriteria,
        emptyItem: { educationLevel: "", minMarksPercentage: "" },
        fieldsToCheck: ["educationLevel", "minMarksPercentage"]
      }
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
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Exactly 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };


  const validateBasicDetails = () => {
    const {
      jobTitle,
      startDate,
      endDate,
      remoteWorkAllowed,
      coordinatorName,
      coordinatorPhone,
      coordinatorEmail } = basicDetails;

    if (
      !jobTitle ||
      !startDate ||
      !endDate ||
      !remoteWorkAllowed ||
      !coordinatorName ||
      !coordinatorPhone ||
      !coordinatorEmail
    ) {
      message.warning("Please fill in all required fields before saving.");
      return false;
    }
    // Validate email format
    if (!validateEmail(coordinatorEmail)) {
      message.error("Please enter a valid email address.");
      return false;
    }

    // Validate phone format
    if (!validatePhone(coordinatorPhone)) {
      message.error("Please enter a valid 10-digit phone number.");
      return false;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      message.error("End date cannot be before start date.");
      return false;
    }

    // Validate courses
    if (courses.length === 0) {
      message.warning("Please add at least one applicable course.");
      return false;
    }
    const isCoursesValid = courses.every(
      (course) => course.degree && course.department
    );
    if (!isCoursesValid) {
      message.warning("Please fill all fields in Applicable Courses.");
      return false;
    }

    // Validate eligibility
    if (eligibilityCriteria.length === 0) {
      message.warning("Please add at least one eligibility criterion.");
      return false;
    }

    const isEligibilityValid = eligibilityCriteria.every(
      (item) => item.educationLevel && item.minMarksPercentage
    );
    if (!isEligibilityValid) {
      message.warning("Please fill all fields in Eligibility Criteria.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateBasicDetails()) return;

    const payload = {
      ...basicDetails,
      companyName: companyName,
      applicableCourses: courses,
      eligibilityCriteria
    };
    // console.log(payload);

    const response = await dispatch(
      CreateJob({ dispatch, placementId: id, payload })
    );

    const newJobId = response?.payload?.insertedId;

    if (newJobId) {
      router.replace(
        `/tpo/placementdrive/${id}/${newJobId}/createjob/profiledetails`
      );
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
    if (!validateBasicDetails()) return;

    const updatedFields = getUpdatedFields();

    if (Object.keys(updatedFields).length === 0) {
      message.info("No changes to update.");
      return;
    }
    // console.log(updatedFields);

    await dispatch(UpdateJob({ dispatch, jobid, payload: updatedFields }));
    router.replace(baseUrl);
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
          required={true}
        />
      </div>

      <div className={styles.fieldCont}>
        <label>Company Coordinator Name</label>
        <input
          type="text"
          placeholder="Coordinator Name"
          value={basicDetails.coordinatorName}
          onChange={(e) => handleInputChange("coordinatorName", e.target.value)}
        />
      </div>

      <div className={styles.fieldCont}>
        <label>Company Coordinator Phone</label>
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
        <label>Company Coordinator Email</label>
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
        <label>Application Start Date / End Date</label>
        <div className={styles.inpuCont}>
          <input
            type="date"
            value={basicDetails.startDate}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
          />
          <span>-</span>
          <input
            type="date"
            value={basicDetails.endDate}
            onChange={(e) => handleInputChange("endDate", e.target.value)}
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
                  education: item
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
                  value: item
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
                  value: item?.degree
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
        <label>Remote Work Allowed?</label>
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
        </div>
      </div>

      {ONEJOB?.data?._id ? (
        <button className={styles.saveBtn} onClick={handleUpdate}>
          Update
        </button>
      ) : (
        <button className={styles.saveBtn} onClick={handleSave}>
          Save
        </button>
      )}
    </div>
  );
}
