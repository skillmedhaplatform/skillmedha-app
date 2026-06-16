"use client";
import React, { useEffect, useState } from "react";
import startStyles from "./styles/page.module.scss";
import formStyles from "./styles/formPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Button, message } from "antd";
import {
  getOneJobAssessment,
  updateJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import TextEditor from "@/utils/universalUtils/editor";

const Page = () => {
  const dispatch = useDispatch();
  const route = useRouter();
  const params = useParams();

  const singleJobAssessment = useSelector(
    (s) => s.companySkillMedhaData?.singleJobAssessment
  );

  const ONEJOB = useSelector((state) => state.companyPlacements?.OneJob?.value);
  const aId = ONEJOB?.data?.AssessmentId;

  useEffect(() => {
    if (aId) {
      dispatch(getOneJobAssessment({ id: aId }));
    }
  }, [aId]);

  const [instructions, setInstructions] = useState("");
  const [consentForm, setConsentForm] = useState("");
  const [defaultItems, setDefaultItems] = useState([
    { label: "Full Name", value: "", requires: true },
    { label: "Email", value: "", requires: true },
    { label: "Phone Number", value: "", requires: true },
  ]);
  const [additionalItems, setAdditionalItems] = useState([]);

  useEffect(() => {
    if (singleJobAssessment && singleJobAssessment._id) {
      setInstructions(
        singleJobAssessment?.startPage?.intructions ||
          `<p><span style="background-color: transparent; color: rgb(67, 67, 67);">1. General Guidelines:</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Ensure a stable internet connection throughout the duration of the exam.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- The exam will automatically submit when the time expires, so manage your time wisely.</span></p><p><br></p><p><span style="background-color: transparent; color: rgb(67, 67, 67);">2. Technical Requirements:</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Use a compatible device such as a laptop or desktop with a reliable browser.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Keep your device fully charged or plugged in to avoid interruptions.</span></p><p><br></p><p><span style="background-color: transparent; color: rgb(67, 67, 67);">3. Exam Environment:</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Find a quiet, distraction-free environment to take the exam.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- You must be alone in the room; no other individuals should be present.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Use of external resources (e.g., books, notes, calculators, or any electronic devices) is strictly prohibited unless otherwise specified.</span></p><p><br></p><p><span style="background-color: transparent; color: rgb(67, 67, 67);">4. Answering Questions:</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Read all questions carefully before answering.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Once you submit an answer, you can return to that question.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Use the "Next" button to proceed to the next question and "Previous" to go back if allowed.</span></p><p><br></p><p><span style="background-color: transparent; color: rgb(67, 67, 67);">5. Scoring and Submission:</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Each question carries marks as indicated.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Ensure that all your answers are reviewed before the final submission.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Click the "Submit" button to complete the exam before the time runs out.</span></p><p><br></p><p><span style="background-color: transparent; color: rgb(67, 67, 67);">6. Exam Conduct:</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Any form of cheating, plagiarism, or dishonesty will result in disqualification.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- Do not attempt to copy, share, or distribute any exam content.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- The exam may be monitored through proctoring software, and any suspicious behaviour may be flagged.</span></p><p><br></p><p><span style="background-color: transparent; color: rgb(67, 67, 67);">7. Technical Assistance:</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- In case of any technical issues, contact the support team immediately using the provided contact details.</span></p><p><span style="background-color: transparent;">&nbsp;&nbsp;&nbsp;- If you are disconnected, attempt to log back in immediately. If the problem persists, contact support.</span></p>`
      );

      setConsentForm(
        singleJobAssessment.startPage?.consetForm ||
          `<p>By participating in this online examination, I hereby acknowledge and agree to comply with Examination Rules, Technology Requirements, Examination Environment and Academic Integrity.</p>`
      );

      if (singleJobAssessment?.startPage?.formRequirements) {
        const { formRequirements } = singleJobAssessment.startPage;
        setAdditionalItems(formRequirements.slice(3));
      }
    }
  }, [singleJobAssessment]);

  const handleDefaultInputChange = (index, event) => {
    const newDefaultItems = defaultItems.map((item, i) =>
      i === index ? { ...item, label: event.target.value } : item
    );
    setDefaultItems(newDefaultItems);
  };

  const handleAdditionalInputChange = (index, event) => {
    const newAdditionalItems = additionalItems.map((item, i) =>
      i === index ? { ...item, label: event.target.value } : item
    );
    setAdditionalItems(newAdditionalItems);
  };

  const handleDeleteItem = (index) => {
    setAdditionalItems(additionalItems.filter((_, i) => i !== index));
  };

  const handleMandatoryToggle = (index) => {
    setAdditionalItems(
      additionalItems.map((item, i) =>
        i === index ? { ...item, requires: !item.requires } : item
      )
    );
  };

  const renderDefaultItems = () => {
    return defaultItems.map((item, index) => (
      <div key={index} className={formStyles.itemContainer}>
        <input
          type="text"
          value={item.label}
          onChange={(e) => handleDefaultInputChange(index, e)}
          placeholder={item.label}
          readOnly
          className={formStyles.defaultinputs}
        />
        <div className={formStyles.manCon} style={{ display: "none" }}>
          <input type="checkbox" checked={true} readOnly />
          <label>Mandatory</label>
        </div>
      </div>
    ));
  };

  const renderAdditionalItems = () =>
    additionalItems.map((item, index) => (
      <div key={index} className={formStyles.itemContainer}>
        <input
          type="text"
          value={
            item.label ||
            singleJobAssessment?.startPage?.formRequirements[index + 3]?.label
          }
          onChange={(e) => handleAdditionalInputChange(index, e)}
          placeholder={item.label}
          className={formStyles.Addinputs}
        />
        <div className={formStyles.manCon}>
          <input
            type="checkbox"
            checked={
              item.requires ||
              singleJobAssessment?.startPage?.formRequirements[index + 3]
                ?.requires
            }
            onChange={() => handleMandatoryToggle(index)}
          />
          <label htmlFor={`checkbox-${index}`}>Mandatory</label>
          <img
            src="https://res.cloudinary.com/cliqtick/image/upload/v1718799083/sysnper/f29853d87e22f70d1cc10a3fcd7959c4_phnqgw.png"
            width="20px"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteItem(index)}
            alt="Delete"
          />
        </div>
      </div>
    ));

  const handleSave = async () => {
    try {
      const payload = {
        startPage: {
          ...singleJobAssessment?.startPage,
          formRequirements: [...defaultItems, ...additionalItems],
          intructions: instructions,
          consetForm: consentForm,
        },
      };

      if (singleJobAssessment && singleJobAssessment?._id) {
        // console.log(payload, aId, ONEJOB);
        await dispatch(updateJobAssessment({ ...payload, aId, dispatch }));
        // message.success("Test configuration saved successfully!");
      } else {
        message.error("No assessment found to update");
      }
    } catch (error) {
      console.error("Error saving test configuration:", error);
      message.error("Failed to save test configuration");
    }
  };

  return (
    <div className={startStyles.container}>
      <div className={startStyles.respTitle} style={{ color: "#25a3a6" }}>
        Instructions to Respondents
      </div>
      <div>
        Provide test instructions to be displayed to respondents on the test
        start page.
      </div>

      <div className={startStyles.ConsetComp}>
        <div className={startStyles.editorComp}>
          <TextEditor
            name="intructions"
            editorFun={(val) => setInstructions(val)}
            initialContent={{
              intructions: instructions,
            }}
          />
        </div>
      </div>

      <div className={startStyles.formComp}>
        <div className={startStyles.respTitle} style={{ color: "#25a3a6" }}>
          Test Start Form
        </div>
        <p>
          Configure test start form and collect data to identify respondents.
        </p>

        <div className={formStyles.addMoreContainer}>
          {renderDefaultItems()}
          {renderAdditionalItems()}
        </div>
      </div>

      <div className={startStyles.ConsetComp}>
        <span className={startStyles.respTitle} style={{ color: "#25a3a6" }}>
          Consent Form
        </span>
        <div className={startStyles.editorComp}>
          <TextEditor
            name="consetForm"
            editorFun={(val) => setConsentForm(val)}
            initialContent={{
              consetForm: consentForm,
            }}
          />
        </div>
      </div>

      <div className={startStyles.save} onClick={handleSave}>
        <Button type="primary">
          {singleJobAssessment?._id ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default Page;
