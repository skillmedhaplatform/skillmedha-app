// "use client";
// import React, { useEffect, useState } from "react";
// import FormPage from "../page";
// import timeStyles from "./styles/page.module.scss";
// import Switch from "../access/utils/switch/switch";
// import BTag from "../../utils/button";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, usePathname } from "next/navigation";
// import {
//   createTests,
//   getOneTests,
//   updateTest,
//   updateTestValues,
// } from "@/redux/slices/testportal_admin/slice/test";
// import { updatingVals } from "@/redux/slices/testportal_admin/slice/stepform";
// import { Button, Skeleton, TimePicker, DatePicker } from "antd";
// import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";

// dayjs.extend(customParseFormat);

// const Page = () => {
//   const dispatch = useDispatch();
//   const SingleTest = useSelector((state) => state.tests.test);
//   const SingleTestStatus = useSelector(
//     (state) => state.tests.singleTestStatus.status
//   );

//   const params = useParams();
//   const selectedId = params["test-slug"]?.split("_id-")[1];

//   const timeVals = useSelector((state) => state.steps.updatingVals);

//   const [testTime, setTestTime] = useState(
//     SingleTest?.time?.testDuration?.testDuration?.duration || {}
//   );
//   const [SingletestVlues, setSingletestVlues] = useState(
//     SingleTest?.time || {}
//   );
//   const [testTimeOpen, setTestTimeOpen] = useState(false);
//   const [questionTime, setQuestionTime] = useState({});
//   const [questionTimeOpen, setQuestionTimeOpen] = useState(false);

//   const [isSwitchOn, setSwitch] = useState(false);

//   const [testActivationOption, setTestActivationOption] = useState(
//     typeof SingleTest?.time?.testActivationOption?.testActivationMethod?.type ==
//       "object"
//       ? SingleTest?.time?.testActivationOption?.testActivationMethod?.type
//       : SingleTest?.time?.testActivationOption || "No expiry"
//   );
//   const [expiryDate, setExpiryDate] = useState("");

//   useEffect(() => {
//     if (SingleTest) {
//       setTestTime(SingleTest?.time?.testDuration?.testDuration?.duration || {});
//       setSingletestVlues(SingleTest?.time || {});
//     }
//   }, [SingleTest?._id]);

//   useEffect(() => {
//     dispatch(updateTestValues(SingleTest?.time));
//     if (!SingleTest?.time) dispatch(updateTestValues(SingleTest?.time));
//   }, [SingleTest?._id]);

//   const updateTestsTime = () => {
//     const testDuration = {};

//     if (testTime.val1 && testTime.val2) {
//       testDuration.testDuration = {
//         label: "Time to complete the test (HH : MM)",
//         duration: testTime,
//       };
//     }

//     if (questionTime.val1 && questionTime.val2) {
//       testDuration.questionDuration = {
//         label: "Time limit for each question (MM:SS)",
//         duration: questionTime,
//       };
//     }
//     const updatingBody = {
//       time: {
//         testDuration,
//         testActivationMethod: {
//           type: testActivationOption,
//           ...(testActivationOption === "Manual Test Activation" && {
//             manualActivationDate: expiryDate,
//           }),
//           ...(testActivationOption === "Activation in a set time period" && {
//             ...timeVals.time?.expiryDates,
//           }),
//         },
//         skippingQuestions: isSwitchOn,
//       },
//     };
//   };

//   const handleDateChange = (date, dateString) => {
//     const formattedDate = date ? date.format("YYYY-MM-DDTHH:mm") : "";
//     setExpiryDate(formattedDate);

//     // Update local state
//     setSingletestVlues({
//       ...SingletestVlues,
//       expiryDates: {
//         ...SingletestVlues?.expiryDates,
//         testExpirationData: formattedDate,
//       },
//     });

//     dispatch(
//       updatingVals({
//         ...timeVals,
//         time: { manualTestActivation: { testExpiryDate: formattedDate } },
//       })
//     );
//     dispatch(
//       updateTestValues({
//         time: {
//           ...SingleTest.time,
//           expiryDates: {
//             expiry: true,
//             testExpirationData: formattedDate,
//           },
//         },
//       })
//     );
//   };

