"use client";

import React, { useEffect } from "react";
const Home = React.Fragment;
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { allQues, clearSelectQuestions } from "@/redux/slices/testportal_admin/slice/questions";
import AllQuestionsComp from "@/modules/testportal_admin/components/reusable-comps/questionBank/allQuestionsComp";

export default function QuestionBank() {
  const allQuesTions = useSelector((state) => state.questions.value);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(clearSelectQuestions());
    dispatch(allQues({ limit: 1000 }));
  }, []);

  return (
    <Home>
      <AllQuestionsComp questions={allQuesTions} />
    </Home>
  );
}
