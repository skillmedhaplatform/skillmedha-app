"use client";
import React, { useEffect, useState } from "react";
import timeStyles from "./styles/page.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Button, TimePicker, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { updateJobAssessment } from "@/redux/slices/company/skillMedhaData";

const Page = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { jobId: jobid } = useParams();

  // Get test data from Redux
  const singleJobAssessment = useSelector(
    (s) => s.skillmedha.singleJobAssessment
  );

  const ONEJOB = useSelector((state) => state.placement.OneJob?.value);
  const aId = ONEJOB?.data?.AssessmentId;

  // Local state for form data
  const [testDetails, setTestDetails] = useState({});

  // New state variables for Test Activation Method
  const [testActivationOption, setTestActivationOption] = useState("No expiry");
  const [expiryDate, setExpiryDate] = useState(null);
  const [testActivationDate, setTestActivationDate] = useState(null);
  const [accessClosingDate, setAccessClosingDate] = useState(null);
  const [singleTestValues, setSingleTestValues] = useState({});

  // Base URL for navigation
  const baseUrl = `/myjobs/${jobid}/createjob/nextpage`;

  // Initialize form data when singleJobAssessment data loads
  useEffect(() => {
    if (singleJobAssessment) {
      setTestDetails({
        ...singleJobAssessment,
      });
      setSingleTestValues(singleJobAssessment?.time || {});

      // Handle different testActivationOption formats
      const activationOption = singleJobAssessment?.time?.testActivationOption;
      if (typeof activationOption === "string") {
        setTestActivationOption(activationOption);
      } else if (activationOption?.testActivationMethod?.type) {
        setTestActivationOption(activationOption.testActivationMethod.type);
      } else {
        setTestActivationOption("No expiry");
      }

      // Initialize date values based on structure
      if (singleJobAssessment?.time?.expiryDates?.testExpirationData) {
        setExpiryDate(
          dayjs(singleJobAssessment.time.expiryDates.testExpirationData)
        );
      }

      // For "Activation in a set time period", dates are in testActivationMethod
      if (
        singleJobAssessment?.time?.testActivationOption?.testActivationMethod
          ?.testActivationDate
      ) {
        setTestActivationDate(
          dayjs(
            singleJobAssessment.time.testActivationOption.testActivationMethod
              .testActivationDate
          )
        );
      }

      if (
        singleJobAssessment?.time?.testActivationOption?.testActivationMethod
          ?.accessClosingDate
      ) {
        setAccessClosingDate(
          dayjs(
            singleJobAssessment.time.testActivationOption.testActivationMethod
              .accessClosingDate
          )
        );
      }
    } else {
      setTestDetails({});
      setSingleTestValues({});
    }
  }, [singleJobAssessment]);

  // Get time value from testDetails or default to null
  const getTimeValue = () => {
    const duration = testDetails?.time?.testDuration?.testDuration?.duration;
    if (duration?.val1 && duration?.val2) {
      return dayjs(`${duration.val1}:${duration.val2}`, "HH:mm");
    }
    return null;
  };

  // Handle time picker change
  const handleTimeChange = (time) => {
    if (!time) {
      // Remove time data if time is cleared
      setTestDetails((prev) => ({
        ...prev,
        time: {
          ...prev.time,
          testDuration: undefined,
        },
      }));
      return;
    }

    // Format time to HH and MM
    const hours = time.format("HH");
    const minutes = time.format("mm");

    // Update testDetails with new time
    setTestDetails((prev) => ({
      ...prev,
      time: {
        ...prev.time,
        testDuration: {
          testDuration: {
            duration: {
              val1: hours,
              val2: minutes,
            },
            label: "Time to complete the test (HH : MM)",
          },
        },
      },
    }));
  };

  // Handle date change for manual test expiration
  const handleExpiryDateChange = (date) => {
    setExpiryDate(date);
  };

  // Handle test activation date change
  const handleTestActivationDateChange = (date) => {
    setTestActivationDate(date);
  };

  // Handle access closing date change
  const handleAccessClosingDateChange = (date) => {
    setAccessClosingDate(date);
  };

  // Save functionality with correct dispatch format - sending only time object
  const handleSave = async () => {
    // Create the time object with the exact structure you specified
    let timeData = {
      ...testDetails.time,
    };

    // Handle different activation options with your exact dispatch format
    switch (testActivationOption) {
      case "No expiry":
        timeData = {
          ...timeData,
          expiryDates: {
            expiry: false,
          },
          testActivationOption: "No expiry",
        };
        break;

      case "Manual Test Activation":
        timeData = {
          ...timeData,
          expiryDates: {
            expiry: true,
            testExpirationData: expiryDate
              ? expiryDate.format("YYYY-MM-DDTHH:mm")
              : null,
          },
          testActivationOption: "Manual Test Activation",
        };
        break;

      case "Activation in a set time period":
        timeData = {
          ...timeData,
          expiryDates: {
            expiry: true,
            accessClosingDate: accessClosingDate
              ? accessClosingDate.format("YYYY-MM-DDTHH:mm")
              : null,
          },
          testActivationOption: {
            testActivationMethod: {
              type: "Activation in a set time period",
              testActivationDate: testActivationDate
                ? testActivationDate.format("YYYY-MM-DDTHH:mm")
                : null,
              accessClosingDate: accessClosingDate
                ? accessClosingDate.format("YYYY-MM-DDTHH:mm")
                : null,
            },
          },
        };
        break;

      default:
        timeData = {
          ...timeData,
          expiryDates: {
            expiry: false,
          },
          testActivationOption: "No expiry",
        };
    }

    // Check if there are any changes in the time object
    const originalTimeData = ONEJOB?.data?.time || {};
    if (JSON.stringify(originalTimeData) === JSON.stringify(timeData)) {
      message.info("No changes to update.");
      router.push(baseUrl);
      return;
    }

    // console.log("Dispatching only time object:", { time: timeData });

    try {
      // Send only the time object with aId
      await dispatch(updateJobAssessment({ time: timeData, aId }));
      router.push(`/myjobs/${jobid}/createjob/questionManager`);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return (
    <div className={timeStyles.container}>
      {/* Test Duration Section */}
      <div className={timeStyles.respTitle} style={{ color: "#25a3a6" }}>
        Test Duration*
      </div>
      <div className={timeStyles.option}>
        <label>Time to complete the test (HH : MM):</label>
        <TimePicker
          format="HH:mm"
          showNow={false}
          defaultOpenValue={dayjs("00:00", "HH:mm")}
          onChange={handleTimeChange}
          value={getTimeValue()}
          allowClear
          style={{ width: "200px" }}
        />
      </div>

      {/* Test Activation Method Section */}
      <div
        className={timeStyles.respTitle}
        style={{ color: "#25a3a6", marginTop: "30px" }}
      >
        Test Activation Method
      </div>

      <div className={timeStyles.expiryComp} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="radio"
            id="now"
            name="expiry"
            value="No expiry"
            checked={testActivationOption === "No expiry"}
            onChange={() => {
              setTestActivationOption("No expiry");
              setSingleTestValues({
                ...singleTestValues,
                testActivationOption: "No expiry",
              });
            }}
            style={{ marginRight: "8px" }}
          />
          <label htmlFor="now">No expiry</label>
        </div>

        <div
          className={timeStyles.manualtest_div}
          style={{ marginBottom: "15px" }}
        >
          <div style={{ marginBottom: "10px" }}>
            <input
              type="radio"
              id="later"
              name="expiry"
              value="Manual Test Activation"
              checked={testActivationOption === "Manual Test Activation"}
              onChange={() => {
                setTestActivationOption("Manual Test Activation");
                setSingleTestValues({
                  ...singleTestValues,
                  testActivationOption: "Manual Test Activation",
                });
              }}
              style={{ marginRight: "8px" }}
            />
            <label htmlFor="later">Manual Test Expiration</label>
          </div>
          {testActivationOption === "Manual Test Activation" && (
            <div style={{ marginLeft: "25px" }}>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="Select expiry date and time"
                style={{ width: "250px" }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="radio"
            id="TimePeriod"
            name="expiry"
            value="Activation in a set time period"
            checked={testActivationOption === "Activation in a set time period"}
            onChange={() => {
              setTestActivationOption("Activation in a set time period");
              setSingleTestValues({
                ...singleTestValues,
                testActivationOption: {
                  ...singleTestValues?.testActivationOption,
                  testActivationMethod: {
                    type: "Activation in a set time period",
                  },
                },
              });
            }}
            style={{ marginRight: "8px" }}
          />
          <label htmlFor="TimePeriod">Activation in a set time period</label>
        </div>

        {testActivationOption === "Activation in a set time period" && (
          <div
            style={{
              marginLeft: "25px",
              display: "flex",
              gap: "1rem",
              width: "90%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>Test activation date</div>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                value={testActivationDate}
                onChange={handleTestActivationDateChange}
                placeholder="Select activation date and time"
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>Access closing date</div>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                value={accessClosingDate}
                onChange={handleAccessClosingDateChange}
                placeholder="Select closing date and time"
              />
            </div>
          </div>
        )}

        <Button
          type="primary"
          onClick={handleSave}
          style={{ marginTop: "4rem" }}
        >
          {ONEJOB?.data?._id ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default Page;