//   const handleTestTimeChange = (time, timeString) => {
//     if (time) {
//       const hours = time.hour().toString().padStart(2, "0");
//       const minutes = time.minute().toString().padStart(2, "0");

//       const updatedTestTime = {
//         val1: hours,
//         val2: minutes,
//       };

//       setTestTime(updatedTestTime);

//       dispatch(
//         updateTestValues({
//           ...SingleTest?.time,
//           testDuration: {
//             ...SingleTest?.time?.testDuration,
//             testDuration: {
//               label: "Time to complete the test (HH : MM)",
//               duration: updatedTestTime,
//             },
//           },
//         })
//       );
//     }
//   };

//   const getTestTimeValue = () => {
//     if (testTime?.val1 && testTime?.val2) {
//       const hour = testTime.val1.toString().replace(/\s/g, "").padStart(2, "0");
//       const minute = testTime.val2
//         .toString()
//         .replace(/\s/g, "")
//         .padStart(2, "0");
//       return dayjs(`${hour}:${minute}`, "HH:mm");
//     }
//     return null;
//   };

//   const handleTestActivationDateChange = (date, dateString) => {
//     const formattedDate = date ? date.format("YYYY-MM-DDTHH:mm") : "";

//     // Update local state
//     setSingletestVlues({
//       ...SingletestVlues,
//       testActivationOption: {
//         ...SingletestVlues?.testActivationOption,
//         testActivationMethod: {
//           ...SingletestVlues?.testActivationOption?.testActivationMethod,
//           testActivationDate: formattedDate,
//         },
//       },
//     });

//     updateTestsTime();
//     dispatch(
//       updatingVals({
//         ...timeVals,
//         time: {
//           expiryDates: {
//             ...timeVals.time?.expiryDates,
//             testActivationDate: formattedDate,
//           },
//         },
//       })
//     );
//     dispatch(
//       updateTestValues({
//         time: {
//           ...SingleTest.time,
//           expiryDates: {
//             expiry: true,
//             testActivationDate: formattedDate,
//           },
//         },
//       })
//     );
//   };

//   const handleAccessClosingDateChange = (date, dateString) => {
//     const formattedDate = date ? date.format("YYYY-MM-DDTHH:mm") : "";

//     // Update local state
//     setSingletestVlues({
//       ...SingletestVlues,
//       testActivationOption: {
//         ...SingletestVlues?.testActivationOption,
//         testActivationMethod: {
//           ...SingletestVlues?.testActivationOption?.testActivationMethod,
//           accessClosingDate: formattedDate,
//         },
//       },
//     });

//     updateTestsTime();
//     dispatch(
//       updatingVals({
//         ...timeVals,
//         time: {
//           expiryDates: {
//             ...timeVals.time?.expiryDates,
//             accessClosingDate: formattedDate,
//           },
//         },
//       })
//     );
//     dispatch(
//       updateTestValues({
//         time: {
//           ...SingleTest.time,
//           expiryDates: {
//             expiry: true,
//             accessClosingDate: formattedDate,
//           },
//         },
//       })
//     );
//   };

//   const getDateValue = (dateString) => {
//     if (dateString) {
//       return dayjs(dateString, "YYYY-MM-DDTHH:mm");
//     }
//     return null;
//   };

//   return (
//     <FormPage>
//       {SingleTestStatus == "fulfilled" ? (
//         <div className={timeStyles.container}>
//           <div className={timeStyles.respTitle}>Test Duration*</div>

//           <div className={timeStyles.option}>
//             <label htmlFor="option1">
//               Time to complete the test (HH : MM) :{" "}
//             </label>

//             <TimePicker
//               format="HH:mm"
//               value={getTestTimeValue()}
//               onChange={handleTestTimeChange}
//               placeholder="Select time"
//               className={timeStyles.timeCons}
//               style={{ width: "20%" }}
//               showNow={false}
//               hideDisabledOptions
//               needConfirm={false}
//             />
//           </div>

