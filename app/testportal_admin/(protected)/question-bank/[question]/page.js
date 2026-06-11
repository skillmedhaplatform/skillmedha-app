"use client";

import React, { useEffect } from "react";
const Home = React.Fragment;
import { useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { getOneQues } from "@/redux/slices/testportal_admin/slice/questions";
import AddQuestionForm from "@/app/testportal_admin/(protected)/myTests/[test-slug]/components/childs/addQuestionForm";
import questionFormStyles from "./questionEditor.module.scss";
import { FaChevronRight } from "react-icons/fa";

export default function Page() {
  const dispatch = useDispatch();
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
        <h2 className={questionFormStyles.heading}>
          Question Bank <FaChevronRight />{" "}
          {questionId == "new-question" ? "Add Question" : "Update Question"}
        </h2>
        <AddQuestionForm />
      </div>
    </Home>
  );
}
