"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import QuestionStyles from "../../styles/questions.module.scss";
import QuestionForm from "../../questionManager/comps/questionForm";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import { decryptObject } from "@/app/student/(protected)/tests/utils/encrytionMiddleware";
import { getSstorage } from "@/utils/universalUtils/windowMW";
import { useParams } from "next/navigation";
import { getOneQues, resetQuestion, setQuestionVals } from "@/redux/slices/testportal_admin/slice/questions";
import ChipInput from "@/utils/universalUtils/chipInput/chip";
import NewQuestionForm from "../../questionManager/comps/newQuestionForm";
const AddQuestionForm = () => {
  const selectedTitle = useSelector((state) => state.steps.name);

  const values = useSelector((state) => state.questions.questionVals);

  const dispatch = useDispatch();
  const SingleQuestion = useSelector((state) => state.questions.question);
  const { question: questionId } = useParams();
 
  useEffect(() => {
    if (questionId !== "new-question") {
      dispatch(getOneQues({ _id: questionId }));
    } else {
      dispatch(resetQuestion());
    }
  }, []);

  const selectTypeComps = [
    {
      name: "Multiple Choice",
      comp: <QuestionForm />,
      code: "multiple",
    },
    {
      name: "Single Choice",
      comp: <QuestionForm />,
      code: "single",
    },
    {
      name: "Short Paragraph",
      comp: <QuestionForm />,
      code: "para",
    },
    {
      name: "True - False",
      comp: <QuestionForm />,
      code: "tf",
    },
  ];

  return (
    <div className={QuestionStyles.addQueCon}>
      {/* <div className={QuestionStyles.categoryCon}>
        <div className={QuestionStyles.Title}>Category</div>
        <div className={QuestionStyles.categoryConRig}>
         <ChipInput
            type="question"
            name="questionCategory"
            phVal="Enter category value and press enter"
            onChange={(name, chips) =>
              setFormValues({ ...values, [name]: chips })
            }
            initialChips={SingleQuestion && SingleQuestion.questionCategory || []}
          />
        </div>
      </div>*/}

      {/* <div className={QuestionStyles.categoryCon}>
        <div className={QuestionStyles.Title}>Type</div>
        <div className={QuestionStyles.categoryConRig}>
          <select
            id="category"
            onChange={(e) =>
              dispatch(
                setQuestionVals({
                  ...values,
                  questionType: e.target.value,
                  questionContent: {},
                })
              )
            }
            className={QuestionStyles.form__field__select}
          >
            <option>Select a Type</option>
            {selectTypeComps.map((type, index) => (
              <option key={index}  selected={SingleQuestion?.questionType == type.name ? "selected": ""} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>  */}
      {/* <QuestionForm SingleQuestion={SingleQuestion} /> */}
      <NewQuestionForm SingleQuestion={SingleQuestion}/>
    </div>
  );
};

export default AddQuestionForm;