//           <div
//             className={timeStyles.respTitle}
//             onClick={() => setTestTimeOpen(false)}
//           >
//             Test Activation Method
//           </div>

//           <div
//             className={timeStyles.expiryComp}
//             onClick={() => setTestTimeOpen(false)}
//           >
//             <div>
//               <input
//                 type="radio"
//                 id="now"
//                 name="expiry"
//                 value="No expiry"
//                 checked={
//                   testActivationOption === "No expiry" ||
//                   SingletestVlues?.testActivationOption == "No expiry"
//                 }
//                 onChange={() => {
//                   setTestActivationOption("No expiry");
//                   setSingletestVlues({
//                     ...SingletestVlues,
//                     testActivationOption: "No expiry",
//                   });
//                   dispatch(
//                     updateTestValues({
//                       time: {
//                         ...SingleTest.time,
//                         expiryDates: {
//                           expiry: false,
//                         },
//                       },
//                     })
//                   );
//                 }}
//               />
//               <label htmlFor="No expiry">No expiry</label>
//             </div>
//             <div className={timeStyles.manualtest_div}>
//               <div>
//                 <input
//                   type="radio"
//                   id="later"
//                   name="expiry"
//                   value="Manual Test Activation"
//                   checked={
//                     SingletestVlues?.testActivationOption ==
//                     "Manual Test Activation"
//                   }
//                   onChange={() => {
//                     setTestActivationOption("Manual Test Activation");
//                     setSingletestVlues({
//                       ...SingletestVlues,
//                       testActivationOption: "Manual Test Activation",
//                     });
//                   }}
//                 />
//                 <label htmlFor="Manual Test Activation">
//                   Manual Test Expiration
//                 </label>
//               </div>

//               {SingletestVlues?.testActivationOption ==
//               "Manual Test Activation" ? (
//                 <DatePicker
//                   showTime
//                   format="YYYY-MM-DD HH:mm"
//                   value={getDateValue(
//                     SingletestVlues?.expiryDates?.testExpirationData
//                   )}
//                   onChange={handleDateChange}
//                   className={timeStyles.inp}
//                   style={{ width: "30%" }}
//                   placeholder="Select date and time"
//                   needConfirm={false}
//                 />
//               ) : null}
//             </div>
//           </div>

//           <label className={timeStyles.timePeriod}>
//             <input
//               type="radio"
//               id="TimePeriod"
//               name="expiry"
//               value="Activation in a set time period"
//               checked={
//                 SingletestVlues?.testActivationOption?.testActivationMethod
//                   ?.type == "Activation in a set time period"
//               }
//               onChange={() => {
//                 setTestActivationOption("Activation in a set time period");
//                 setSingletestVlues({
//                   ...SingletestVlues,
//                   testActivationOption: {
//                     ...SingletestVlues?.testActivationOption,
//                     testActivationMethod: {
//                       type: "Activation in a set time period",
//                     },
//                   },
//                 });
//               }}
//             />
//             Activation in a set time period
//           </label>

//           {SingletestVlues?.testActivationOption?.testActivationMethod?.type ==
//           "Activation in a set time period" ? (
//             <div className={timeStyles.startEnd}>
//               <div
//                 style={{
//                   width: "50%",
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "1rem",
//                 }}
//               >
//                 <div>Test activation date</div>
//                 <DatePicker
//                   showTime
//                   format="YYYY-MM-DD HH:mm"
//                   value={getDateValue(
//                     SingletestVlues?.testActivationOption?.testActivationMethod
//                       ?.testActivationDate
//                   )}
//                   onChange={handleTestActivationDateChange}
//                   style={{ width: "100%" }}
//                   placeholder="Select date and time"
//                   needConfirm={false}
//                 />
//               </div>

