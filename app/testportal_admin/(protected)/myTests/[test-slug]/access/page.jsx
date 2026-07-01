"use client";
import AccessStyles from "./access.module.scss";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, usePathname, useRouter } from "next/navigation";
import { updateTest, updateTestValues } from "@/redux/slices/testportal_admin/slice/test";
import { Button, Input, Select, Table, message } from "antd";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import { 
  LockOutlined, 
  SafetyCertificateOutlined, 
  ScanOutlined, 
  CameraOutlined, 
  InfoCircleOutlined,
  SearchOutlined
} from "@ant-design/icons";

const Accesspage = () => {
  const dispatch = useDispatch();
  const SingleTest = useSelector((state) => state.tests.test);
  const values = useSelector((state) => state.steps.value);
  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const router = useRouter();

  const departments = useSelector((s) => s.Student.departments);
  const batches = useSelector((s) => s.Student.batches);
  const AllStudents = useSelector((s) => s.Student.getAllStudentsAgg?.value);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [accessType, setAccessType] = useState("department");
  const [sorted, setSorted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selVAl, setSelectval] = useState("");

  const [honestRespondentvalue, sethonestRespondentvalue] = useState("Disable");
  const [Snapshotvalue, setSnapshotvalue] = useState("Disable");
  const [FaceRecValue, setFaceRecValue] = useState("Disable");

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
    } else if (accessType === "department_batch") {
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
        updates: payload,
      })
    ).then((res) => {
      if (res?.payload) {
        message.success("Access settings updated successfully");
      }
    });
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
      } else if (typeof access.yearOfPassing === "string" && access.yearOfPassing) {
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

  useEffect(() => {
    dispatch(setFormValues(SingleTest));
  }, [SingleTest?._id, values?._id]);

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

  const onChangeHonestRespondent = (val) => {
    sethonestRespondentvalue(val);
    dispatch(
      updateTest({
        id: selectedId,
        updates: {
          honestRespondent: {
            type: val,
          },
        },
      })
    );
  };

  const onChangeFaceRec = (val) => {
    setFaceRecValue(val);
    const updates = {
      facialRecognitionTechnology: val,
    };
    if (val === "Enable") {
      updates.snapShotTechnology = "Enable";
      setSnapshotvalue("Enable");
    }
    dispatch(updateTestValues(updates));
    dispatch(updateTest({ id: selectedId, updates }));
  };

  const onChangeSnapshot = (val) => {
    setSnapshotvalue(val);
    const updates = {
      snapShotTechnology: val,
    };
    if (val === "Disable") {
      updates.facialRecognitionTechnology = "Disable";
      setFaceRecValue("Disable");
    }
    dispatch(updateTestValues(updates));
    dispatch(updateTest({ id: selectedId, updates }));
  };

  return (
    <div className={AccessStyles.main_container}>
      <div className={AccessStyles.container}>
        {/* Card 1: Access Type */}
        <div className={AccessStyles.cardSection}>
          <div className={AccessStyles.sectionHeader}>
            <div className={AccessStyles.headerLeft}>
              <LockOutlined className={AccessStyles.sectionIcon} />
              <h3>Access Settings</h3>
            </div>
          </div>
          <p className={AccessStyles.description}>
            Configure access type and specify which candidates can take this test.
          </p>

          <div className={AccessStyles.toggleGroup}>
            <button
              className={accessType === "all" ? AccessStyles.active : ""}
              onClick={() => {
                setAccessType("all");
                setSelectedDepartments([]);
                setSelectedBatches([]);
                setSelectedRowKeys([]);
              }}
            >
              All Users
            </button>
            <button
              className={accessType === "department" ? AccessStyles.active : ""}
              onClick={() => {
                setAccessType("department");
                setSelectedDepartments([]);
                setSelectedBatches([]);
                setSelectedRowKeys([]);
              }}
            >
              Department
            </button>
            <button
              className={accessType === "batch" ? AccessStyles.active : ""}
              onClick={() => {
                setAccessType("batch");
                setSelectedDepartments([]);
                setSelectedBatches([]);
                setSelectedRowKeys([]);
              }}
            >
              Batch
            </button>
            <button
              className={accessType === "department_batch" ? AccessStyles.active : ""}
              onClick={() => {
                setAccessType("department_batch");
                setSelectedDepartments([]);
                setSelectedBatches([]);
                setSelectedRowKeys([]);
              }}
            >
              Department & Batch
            </button>
            <button
              className={accessType === "student" ? AccessStyles.active : ""}
              onClick={() => {
                setAccessType("student");
                setSelectedDepartments([]);
                setSelectedBatches([]);
                setSelectedRowKeys([]);
              }}
            >
              Specific Students
            </button>
          </div>

          <div className={AccessStyles.selectContainer}>
            {accessType === "department" && (
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%", maxWidth: "360px" }}
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
                onChange={(selectedIds) => setSelectedDepartments(selectedIds)}
                placeholder="Select Departments"
              />
            )}

            {accessType === "batch" && (
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%", maxWidth: "360px" }}
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
                onChange={(selectedYears) => setSelectedBatches(selectedYears)}
                placeholder="Select Batch Years"
              />
            )}

            {accessType === "department_batch" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p>Select Department and Batch filters for test access:</p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%", maxWidth: "280px" }}
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
                    onChange={(selectedIds) => setSelectedDepartments(selectedIds)}
                    placeholder="Select Departments"
                  />
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%", maxWidth: "280px" }}
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
                    onChange={(selectedYears) => setSelectedBatches(selectedYears)}
                    placeholder="Select Batch Years"
                  />
                </div>
              </div>
            )}

            {accessType === "student" && (
              <>
                <div className={AccessStyles.tableControls}>
                  <Input
                    placeholder="Search by student email..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className={AccessStyles.searchField}
                    prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  />
                  <Button
                    type="primary"
                    onClick={() => setSorted(true)}
                    disabled={selectedRowKeys.length === 0}
                  >
                    Sort Selected to Top
                  </Button>
                </div>
                <Table
                  rowKey="_id"
                  columns={emailColumns}
                  dataSource={getTableData()}
                  rowSelection={rowSelection}
                  pagination={{ pageSize: 8 }}
                  size="small"
                />
              </>
            )}
          </div>
        </div>

        {/* Card 2: Honest Respondent Technology */}
        <div className={AccessStyles.cardSection}>
          <div className={AccessStyles.sectionHeader}>
            <div className={AccessStyles.headerLeft}>
              <SafetyCertificateOutlined className={AccessStyles.sectionIcon} />
              <h3>Honest Respondent Technology</h3>
            </div>
            <div className={AccessStyles.headerRight}>
              <div className={AccessStyles.toggleGroup}>
                <button
                  className={honestRespondentvalue === "Disable" ? AccessStyles.active : ""}
                  onClick={() => onChangeHonestRespondent("Disable")}
                >
                  Disable
                </button>
                <button
                  className={honestRespondentvalue === "Enable Warnings Only" ? AccessStyles.active : ""}
                  onClick={() => onChangeHonestRespondent("Enable")}
                >
                  Warnings Only
                </button>
                <button
                  className={honestRespondentvalue === "Enable Warnings and test block" ? AccessStyles.active : ""}
                  onClick={() => onChangeHonestRespondent("Enable Warnings and test block")}
                >
                  Warnings & Block
                </button>
              </div>
            </div>
          </div>
          <p className={AccessStyles.description}>
            Monitor candidate browser movements to prevent cheating. Issue warnings or block the test on page exit.
          </p>

          <div className={AccessStyles.infoContainer}>
            <div className={AccessStyles.infoTitle}>
              <InfoCircleOutlined />
              <span>Accidental Exits Guidance</span>
            </div>
            <p>
              Candidates are advised to close background tasks and notifications before starting. Switch events can trigger accidentally (e.g. system warnings, taskbar clicks, mobile alerts).
            </p>

            {honestRespondentvalue === "Enable Warnings and test block" && (
              <div className={AccessStyles.subInfoBlock}>
                <div className={AccessStyles.exitsSelectContainer}>
                  <div className={AccessStyles.exitsLeft}>
                    <h4>Maximum Page Exits Allowed</h4>
                    <span>
                      <InfoCircleOutlined />
                      We recommend allowing at least 2 exits to prevent false blocks.
                    </span>
                  </div>
                  <select
                    value={selVAl || SingleTest?.honestRespondent?.maxAttempts || "2"}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectval(value);
                      dispatch(
                        updateTestValues({
                          honestRespondent: {
                            ...SingleTest?.honestRespondent,
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
                    }}
                  >
                    <option value="1">1 exit</option>
                    <option value="2">2 exits</option>
                    <option value="3">3 exits</option>
                    <option value="4">4 exits</option>
                    <option value="5">5 exits</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Facial Recognition Technology */}
        <div className={AccessStyles.cardSection}>
          <div className={AccessStyles.sectionHeader}>
            <div className={AccessStyles.headerLeft}>
              <ScanOutlined className={AccessStyles.sectionIcon} />
              <h3>Facial Recognition Technology</h3>
            </div>
            <div className={AccessStyles.headerRight}>
              <div className={AccessStyles.toggleGroup}>
                <button
                  className={FaceRecValue === "Disable" ? AccessStyles.active : ""}
                  onClick={() => onChangeFaceRec("Disable")}
                >
                  Disable
                </button>
                <button
                  className={FaceRecValue === "Enable" ? AccessStyles.active : ""}
                  onClick={() => onChangeFaceRec("Enable")}
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
          <p className={AccessStyles.description}>
            Verifies student identity using webcam scans before and regularly during the test against stored databases.
          </p>
          <div className={AccessStyles.infoContainer}>
            <div className={AccessStyles.infoTitle}>
              <InfoCircleOutlined />
              <span>Camera Setup Instructions</span>
            </div>
            <p>
              When enabled, candidates must grant webcam permissions. The system continuously verifies face consistency and generates alerts on mismatch or face disappearance.
            </p>
          </div>
        </div>

        {/* Card 4: User Snapshot Technology */}
        <div className={AccessStyles.cardSection}>
          <div className={AccessStyles.sectionHeader}>
            <div className={AccessStyles.headerLeft}>
              <CameraOutlined className={AccessStyles.sectionIcon} />
              <h3>User Snapshot Technology</h3>
            </div>
            <div className={AccessStyles.headerRight}>
              <div className={AccessStyles.toggleGroup}>
                <button
                  className={Snapshotvalue === "Disable" ? AccessStyles.active : ""}
                  onClick={() => onChangeSnapshot("Disable")}
                >
                  Disable
                </button>
                <button
                  className={Snapshotvalue === "Enable" ? AccessStyles.active : ""}
                  onClick={() => onChangeSnapshot("Enable")}
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
          <p className={AccessStyles.description}>
            Captures a photo of the student using device camera before beginning the test to document student presence.
          </p>
          <div className={AccessStyles.infoContainer}>
            <div className={AccessStyles.infoTitle}>
              <InfoCircleOutlined />
              <span>Verification Benefits</span>
            </div>
            <p>
              Snapshots are stored securely and can be audited by test proctors to prevent impersonation and verify candidates.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className={AccessStyles.formActions}>
          <button className={AccessStyles.saveBtn} onClick={handleUpdate}>
            Update
          </button>
          <button 
            className={AccessStyles.discardBtn} 
            onClick={() => router.push("/testportal_admin/myTests")}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Accesspage;
