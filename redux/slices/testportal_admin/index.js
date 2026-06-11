import { configureStore } from "@reduxjs/toolkit";
import TestsSlice from "./slice/test";
import StepFormSlice from "./slice/stepform";
import SideTitlesSlice from "./slice/sideBar";

import QuestionSlices from "./slice/questions";
import ChipSlice from "./slice/chipSlice";
import resultsDatabaseSlice from "./slice/resultsDatabase";

import studentSlice from "./slice/students";
import studentsSlice from "./slice/studentSlice";
import aiSlice from "./slice/aigenerated";
import ComprehensionQuestionSlice from "./slice/comprehensionQestions";
import testSlice from "./slice/testSlice";

const store = configureStore({
  reducer: {
    tests: TestsSlice,
    steps: StepFormSlice,
    sideBar: SideTitlesSlice,
    questions: QuestionSlices,
    resultsDatabase: resultsDatabaseSlice,
    chipSlice: ChipSlice,
    // businessSlice,
    students: studentSlice,
    ai: aiSlice,
    comprehension: ComprehensionQuestionSlice,
    Test: testSlice,
    Student: studentsSlice,
  },
});
export default store;
