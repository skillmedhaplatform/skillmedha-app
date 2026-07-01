"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getOneQues } from "@/redux/slices/testportal_admin/slice/questions";
import AddQuestionForm from "../../components/childs/addQuestionForm";
import ComprehensionQuestions from "../comprehensions/page";
import CodingQuestionForm from "../coding";
import newQuestionFormStyles from "../comps/addQuestion.module.scss";

export default function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathName = usePathname();
  
  const { question: questionId } = useParams();
  const params = useParams();
  const testSlug = params["test-slug"];

  // Extract the last segment from pathname
  const lastSegment = pathName?.split("/").pop();
  
  // If lastSegment looks like "coding__<id>", extract the id
  const codingId = lastSegment?.startsWith("coding__")
    ? lastSegment.split("__")[1]
    : null;

  // Choose the right id (codingId has priority)
  const effectiveId = codingId || questionId;

  useEffect(() => {
    if (effectiveId) {
      dispatch(getOneQues({ _id: effectiveId }));
    }
  }, [effectiveId, dispatch]);

  let RenderComponent;
  switch (true) {
    case lastSegment === "new-comprehension-question":
    case lastSegment === `new-comprehension-question?qid=${questionId}`:
      RenderComponent = <ComprehensionQuestions />;
      break;

    case lastSegment === "new-coding-question":
    case lastSegment.split("__")[0] === "coding":
      RenderComponent = <CodingQuestionForm />;
      break;

    default:
      RenderComponent = <AddQuestionForm />;
  }

  const isNewQuestion = 
    questionId === "new-question" || 
    lastSegment === "new-coding-question" || 
    lastSegment === "new-comprehension-question";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", padding: "0.75rem 2rem 3rem 2rem", boxSizing: "border-box" }}>
      <div className={newQuestionFormStyles.breadcrumbPath}>
        <span 
          className={newQuestionFormStyles.link}
          onClick={() => router.push(`/testportal_admin/myTests/${testSlug}/questionManager`)}
        >
          Question Manager
        </span>
        <span className={newQuestionFormStyles.separator}>/</span>
        <span className={newQuestionFormStyles.current}>
          {isNewQuestion ? "Add Question" : "Update Question"}
        </span>
      </div>
      {RenderComponent}
    </div>
  );
}
