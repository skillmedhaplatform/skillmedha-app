"use client";
import React, { useEffect, useState, useRef } from "react";
import startStyles from "./styles/page.module.scss";
import formStyles from "./styles/formPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { updateTest, updateTestValues } from "@/redux/slices/testportal_admin/slice/test";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import { 
  MessageOutlined, 
  FileTextOutlined, 
  PlusOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined,
  FormOutlined
} from "@ant-design/icons";
import { message } from "antd";
import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";

const Page = () => {
  const SingleTest = useSelector((state) => state.tests.test);
  const singletestStatus = useSelector((state) => state.tests.singleTestStatus?.status);
  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const startPageVals = useSelector((state) => state.steps.updatingVals);

  const dispatch = useDispatch();
  const router = useRouter();

  const [defaultItems, setDefaultItems] = useState([
    { label: "Full Name", value: "", requires: true },
    { label: "Email", value: "", requires: true },
    { label: "Phone Number", value: "", requires: true },
  ]);

  const [additionalItems, setAdditionalItems] = useState([]);

  const prevDefaultItemsRef = useRef();
  const prevAdditionalItemsRef = useRef();

  useEffect(() => { 
    dispatch(
      updateTestValues({
        formRequirements: [...defaultItems, ...additionalItems],
      })
    );
  }, []);

  useEffect(() => {
    if (SingleTest?.startPage?.formRequirements) {
      const { formRequirements } = SingleTest.startPage;
      if (formRequirements.length >= 3) {
        setDefaultItems(formRequirements.slice(0, 3));
        setAdditionalItems(formRequirements.slice(3));
      } else {
        setDefaultItems(formRequirements);
      }
    }
  }, [SingleTest]);

  useEffect(() => {
    const prevDefaultItems = prevDefaultItemsRef.current;
    const prevAdditionalItems = prevAdditionalItemsRef.current;

    if (
      JSON.stringify(prevDefaultItems) !== JSON.stringify(defaultItems) ||
      JSON.stringify(prevAdditionalItems) !== JSON.stringify(additionalItems)
    ) {
      dispatch(
        updateTestValues({
          startPage: {
            ...SingleTest?.startPage,
            formRequirements: [...defaultItems, ...additionalItems],
          },
        })
      );
    }

    prevDefaultItemsRef.current = defaultItems;
    prevAdditionalItemsRef.current = additionalItems;
  }, [defaultItems, additionalItems, dispatch, startPageVals]);

  const handleAdditionalInputChange = (index, event) => {
    const newAdditionalItems = additionalItems.map((item, i) =>
      i === index ? { ...item, label: event.target.value } : item
    );
    setAdditionalItems(newAdditionalItems);
  };

  const handleAddMoreClick = (e) => {
    e.preventDefault();
    setAdditionalItems([
      ...additionalItems,
      { label: "New Field", value: "", requires: false },
    ]);
  };

  const handleDeleteItem = (index, type) => {
    if (type === "default") {
      setDefaultItems(defaultItems.filter((_, i) => i !== index));
    } else {
      setAdditionalItems(additionalItems.filter((_, i) => i !== index));
    }
  };

  const handleMandatoryToggle = (index) => {
    setAdditionalItems(
      additionalItems.map((item, i) =>
        i === index ? { ...item, requires: !item.requires } : item
      )
    );
  };

  const getDefaultIcon = (label) => {
    const norm = label.toLowerCase();
    if (norm.includes("name")) return <UserOutlined />;
    if (norm.includes("email")) return <MailOutlined />;
    if (norm.includes("phone") || norm.includes("tel") || norm.includes("number")) return <PhoneOutlined />;
    return <UserOutlined />;
  };

  const getDefaultMeta = (label) => {
    const norm = label.toLowerCase();
    if (norm.includes("name")) return "Text field · Required";
    if (norm.includes("email")) return "Email field · Required";
    if (norm.includes("phone") || norm.includes("tel") || norm.includes("number")) return "Tel field · Required";
    return "Text field · Required";
  };

  const sendEditorVals = (val, name) => {
    dispatch(
      updateTestValues({
        startPage: {
          ...SingleTest.startPage,
          [name]: val,
        },
      })
    );
  };

  const renderDefaultItems = () => {
    return defaultItems.map((item, index) => (
      <div key={`default-${index}`} className={formStyles.itemContainer}>
        <div className={formStyles.itemLeft}>
          <div className={formStyles.iconWrapper}>
            {getDefaultIcon(item.label)}
          </div>
          <div className={formStyles.infoWrapper}>
            <p className={formStyles.fieldLabel}>{item.label}</p>
            <span className={formStyles.fieldMeta}>{getDefaultMeta(item.label)}</span>
          </div>
        </div>
        <div className={formStyles.itemRight}>
          <button 
            type="button" 
            className={formStyles.trashBtn} 
            onClick={() => handleDeleteItem(index, "default")}
          >
            <DeleteOutlined />
          </button>
        </div>
      </div>
    ));
  };

  const renderAdditionalItems = () =>
    additionalItems.map((item, index) => (
      <div key={`additional-${index}`} className={formStyles.itemContainer}>
        <div className={formStyles.itemLeft}>
          <div className={formStyles.iconWrapper}>
            <FileTextOutlined />
          </div>
          <div className={formStyles.infoWrapper}>
            <input
              type="text"
              value={item.label}
              onChange={(e) => handleAdditionalInputChange(index, e)}
              placeholder="Field Label"
              className={formStyles.fieldLabelInput}
            />
          </div>
        </div>
        <div className={formStyles.itemRight}>
          <div className={formStyles.mandatoryCheckbox}>
            <input
              id={`checkbox-${index}`}
              type="checkbox"
              checked={item.requires}
              onChange={() => handleMandatoryToggle(index)}
            />
            <label htmlFor={`checkbox-${index}`}>Required</label>
          </div>
          <button 
            type="button" 
            className={formStyles.trashBtn} 
            onClick={() => handleDeleteItem(index, "additional")}
          >
            <DeleteOutlined />
          </button>
        </div>
      </div>
    ));

  return (
    <>
      {singletestStatus === "pending" ? (
        <QuestionSkeleton />
      ) : (
        <div className={startStyles.container}>
          {/* Card 1: Instructions to Respondents */}
          <div className={startStyles.cardSection}>
            <div className={startStyles.sectionHeader}>
              <div className={startStyles.headerLeft}>
                <MessageOutlined className={startStyles.sectionIcon} />
                <h3>Instructions to Respondents</h3>
              </div>
            </div>
            <p className={startStyles.description}>
              Provide test instructions to be displayed to respondents on the test start page.
            </p>
            <div className={startStyles.editorWrapper}>
              <TextEditor
                name="intructions"
                editorFun={(val) => sendEditorVals(val, "intructions")}
                initialContent={{
                  intructions:
                    SingleTest?.startPage?.intructions ||
                    '"<h3><span style=\\"color: rgb(67, 67, 67); background-color: transparent;\\">1. General Guidelines:</span></h3><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Ensure a stable internet connection throughout the duration of the exam.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- The exam will automatically submit when the time expires, so manage your time wisely.</span></p><p><br></p><h3><span style=\\"color: rgb(67, 67, 67); background-color: transparent;\\">2. Technical Requirements:</span></h3><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Use a compatible device such as a laptop or desktop with a reliable browser.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Keep your device fully charged or plugged in to avoid interruptions.</span></p><p><br></p><h3><span style=\\"color: rgb(67, 67, 67); background-color: transparent;\\">3. Exam Environment:</span></h3><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Find a quiet, distraction-free environment to take the exam.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- You must be alone in the room; no other individuals should be present.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Use of external resources (e.g., books, notes, calculators, or any electronic devices) is strictly prohibited unless otherwise specified.</span></p><p><br></p><h3><span style=\\"color: rgb(67, 67, 67); background-color: transparent;\\">4. Answering Questions:</span></h3><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Read all questions carefully before answering.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Once you submit an answer, you can return to that question.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Use the “Next” button to proceed to the next question and “Previous” to go back if allowed.</span></p><p><br></p><h3><span style=\\"color: rgb(67, 67, 67); background-color: transparent;\\">5. Scoring and Submission:</span></h3><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Each question carries marks as indicated.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Ensure that all your answers are reviewed before the final submission.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Click the “Submit” button to complete the exam before the time runs out.</span></p><p><br></p><h3><span style=\\"color: rgb(67, 67, 67); background-color: transparent;\\">6. Exam Conduct:</span></h3><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Any form of cheating, plagiarism, or dishonesty will result in disqualification.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- Do not attempt to copy, share, or distribute any exam content.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- The exam may be monitored through proctoring software, and any suspicious behaviour may be flagged.</span></p><p><br></p><h3><span style=\\"color: rgb(67, 67, 67); background-color: transparent;\\">7. Technical Assistance:</span></h3><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- In case of any technical issues, contact the support team immediately using the provided contact details.</span></p><p><span style=\\"background-color: transparent;\\">&nbsp;&nbsp;&nbsp;- If you are disconnected, attempt to log back in immediately. If the problem persists, contact support.</span></p>"',
                }}
              />
            </div>
          </div>

          {/* Card 2: Test Start Form */}
          <div className={startStyles.cardSection}>
            <div className={startStyles.sectionHeader}>
              <div className={startStyles.headerLeft}>
                <FormOutlined className={startStyles.sectionIcon} />
                <h3>Test Start Form</h3>
              </div>
              <div className={startStyles.headerRight}>
                <button className={startStyles.headerAddBtn} onClick={handleAddMoreClick}>
                  <PlusOutlined /> Add More
                </button>
              </div>
            </div>
            <p className={startStyles.description}>
              Configure fields to collect respondent data before the test begins.
            </p>
            <div className={formStyles.addMoreContainer}>
              {renderDefaultItems()}
              {renderAdditionalItems()}
            </div>
          </div>

          {/* Card 3: Consent Form */}
          <div className={startStyles.cardSection}>
            <div className={startStyles.sectionHeader}>
              <div className={startStyles.headerLeft}>
                <FileTextOutlined className={startStyles.sectionIcon} />
                <h3>Consent Form</h3>
              </div>
            </div>
            <p className={startStyles.description}>
              This text will appear as a checkbox agreement on the test start page.
            </p>
            <div className={startStyles.editorWrapper}>
              <TextEditor
                name="consetForm"
                editorFun={(val) => sendEditorVals(val, "consetForm")}
                initialContent={{
                  consetForm:
                    SingleTest?.startPage?.consetForm ||
                    '"<p>By participating in this online examination, I hereby acknowledge and agree to comply with Examination Rules, Technology Requirements, Examination Environment and Academic Integrity.</p>"',
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className={startStyles.formActions}>
            <button
              className={startStyles.saveBtn}
              onClick={() => {
                const updates = { ...SingleTest };
                delete updates._id;

                const updateVals = {
                  startPage: {
                    ...updates?.startPage,
                    consetForm:
                      SingleTest?.startPage?.consetForm ||
                      '"<p>By participating in this online examination, I hereby acknowledge and agree to comply with Examination Rules, Technology Requirements, Examination Environment and Academic Integrity.</p>"',
                  },
                };

                dispatch(updateTest({ id: selectedId, updates: updateVals })).then((res) => {
                  if (res?.payload) {
                    message.success("Start Page settings updated successfully");
                  }
                });
              }}
            >
              Update
            </button>
            <button 
              className={startStyles.discardBtn} 
              onClick={() => router.push("/testportal_admin/myTests")}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
