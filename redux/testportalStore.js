import { configureStore } from "@reduxjs/toolkit";
import TestsSlice from "./slices/testportal_admin/slice/test";
import StepFormSlice from "./slices/testportal_admin/slice/stepform";
import SideTitlesSlice from "./slices/testportal_admin/slice/sideBar";

import QuestionSlices from "./slices/testportal_admin/slice/questions";
import ChipSlice from "./slices/testportal_admin/slice/chipSlice";
import resultsDatabaseSlice from "./slices/testportal_admin/slice/resultsDatabase";

import studentSlice from "./slices/testportal_admin/slice/students";
import studentsSlice from "./slices/testportal_admin/slice/studentSlice";
import aiSlice from "./slices/testportal_admin/slice/aigenerated";
import ComprehensionQuestionSlice from "./slices/testportal_admin/slice/comprehensionQestions";
import testSlice from "./slices/testportal_admin/slice/testSlice";

export const testportalStore = configureStore({
  reducer: {
    tests: TestsSlice,
    steps: StepFormSlice,
    sideBar: SideTitlesSlice,
    questions: QuestionSlices,
    resultsDatabase: resultsDatabaseSlice,
    chipSlice: ChipSlice,
    students: studentSlice,
    ai: aiSlice,
    comprehension: ComprehensionQuestionSlice,
    Test: testSlice,
    Student: studentsSlice,
  },
});