//               <div
//                 style={{
//                   width: "50%",
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "1rem",
//                 }}
//               >
//                 <div>Access closing date</div>
//                 <DatePicker
//                   showTime
//                   format="YYYY-MM-DD HH:mm"
//                   value={getDateValue(
//                     SingletestVlues?.testActivationOption?.testActivationMethod
//                       ?.accessClosingDate
//                   )}
//                   onChange={handleAccessClosingDateChange}
//                   style={{ width: "100%" }}
//                   placeholder="Select date and time"
//                   needConfirm={false}
//                 />
//               </div>
//             </div>
//           ) : null}

//           <Button
//             type="default"
//             onClick={() => {
//               const updates = JSON.parse(JSON.stringify(SingleTest));
//               delete updates._id;

//               updates.time = updates.time || {};
//               updates.time.testActivationOption =
//                 testActivationOption !== "Activation in a set time period"
//                   ? testActivationOption
//                   : {
//                       testActivationMethod: {
//                         type: testActivationOption,
//                         ...(testActivationOption ===
//                           "Manual Test Activation" && {
//                           manualActivationDate: expiryDate,
//                         }),
//                         ...(testActivationOption ===
//                           "Activation in a set time period" && {
//                           ...timeVals.time?.expiryDates,
//                         }),
//                       },
//                     };

//               const modifiedTestTime = { ...testTime };
//               modifiedTestTime.val1 = modifiedTestTime.val1
//                 ?.split(" ")
//                 .join("");
//               modifiedTestTime.val2 = modifiedTestTime.val2
//                 ?.split(" ")
//                 .join("");

//               updates.time.testDuration = updates.time.testDuration || {};
//               updates.time.testDuration.testDuration =
//                 updates.time.testDuration.testDuration || {};
//               updates.time.testDuration.testDuration.duration =
//                 modifiedTestTime;
//               updates.time.testDuration.testDuration.label = testTime
//                 ? "Time to complete the test (HH : MM)"
//                 : "Time limit for each question (MM:SS)";

//               const updateVals = {
//                 time: updates?.time,
//               };
//               // console.log(updateVals);

//               dispatch(
//                 updateTest({ id: selectedId, updates: updateVals })
//               ).then((resp) => {
//                 if (resp?.payload) {
//                   if (window) window.location.href = window.location.origin;
//                 }
//               });
//             }}
//           >
//             {SingleTest?._id ? "Update" : "Save"}
//           </Button>
//         </div>
//       ) : (
//         <div>
//           <Skeleton />
//         </div>
//       )}
//     </FormPage>
//   );
// };

// export default Page;

"use client";
import React, { useEffect, useState } from "react";

