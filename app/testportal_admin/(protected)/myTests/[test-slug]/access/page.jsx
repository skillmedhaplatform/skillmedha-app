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
  const [attemptsPerRespondent, setAttemptsPerRespondent] = useState(2);

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

  const getDepartmentOptions = () => {
    let list = [];
    if (Array.isArray(departments?.value)) {
      list = departments.value;
    } else if (Array.isArray(departments?.value?.data)) {
      list = departments.value.data;
    } else if (Array.isArray(departments)) {
      list = departments;
    }

    const optionsMap = new Map();

    list.forEach((item) => {
      if (item && item._id) {
        optionsMap.set(String(item._id), {
          label: item.title || item.name || String(item._id),
          value: String(item._id),
        });
      } else if (item) {
        optionsMap.set(String(item), {
          label: String(item),
          value: String(item),
        });
      }
    });

    if (Array.isArray(selectedDepartments)) {
      selectedDepartments.forEach((deptId) => {
        if (deptId && !optionsMap.has(String(deptId))) {
          optionsMap.set(String(deptId), {
            label: String(deptId),
            value: String(deptId),
          });
        }
      });
    }

    return Array.from(optionsMap.values());
  };

  const getBatchOptions = () => {
    let list = [];
    if (Array.isArray(batches?.value)) {
      list = batches.value;
    } else if (Array.isArray(batches?.value?.data)) {
      list = batches.value.data;
    } else if (Array.isArray(batches)) {
      list = batches;
    }

    const optionsMap = new Map();

    // Standard common batch years so the dropdown is never empty ("No data")
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 4; y <= currentYear + 5; y++) {
      const yrStr = String(y);
      optionsMap.set(yrStr, { label: yrStr, value: yrStr });
    }

    // Add items from backend API
    list.forEach((item) => {
      let year =
        item?.yearOfPassing !== undefined
          ? item.yearOfPassing
          : item?.batch !== undefined
          ? item.batch
          : item;
      if (year !== null && year !== undefined && String(year).trim() !== "" && String(year) !== "null") {
        const yearStr = String(year).trim();
        optionsMap.set(yearStr, { label: yearStr, value: yearStr });
      }
    });

    // Add currently selected batches
    if (Array.isArray(selectedBatches)) {
      selectedBatches.forEach((yr) => {
        if (yr !== null && yr !== undefined && String(yr).trim() !== "") {
          const yrStr = String(yr).trim();
          if (!optionsMap.has(yrStr)) {
            optionsMap.set(yrStr, { label: yrStr, value: yrStr });
          }
        }
      });
    }

    return Array.from(optionsMap.values());
  };

  const handleUpdate = () => {
    let finalAttempts = Number(attemptsPerRespondent);
    if (isNaN(finalAttempts) || finalAttempts === 0 || finalAttempts < -1) {
      finalAttempts = -1;
    } else if (finalAttempts > 100) {
      finalAttempts = 100;
    }

    const cleanBatches = (selectedBatches || []).map((y) => String(y).trim()).filter(Boolean);
    const cleanDepts = (selectedDepartments || []).map((d) => String(d).trim()).filter(Boolean);

    let payload = {
      access: {
        type: accessType,
        attemptsPerRespondent: finalAttempts,
      },
    };

    if (accessType === "department") {
      payload.access.department = cleanDepts;
      payload.access.yearOfPassing = [];
      payload.access.batch = [];
    } else if (accessType === "batch") {
      payload.access.yearOfPassing = cleanBatches;
      payload.access.batch = cleanBatches;
      payload.access.department = [];
    } else if (accessType === "department_batch") {
      payload.access.yearOfPassing = cleanBatches;
      payload.access.batch = cleanBatches;
      payload.access.department = cleanDepts;
    } else if (accessType === "student") {
      payload.access.students = selectedRowKeys;
    } else {
      payload.access.department = [];
      payload.access.yearOfPassing = [];
      payload.access.batch = [];
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

  const handleReopenTest = () => {
    if (window.confirm("Are you sure you want to reopen this test for all students? They will be able to take it again.")) {
      // TODO: Future improvement: Update backend to use MongoDB `$inc: { attemptGeneration: 1 }` 
      // instead of client-side increment to prevent race conditions.
      dispatch(
        updateTest({ 
          id: selectedId, 
          updates: { attemptGeneration: (SingleTest.attemptGeneration || 0) + 1 } 
        })
      ).then((res) => {
        if (res?.payload) {
          message.success("Test reopened successfully");
        }
      });
    }
  };

  useEffect(() => {
    if (SingleTest && SingleTest.access) {
      const access = SingleTest.access;
      setAccessType(access.type || "department");

      if (Array.isArray(access.department)) {
        setSelectedDepartments(access.department.map(String));
      } else if (typeof access.department === "string" && access.department) {
        setSelectedDepartments([String(access.department)]);
      }

      const batchList = access.yearOfPassing || access.batch;
      if (Array.isArray(batchList)) {
        setSelectedBatches(batchList.map(String));
      } else if (batchList !== undefined && batchList !== null && String(batchList).trim() !== "") {
        setSelectedBatches([String(batchList)]);
      }
      
      if (Array.isArray(access.students)) {
        setSelectedRowKeys(access.students);
      } else if (typeof access.students === "string" && access.students) {
        setSelectedRowKeys([access.students]);
      }

      if (access.attemptsPerRespondent !== undefined && access.attemptsPerRespondent !== null && access.attemptsPerRespondent !== "") {
        setAttemptsPerRespondent(access.attemptsPerRespondent);
      } else {
        setAttemptsPerRespondent(2);
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
              onClick={() => setAccessType("all")}
            >
              All Users
            </button>
            <button
              className={accessType === "department" ? AccessStyles.active : ""}
              onClick={() => setAccessType("department")}
            >
              Department
            </button>
            <button
              className={accessType === "batch" ? AccessStyles.active : ""}
              onClick={() => setAccessType("batch")}
            >
              Batch
            </button>
            <button
              className={accessType === "department_batch" ? AccessStyles.active : ""}
              onClick={() => setAccessType("department_batch")}
            >
              Department & Batch
            </button>
            <button
              className={accessType === "student" ? AccessStyles.active : ""}
              onClick={() => setAccessType("student")}
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
                options={getDepartmentOptions()}
                onChange={(selectedIds) => setSelectedDepartments(selectedIds.map(String))}
                placeholder="Select Departments"
              />
            )}

            {accessType === "batch" && (
              <Select
                mode="tags"
                allowClear
                style={{ width: "100%", maxWidth: "360px" }}
                value={selectedBatches}
                options={getBatchOptions()}
                onChange={(selectedYears) => {
                  const cleanYears = selectedYears.map((y) => String(y).trim()).filter(Boolean);
                  setSelectedBatches(cleanYears);
                }}
                placeholder="Select or enter Batch Years (e.g. 2024, 2025)"
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
                    options={getDepartmentOptions()}
                    onChange={(selectedIds) => setSelectedDepartments(selectedIds.map(String))}
                    placeholder="Select Departments"
                  />
                  <Select
                    mode="tags"
                    allowClear
                    style={{ width: "100%", maxWidth: "280px" }}
                    value={selectedBatches}
                    options={getBatchOptions()}
                    onChange={(selectedYears) => {
                      const cleanYears = selectedYears.map((y) => String(y).trim()).filter(Boolean);
                      setSelectedBatches(cleanYears);
                    }}
                    placeholder="Select or enter Batch Years (e.g. 2024, 2025)"
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

        {/* Card 1.5: Attempt Restrictions */}
        <div className={AccessStyles.cardSection}>
          <div className={AccessStyles.sectionHeader}>
            <div className={AccessStyles.headerLeft}>
              <InfoCircleOutlined className={AccessStyles.sectionIcon} />
              <h3>Attempt Restrictions</h3>
            </div>
          </div>
          <p className={AccessStyles.description}>
            Configure the maximum number of attempts each student is allowed for this test.
          </p>

          <div className={AccessStyles.infoContainer} style={{ marginTop: "1rem" }}>
            <div className={AccessStyles.subInfoBlock}>
              <div className={AccessStyles.exitsSelectContainer}>
                <div className={AccessStyles.exitsLeft}>
                  <h4>Maximum Attempts Allowed</h4>
                  <span>
                    <InfoCircleOutlined /> Enter an integer between 1 and 100 for normal attempts, or -1 for unlimited attempts.
                  </span>
                </div>
                <input
                  type="number"
                  min={-1}
                  max={100}
                  step={1}
                  value={attemptsPerRespondent === "" ? "" : attemptsPerRespondent}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setAttemptsPerRespondent("");
                      return;
                    }
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setAttemptsPerRespondent(num);
                    }
                  }}
                  onBlur={() => {
                    if (attemptsPerRespondent === "" || isNaN(attemptsPerRespondent)) {
                      setAttemptsPerRespondent(2);
                    } else if (attemptsPerRespondent === 0 || attemptsPerRespondent < -1) {
                      setAttemptsPerRespondent(-1);
                    } else if (attemptsPerRespondent > 100) {
                      setAttemptsPerRespondent(100);
                    }
                  }}
                  placeholder="e.g. 2"
                />
              </div>
            </div>
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
          {SingleTest?._id && (
            <button
              type="button"
              className={AccessStyles.saveBtn}
              style={{ backgroundColor: '#FACE53', color: '#000', marginLeft: '10px' }}
              onClick={handleReopenTest}
            >
              Reopen Test
            </button>
          )}
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
