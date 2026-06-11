"use client";
import AccessStyles from "./access.module.scss";
import React, { useEffect, useState } from "react";
import { headTitles } from "./utils/headerTitles";

import { useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import {
  getOneTests,
  updateTest,
  updateTestValues,
} from "@/redux/slices/testportal_admin/slice/test";
import { useSelector } from "react-redux";
import PricingPage from "../pricing/page";
import { Button, Input, Radio, Select, Table } from "antd";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import { FaInfoCircle } from "react-icons/fa";

const Accesspage = () => {
  const [currTitle, setCurrTitle] = useState("");
  const [currency, setCurrency] = useState("₹");
  const dispatch = useDispatch();
  const values = useSelector((state) => state.steps.value);
  const [selectedOption, setSelectedOption] = useState("free");
  const SingleTest = useSelector((state) => state.tests.test);
  const params = useParams();
  const { ["test-slug"]: testId } = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const [selVAl, setSelectval] = useState("");

  // ------------------------------------------------------------- Slection Procecss SkillMedha

  const departments = useSelector((s) => s.Student.departments);
  const batches = useSelector((s) => s.Student.batches);
  const AllStudents = useSelector((s) => s.Student.getAllStudentsAgg?.value);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [accessType, setAccessType] = useState("department");
  const [sorted, setSorted] = useState(false);
  const [searchText, setSearchText] = useState("");

  const emailColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  const getTableData = () => {
    let students = Array.isArray(AllStudents)
      ? AllStudents
      : Array.isArray(AllStudents?.data)
      ? AllStudents.data
      : [];
    if (searchText) {
      students = students.filter((stu) =>
        stu.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (sorted) {
      return [
        ...students.filter((stu) => selectedRowKeys.includes(stu?._id)),
        ...students.filter((stu) => !selectedRowKeys.includes(stu?._id)),
      ];
    }
    return students;
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };
  const handleUpdate = () => {
    let payload = {
      access: {
        type: accessType,
      },
    };

    if (accessType === "department") {
      payload.access.department = selectedDepartments;
    } else if (accessType === "batch") {
      payload.access.yearOfPassing = selectedBatches;
    } else if (accessType == "department_batch") {
      payload.access.yearOfPassing = selectedBatches;
      payload.access.department = selectedDepartments;
    } else if (accessType === "student") {
      payload.access.students = selectedRowKeys;
    } else {
      payload.access.department = [];
      payload.access.yearOfPassing = [];
      payload.access.students = [];
    }

    dispatch(
      updateTest({
        id: selectedId,
        updates: {
          ...payload,
        },
      })
    );
  };

  useEffect(() => {
    if (SingleTest && SingleTest.access) {
      const access = SingleTest.access;

      setAccessType(access.type || "department");

      if (Array.isArray(access.department)) {
        setSelectedDepartments(access.department);
      } else if (typeof access.department === "string" && access.department) {
        setSelectedDepartments([access.department]);
      } else {
        setSelectedDepartments([]);
      }

      if (Array.isArray(access.yearOfPassing)) {
        setSelectedBatches(access.yearOfPassing);
      } else if (
        typeof access.yearOfPassing === "string" &&
        access.yearOfPassing
      ) {
        setSelectedBatches([access.yearOfPassing]);
      } else {
        setSelectedBatches([]);
      }

      if (Array.isArray(access.students)) {
        setSelectedRowKeys(access.students);
      } else if (typeof access.students === "string" && access.students) {
        setSelectedRowKeys([access.students]);
      } else {
        setSelectedRowKeys([]);
      }
    }
  }, [SingleTest?.access]);

  // ------------------------------------------------------------- Slection Procecss SkillMedha

  useEffect(() => {
    // dispatch(getOneTests({ _id: selectedId }));
    dispatch(setFormValues(SingleTest));
  }, [SingleTest?._id, values?._id]);

  useEffect(() => {
    setCurrTitle(headTitles[0]?.name);
  }, []);

  // useEffect(() => {
  //   if (!SingleTest?._id)
  //     dispatch(getOneTests({ _id: testId.split("_id-")[1] }));
  // }, [testId, SingleTest?._id]);

  useEffect(() => {
    if (SingleTest && SingleTest?.access?.type) {
      const titleFromType = headTitles.find(
        ({ type }) =>
          type.toLowerCase() == SingleTest?.access.type?.toLowerCase()
      );
      if (titleFromType) {
        setCurrTitle(titleFromType?.name);
      } else {
        setCurrTitle(headTitles[0]?.name);
      }
    }
  }, [SingleTest?.access?.type]);

  const [honestRespondentvalue, sethonestRespondentvalue] = useState("Disable");
  const [Snapshotvalue, setSnapshotvalue] = useState("Disable");
  const [FaceRecValue, setFaceRecValue] = useState("Disable");

  const optionsSnapshot = [
    {
      label: "Disable",
      value: "Disable",
    },
    {
      label: "Enable",
      value: "Enable",
    },
  ];
  const optionsHonestRespondent = [
    {
      label: "Disable",
      value: "Disable",
    },
    {
      label: "Enable Warnings Only",
      value: "Enable Warnings Only",
    },
    {
      label: "Enable Warnings and test block",
      value: "Enable Warnings and test block",
    },
  ];

  const onChangeHonestRespondent = ({ target: { value } }) => {
    sethonestRespondentvalue(value);

    dispatch(
      updateTest({
        id: selectedId,
        updates: {
          honestRespondent: {
            type: value,
          },
        },
      })
    );
  };
  const onChangeFaceRec = ({ target: { value } }) => {
    setFaceRecValue(value);
    const updates = {
      facialRecognitionTechnology: value,
    };
    if (value == "Enable") {
      updates.snapShotTechnology = "Enable";
      setSnapshotvalue("Enable");
    }
    dispatch(
      updateTestValues({
        ...updates,
      })
    );
    dispatch(
      updateTest({
        id: selectedId,
        updates,
      })
    );
  };
  const onChangeSnapshot = ({ target: { value } }) => {
    setSnapshotvalue(value);
    const updates = {
      snapShotTechnology: value,
    };
    if (value == "Disable") {
      updates.facialRecognitionTechnology = "Disable";
      setFaceRecValue("Disable");
    }
    dispatch(
      updateTestValues({
        ...updates,
      })
    );
    dispatch(
      updateTest({
        id: selectedId,
        updates,
      })
    );
  };

  useEffect(() => {
    if (SingleTest && SingleTest.pricing && SingleTest.pricing.paid) {
      setSelectedOption("paid");
    } else {
      setSelectedOption("free");
    }
    if (SingleTest?.pricing?.currency) {
      setCurrency(SingleTest?.pricing?.currency);
    }
  }, [SingleTest]);

  const handleSelectPricing = (val) => {
    setSelectedOption(val);
    dispatch(
      updateTestValues({
        pricing: {
          ...SingleTest.pricing,
          paid: val === "paid",
        },
      })
    );
  };

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value);
    const updatedPricing = {
      ...SingleTest.pricing,
      [type]: value,
      currency: currency,
    };
    dispatch(updateTestValues({ pricing: updatedPricing }));
  };

  useEffect(() => {
    if (
      (SingleTest && !SingleTest.access) ||
      (SingleTest &&
        SingleTest.access &&
        !SingleTest.access.attemptsPerRespondent)
    ) {
      dispatch(
        updateTestValues({
          access: {
            attemptsPerRespondent: 1,
          },
        })
      );
    }
  }, []);

  useEffect(() => {
    if (SingleTest?.honestRespondent) {
      sethonestRespondentvalue(SingleTest.honestRespondent?.type);
    }
  }, [SingleTest?._id, SingleTest?.honestRespondent?.type]);

  useEffect(() => {
    if (SingleTest?.snapShotTechnology) {
      setSnapshotvalue(SingleTest?.snapShotTechnology);
      setFaceRecValue(SingleTest?.facialRecognitionTechnology);
    }
  }, [SingleTest?._id, SingleTest?.snapShotTechnology]);

  return (
    <div className={AccessStyles.main_container}>
        <div className={AccessStyles.container}>
          <div className={AccessStyles.access_type_container}>
            <h2>Access type</h2>
            <div>
              <Radio.Group
                onChange={(e) => {
                  setAccessType(e.target.value);
                  // reset selections
                  setSelectedDepartments([]);
                  setSelectedBatches([]);
                  setSelectedRowKeys([]);
                }}
                value={accessType}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio value="all">All</Radio>
                <Radio value="department">Department</Radio>
                <Radio value="batch">Batch</Radio>
                <Radio value="department_batch">Department and Batch</Radio>
                <Radio value="student">Student</Radio>
              </Radio.Group>
            </div>

            <div style={{ marginTop: 16 }}>
              {accessType === "department" && (
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: "15rem", maxWidth: "300px" }}
                  value={selectedDepartments}
                  options={
                    (Array.isArray(departments?.value)
                      ? departments.value
                      : Array.isArray(departments?.value?.data)
                      ? departments.value.data
                      : []
                    ).map((e) => ({
                      label: e?.title,
                      value: e?._id,
                    }))
                  }
                  onChange={(selectedIds) => {
                    setSelectedDepartments(selectedIds);
                    const selectedDepts = departments?.value?.filter((d) =>
                      selectedIds.includes(d._id)
                    );
                  }}
                  placeholder="Select Departments"
                />
              )}

              {accessType === "batch" && (
                <>
                  {/* <div style={{ marginTop: 8 }}>
                    <p>
                      If this batch is associated with a particular Department,
                      please select that Department.
                    </p>
                    <Select
                      mode="multiple"
                      allowClear
                      style={{ width: "100%", maxWidth: "300px" }}
                      value={selectedDepartments}
                      options={
                        departments?.value?.map((e) => ({
                          label: e?.title,
                          value: e?._id,
                        })) || []
                      }
                      onChange={(selectedIds) => {
                        setSelectedDepartments(selectedIds);
                        const selectedDepts = departments?.value?.filter((d) =>
                          selectedIds.includes(d._id)
                        );
                      }}
                      placeholder="Select Departments"
                    />
                  </div> */}
                  <Select
                    mode="multiple"
                    allowClear
                    style={{
                      width: "15rem",
                      maxWidth: "300px",
                      marginTop: "1rem",
                    }}
                    value={selectedBatches}
                    options={
                      (Array.isArray(batches?.value)
                        ? batches.value
                        : Array.isArray(batches?.value?.data)
                        ? batches.value.data
                        : []
                      ).map((e) => ({
                        label: e?.yearOfPassing,
                        value: e?.yearOfPassing,
                      }))
                    }
                    onChange={(selectedYears) => {
                      setSelectedBatches(selectedYears);
                      console.log("Selected Batches:", selectedYears);
                    }}
                    placeholder="Select Batch Years"
                  />
                </>
              )}
              {accessType === "department_batch" && (
                <>
                  <div style={{ marginTop: 8 }}>
                    <p>
                      If this batch is associated with a particular Department,
                      please select that Department.
                    </p>
                    <Select
                      mode="multiple"
                      allowClear
                      style={{ width: "100%", maxWidth: "300px" }}
                      value={selectedDepartments}
                      options={
                        (Array.isArray(departments?.value)
                          ? departments.value
                          : Array.isArray(departments?.value?.data)
                          ? departments.value.data
                          : []
                        ).map((e) => ({
                          label: e?.title,
                          value: e?._id,
                        }))
                      }
                      onChange={(selectedIds) => {
                        setSelectedDepartments(selectedIds);
                        const selectedDepts = departments?.value?.filter((d) =>
                          selectedIds.includes(d._id)
                        );
                      }}
                      placeholder="Select Departments"
                    />
                  </div>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      marginTop: "1rem",
                    }}
                    value={selectedBatches}
                    options={
                      (Array.isArray(batches?.value)
                        ? batches.value
                        : Array.isArray(batches?.value?.data)
                        ? batches.value.data
                        : []
                      ).map((e) => ({
                        label: e?.yearOfPassing,
                        value: e?.yearOfPassing,
                      }))
                    }
                    onChange={(selectedYears) => {
                      setSelectedBatches(selectedYears);
                      console.log("Selected Batches:", selectedYears);
                    }}
                    placeholder="Select Batch Years"
                  />
                </>
              )}

              {accessType === "student" && (
                <>
                  <div style={{ margin: "20px 0" }}>
                    <Input
                      placeholder="Search by student email"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      style={{ width: 300 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      onClick={() => setSorted(true)}
                      disabled={selectedRowKeys.length === 0}
                    >
                      Sort Selected Students to Top
                    </Button>
                  </div>

                  <Table
                    rowKey="_id"
                    columns={emailColumns}
                    dataSource={getTableData()}
                    rowSelection={rowSelection}
                    pagination={{ pageSize: 10 }}
                  />
                </>
              )}
            </div>

            <button
              className={AccessStyles.save_btn}
              onClick={() => {
                handleUpdate();
              }}
              style={{ marginTop: 16 }}
            >
              Update
            </button>
          </div>

          <div className={AccessStyles.bottom_line}></div>

          <div className={AccessStyles.Content_Security_container}>
            <div className={AccessStyles.header_cont}>
              <h2>Honest Respondent technology</h2>
              <Radio.Group
                options={optionsHonestRespondent}
                className={AccessStyles.HonestradioGroup}
                onChange={onChangeHonestRespondent}
                value={honestRespondentvalue}
                optionType="button"
                buttonStyle="solid"
              />
            </div>
            <div className={AccessStyles.honest_para}>
              To increase test results reliability, activate a mechanism that
              monitors browser tab movements. If any movement or tab switching
              is detected, the mechanism issues warnings or blocks the test,
              according to the settings of your choice.
            </div>
            <div className={AccessStyles.Leavingtestpage_container}>
              <div>
                <FaInfoCircle size={20} color="#555" />
                Leaving test page accidentally
              </div>
              <p>
                If Honest Respondent Technology is activated, respondents
                receive a notification on the test start page. They are advised
                to disable system notifications, close applications running in
                the background and focus on taking the test.
              </p>
              <p>
                It may happen, however, that a respondent leaves the test tab
                unintentionally. This can be caused by changing the volume,
                clicking outside the test tab or switching the taskbar on. If
                the test is taken on a mobile device, any notifications or calls
                may also trigger a warning.
              </p>
            </div>

            {honestRespondentvalue == "Enable Warnings and test block" && (
              <div className={AccessStyles.Maximum_respondents_cont}>
                <div>
                  <h4>
                    Maximum number of times a respondent can leave the test page
                  </h4>
                  <span>
                    {" "}
                    <FaInfoCircle size={16} color="#555" style={{ marginRight: '5px' }} />
                    We recommend using value greater than or equal to 2.
                  </span>
                </div>
                <select
                  value={selVAl || SingleTest?.honestRespondent?.maxAttempts}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectval(value);
                    dispatch(
                      updateTestValues({
                        honestRespondent: {
                          ...SingleTest.honestRespondent,
                          maxPageExits: value,
                        },
                      })
                    );
                    dispatch(
                      updateTest({
                        id: selectedId,
                        updates: {
                          honestRespondent: {
                            type: "Enable Warnings and test block",
                            maxAttempts: value,
                          },
                        },
                      })
                    );
                    setSelectval(value);
                  }}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            )}
          </div>
          <div className={AccessStyles.bottom_line}></div>

          <div className={AccessStyles.snapshot_technology_cont}>
            <div className={AccessStyles.header_titles}>
              <h2>Facial Recognition Technology</h2>
              <Radio.Group
                options={optionsSnapshot}
                onChange={onChangeFaceRec}
                className={AccessStyles.radioGroup}
                value={FaceRecValue}
                optionType="button"
                buttonStyle="solid"
              />
            </div>
            <p className={AccessStyles.para}>
              To enhance the integrity of the online exam process, enable the
              Facial Recoginition mechanism, which captures a photo of the
              student before they begin their test and verifies it with the
              stored image in the database.
            </p>
            <div className={AccessStyles.Taking_Snapshot_container}>
              <div>
                <FaInfoCircle size={20} color="#555" />
                How Facial Recognition Works
              </div>
              <p>
                When Facial Recognition is enabled, the system prompts students
                to allow camera access at the start of the test. After a clear
                reference image of the student is captured, the system
                continuously monitors and verifies their face at regular
                intervals throughout the test. If the face does not match the
                reference image or if the student leaves the camera's field of
                view, an alert is generated.
              </p>
              <div className={AccessStyles.Identification_cont}>
                <h3>Guidance for Camera Accessibility</h3>
                <p>
                  If the student's device camera is inaccessible or the system
                  cannot detect the student's face, a notification will prompt
                  the student to enable camera permissions in their browser.
                  Additionally, students are informed to position themselves
                  properly in front of the camera to ensure a clear and
                  uninterrupted view of their face.
                </p>
              </div>
            </div>
          </div>
          <div className={AccessStyles.bottom_line}></div>
          <div className={AccessStyles.snapshot_technology_cont}>
            <div className={AccessStyles.header_titles}>
              <h2>User Snapshot Technology</h2>
              <Radio.Group
                options={optionsSnapshot}
                onChange={onChangeSnapshot}
                className={AccessStyles.radioGroup}
                value={Snapshotvalue}
                optionType="button"
                buttonStyle="solid"
              />
            </div>
            <p className={AccessStyles.para}>
              To enhance the integrity of the online exam process, enable the
              Student Snapshot mechanism, which captures a photo of the student
              before they begin their test. This feature ensures that the
              identity of the test-taker is verified and documented.
            </p>
            <div className={AccessStyles.Taking_Snapshot_container}>
              <div>
                <FaInfoCircle size={20} color="#555" />
                Taking the Snapshot
              </div>
              <p>
                When the Student Snapshot Technology is activated, students are
                prompted to take a clear and neat photo using their device’s
                camera before they can proceed to the exam. If the photo is not
                satisfactory, they have the option to retake it until it meets
                the required standards. In cases where the camera is not
                accessible or the photo cannot be seen in the camera box, the
                system notifies the student that their browser does not have
                permission to access the camera, guiding them to enable it.
              </p>
              <div className={AccessStyles.Identification_cont}>
                <h3>Importance of Clear Identification</h3>
                <p>
                  The captured photo is stored securely and can be reviewed by
                  the admin to ensure that the correct individual is taking the
                  test. This added layer of security helps prevent impersonation
                  and maintains the authenticity of the exam process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Accesspage;
