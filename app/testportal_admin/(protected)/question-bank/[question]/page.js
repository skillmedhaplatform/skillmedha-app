"use client";

import React, { useEffect } from "react";
const Home = React.Fragment;
import { useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { getOneQues } from "@/redux/slices/testportal_admin/slice/questions";
import AddQuestionForm from "@/app/testportal_admin/(protected)/myTests/[test-slug]/components/childs/addQuestionForm";
import questionFormStyles from "./questionEditor.module.scss";

export default function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { question: questionSlug } = useParams();
  
  const questionId = questionSlug?.includes("_id-")
    ? questionSlug.split("_id-")[1]
    : questionSlug;

  useEffect(() => {
    dispatch(getOneQues({ _id: questionId, dispatch }));
  }, [questionId, dispatch]);

  return (
    <Home>
      <div className={questionFormStyles.container}>
        <div className={questionFormStyles.breadcrumbPath}>
          <span 
            className={questionFormStyles.link}
            onClick={() => router.push("/testportal_admin/question-bank")}
          >
            Question Bank
          </span>
          <span className={questionFormStyles.separator}>/</span>
          <span className={questionFormStyles.current}>
            {questionId === "new-question" ? "Add Question" : "Update Question"}
          </span>
        </div>
        <AddQuestionForm />
      </div>
    </Home>
  );
}
