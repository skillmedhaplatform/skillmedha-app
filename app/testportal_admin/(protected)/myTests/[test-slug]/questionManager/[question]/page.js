"use client";

import React, { useEffect } from "react";

import QuestionForm from "../comps/questionForm";
import AddQuestionForm from "../../components/childs/addQuestionForm";
import { useDispatch } from "react-redux";
import { useParams, usePathname } from "next/navigation";
import { getOneQues } from "@/redux/slices/testportal_admin/slice/questions";
import ComprehensionQuestions from "../comprehensions/page";
import CodingQuestionForm from "../coding";

export default function Page() {
  const dispatch = useDispatch();
  const { question: questionId } = useParams();
  const params = useParams();

  const pathName = usePathname();

  // useEffect(() => {
  //   dispatch(getOneQues({ _id: questionId, dispatch }));
  // }, [questionId]);

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
  }, [effectiveId]);

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

  return <>{RenderComponent}</>;
}