import timeStyles from "./styles/page.module.scss";
import Switch from "../access/utils/switch/switch";
import BTag from "../../utils/button";
import { useDispatch, useSelector } from "react-redux";
import { useParams, usePathname } from "next/navigation";
import {
  createTests,
  getOneTests,
  updateTest,
  updateTestValues,
} from "@/redux/slices/testportal_admin/slice/test";
import { updatingVals } from "@/redux/slices/testportal_admin/slice/stepform";
import { Button, Skeleton, TimePicker, DatePicker, message } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const Page = () => {
  const dispatch = useDispatch();
  const SingleTest = useSelector((state) => state.tests.test);
  const SingleTestStatus = useSelector(
    (state) => state.tests.singleTestStatus.status
  );

  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];

  const timeVals = useSelector((state) => state.steps.updatingVals);

  // State for test time duration
  const [testTime, setTestTime] = useState({});

  // State for test activation option type
  const [testActivationOption, setTestActivationOption] = useState("No expiry");

  // State for all date fields - separated for clarity
  const [manualExpiryDate, setManualExpiryDate] = useState("");
  const [testActivationDate, setTestActivationDate] = useState("");
  const [accessClosingDate, setAccessClosingDate] = useState("");

  const [isSwitchOn, setSwitch] = useState(false);

  // Initialize state from Redux when SingleTest loads
  useEffect(() => {
    if (SingleTest?._id) {
      // Set test time
      setTestTime(SingleTest?.time?.testDuration?.testDuration?.duration || {});

      // Set switch state
      setSwitch(SingleTest?.time?.skippingQuestions || false);

      // Determine test activation option type
      const activationOption = SingleTest?.time?.testActivationOption;

      if (typeof activationOption === "string") {
        setTestActivationOption(activationOption);
      } else if (
        activationOption?.testActivationMethod?.type ===
        "Activation in a set time period"
      ) {
        setTestActivationOption("Activation in a set time period");
        setTestActivationDate(
          activationOption?.testActivationMethod?.testActivationDate || ""
        );
        setAccessClosingDate(
          activationOption?.testActivationMethod?.accessClosingDate || ""
        );
      } else if (
        activationOption?.testActivationMethod?.type ===
        "Manual Test Activation"
      ) {
        setTestActivationOption("Manual Test Activation");
        setManualExpiryDate(
          activationOption?.testActivationMethod?.manualActivationDate ||
            SingleTest?.time?.expiryDates?.testExpirationData ||
            ""
        );
      }

      // Update Redux store with current values
      dispatch(updateTestValues(SingleTest?.time));
    }
  }, [SingleTest?._id]);

  // Handle test time change
  const handleTestTimeChange = (time, timeString) => {
    if (time) {
      const hours = time.hour().toString().padStart(2, "0");
      const minutes = time.minute().toString().padStart(2, "0");

      const updatedTestTime = {
        val1: hours,
        val2: minutes,
      };

      setTestTime(updatedTestTime);
    }
  };

  // Get test time value for TimePicker
  const getTestTimeValue = () => {
    if (testTime?.val1 && testTime?.val2) {
      const hour = testTime.val1.toString().replace(/\s/g, "").padStart(2, "0");
      const minute = testTime.val2
        .toString()
        .replace(/\s/g, "")
        .padStart(2, "0");
      return dayjs(`${hour}:${minute}`, "HH:mm");
    }
    return null;
  };

  // Handle manual expiry date change
  const handleManualExpiryDateChange = (date, dateString) => {
    const formattedDate = date ? date.format("YYYY-MM-DDTHH:mm") : "";
    setManualExpiryDate(formattedDate);
  };

  // Handle test activation date change
  const handleTestActivationDateChange = (date, dateString) => {
    const formattedDate = date ? date.format("YYYY-MM-DDTHH:mm") : "";
    setTestActivationDate(formattedDate);
  };

  // Handle access closing date change
  const handleAccessClosingDateChange = (date, dateString) => {
    const formattedDate = date ? date.format("YYYY-MM-DDTHH:mm") : "";
    setAccessClosingDate(formattedDate);
  };

  // Get date value for DatePicker
  const getDateValue = (dateString) => {
    if (dateString) {
      return dayjs(dateString, "YYYY-MM-DDTHH:mm");
    }
    return null;
  };

  // Handle update button click
  const handleUpdate = () => {
    // Create a clean copy of SingleTest
    const updates = JSON.parse(JSON.stringify(SingleTest));
    delete updates._id;

    // Initialize time object
    updates.time = updates.time || {};

    // Build testActivationOption based on current selection
    if (testActivationOption === "No expiry") {
      updates.time.testActivationOption = "No expiry";
      updates.time.expiryDates = { expiry: false };
    } else if (testActivationOption === "Manual Test Activation") {
      updates.time.testActivationOption = {
        testActivationMethod: {
          type: "Manual Test Activation",
          manualActivationDate: manualExpiryDate,
        },
      };
      updates.time.expiryDates = {
        expiry: true,
        testExpirationData: manualExpiryDate,
      };
    } else if (testActivationOption === "Activation in a set time period") {
      updates.time.testActivationOption = {
        testActivationMethod: {
          type: "Activation in a set time period",
          testActivationDate: testActivationDate,
          accessClosingDate: accessClosingDate,
        },
      };
      updates.time.expiryDates = {
        expiry: true,
        testActivationDate: testActivationDate,
        accessClosingDate: accessClosingDate,
      };
    }

    // Clean and set test duration
    const cleanedTestTime = {
      val1: testTime.val1?.toString().replace(/\s/g, ""),
      val2: testTime.val2?.toString().replace(/\s/g, ""),
    };

    updates.time.testDuration = {
      testDuration: {
        label: "Time to complete the test (HH : MM)",
        duration: cleanedTestTime,
      },
    };

    // Set skipping questions
    updates.time.skippingQuestions = isSwitchOn;

    const updateVals = {
      time: updates.time,
    };

    // Dispatch update action
    dispatch(updateTest({ id: selectedId, updates: updateVals })).then(
      (resp) => {
        if (resp?.payload) {
          // Show success message instead of redirecting
          message.success("Time settings updated successfully");
        }
      }
    );
  };

  return (
    <>
      {SingleTestStatus === "fulfilled" ? (
        <div className={timeStyles.container}>
          {/* Test Duration Section */}
          <div className={timeStyles.respTitle}>Test Duration*</div>

          <div className={timeStyles.option}>
            <label htmlFor="option1">
              Time to complete the test (HH : MM) :{" "}
            </label>

            <TimePicker
              format="HH:mm"
              value={getTestTimeValue()}
              onChange={handleTestTimeChange}
              placeholder="Select time"
              className={timeStyles.timeCons}
              style={{ width: "20%" }}
              showNow={false}
              hideDisabledOptions
              needConfirm={false}
            />
          </div>

          {/* Test Activation Method Section */}
          <div className={timeStyles.respTitle}>Test Activation Method</div>

          <div className={timeStyles.expiryComp}>
            {/* No Expiry Option */}
            <div>
              <input
                type="radio"
                id="now"
                name="expiry"
                value="No expiry"
                checked={testActivationOption === "No expiry"}
                onChange={() => {
                  setTestActivationOption("No expiry");
                }}
              />
              <label htmlFor="now">No expiry</label>
            </div>

            {/* Manual Test Activation Option */}
            <div className={timeStyles.manualtest_div}>
              <div>
                <input
                  type="radio"
                  id="later"
                  name="expiry"
                  value="Manual Test Activation"
                  checked={testActivationOption === "Manual Test Activation"}
                  onChange={() => {
                    setTestActivationOption("Manual Test Activation");
                  }}
                />
                <label htmlFor="later">Manual Test Expiration</label>
              </div>

              {testActivationOption === "Manual Test Activation" && (
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  value={getDateValue(manualExpiryDate)}
                  onChange={handleManualExpiryDateChange}
                  className={timeStyles.inp}
                  style={{ width: "30%" }}
                  placeholder="Select date and time"
                  needConfirm={false}
                />
              )}
            </div>
          </div>

          {/* Activation in a Set Time Period Option */}
          <label className={timeStyles.timePeriod}>
            <input
              type="radio"
              id="TimePeriod"
              name="expiry"
              value="Activation in a set time period"
              checked={
                testActivationOption === "Activation in a set time period"
              }
              onChange={() => {
                setTestActivationOption("Activation in a set time period");
              }}
            />
            Activation in a set time period
          </label>

          {testActivationOption === "Activation in a set time period" && (
            <div className={timeStyles.startEnd}>
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>Test activation date</div>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  value={getDateValue(testActivationDate)}
                  onChange={handleTestActivationDateChange}
                  style={{ width: "100%" }}
                  placeholder="Select date and time"
                  needConfirm={false}
                />
              </div>

              <div
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>Access closing date</div>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  value={getDateValue(accessClosingDate)}
                  onChange={handleAccessClosingDateChange}
                  style={{ width: "100%" }}
                  placeholder="Select date and time"
                  needConfirm={false}
                />
              </div>
            </div>
          )}

          {/* Update/Save Button */}
          <Button type="default" onClick={handleUpdate}>
            {SingleTest?._id ? "Update" : "Save"}
          </Button>
        </div>
      ) : (
        <div>
          <Skeleton />
        </div>
      )}
    </>
  );
};

export default Page;
