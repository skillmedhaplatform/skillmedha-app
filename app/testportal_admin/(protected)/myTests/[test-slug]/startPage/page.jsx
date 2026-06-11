"use client";
import React, { useEffect, useState } from "react";

import startStyles from "./styles/page.module.scss";
import AddMoreComponent from "./comps/formPage";
import BTag from "../../utils/button";
import { useDispatch, useSelector } from "react-redux";
import {
  getOneTests,
  updateTest,
  updateTestValues,
} from "@/redux/slices/testportal_admin/slice/test";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import { useParams, usePathname, useRouter } from "next/navigation";

const Page = () => {
  const SingleTest = useSelector((state) => state.tests.test);
  const values = useSelector((state) => state.steps.value);
  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const startPageVals = useSelector((state) => state.steps.updatingVals);
  const formRequirements = startPageVals?.startPage?.formRequirements || [];

  const dispatch = useDispatch();
  const nav = useRouter();
  // const updateTestsAccess = (val) => {
  //   if (SingleTest?._id) {
  //     const updatingBody = {
  //       startPage: {
  //         intructions: values?.intructions,
  //         consetForm: values?.consetForm,
  //         testStartForm: formRequirements,
  //       },
  //     };
  //     dispatch(updateTest({ id: selectedId, updates: updatingBody }));
  //   } else {
  //     // dispatch(setCurrentForm(nextForm))
  //     // dispatch(createTests(values))
  //   }
  // };
  const sendEditorVals = (val, name) => {
    dispatch(
      updateTestValues({
        startPage: {
          ...SingleTest.startPage,
          [name]: val,
        },
      })
    );
    // dispatch(setFormValues({ ...values, [name]: val }));
  };

  return (
    <div className={startStyles.container}>
        <div className={startStyles.respTitle}>Instructions to Respondents</div>
        <div>
          Provide test instructions to be displayed to respondents on the test
          start page.
        </div>

        <div className={startStyles.ConsetComp}>
          <div className={startStyles.editorComp}>
            {/* <EditorComp name="intructions" /> */}
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

        <div className={startStyles.formComp}>
          <div className={startStyles.respTitle}>Test Start Form</div>
          <p>
            Configure test start form and collect data to identify respondents.
          </p>
          <AddMoreComponent />
          {/* <div className={formStyles.addMoreContainer}>
            {defaultForms.map((item,index) => {
              return (
                <div key={index} className={formStyles.itemContainer}>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleDefaultInputChange(item,e.target.value)}
                    placeholder={item.label}
                    className={formStyles.defaultinputs}
                  />
                  <div className={formStyles.manCon}>
                    <img
                      src="https://res.cloudinary.com/cliqtick/image/upload/v1718799083/sysnper/f29853d87e22f70d1cc10a3fcd7959c4_phnqgw.png"
                      width="20px"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDeleteItem(item)}
                    />
                  </div>
                </div>
              );
            })}
            <button onClick={addMoreItem}>Add More</button>
          </div> */}
        </div>

        <div className={startStyles.ConsetComp}>
          {/* conset to consent form changed */}
          <span className={startStyles.respTitle}>Consent Form</span>
          <div className={startStyles.editorComp}>
            {/* <EditorComp name="consetForm" /> */}
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

        <div
          className={startStyles.save}
          onClick={() => {
            const updates = { ...SingleTest };
            delete updates._id;

            const updateVals = {
              startPage: {
                ...updates?.startPage,
                consetForm:
                  updates.startPage.consetForm ||
                  '"<p>By participating in this online examination, I hereby acknowledge and agree to comply with Examination Rules, Technology Requirements, Examination Environment and Academic Integrity.</p>"',
              },
            };

            dispatch(updateTest({ id: selectedId, updates: updateVals }));
          }}
        >
          <BTag>{SingleTest?._id ? "Update" : "Save"}</BTag>
        </div>
      </div>
  );
};

export default Page;
