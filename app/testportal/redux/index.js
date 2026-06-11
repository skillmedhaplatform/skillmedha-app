import { configureStore } from "@reduxjs/toolkit";
import studentSlice from "./slices/studentSlice";
import testSlice from "./slices/testSlice";
import codeEditorSlice from "./slices/codeEditor";

export default configureStore({
  reducer: {
    Student: studentSlice,
    Test: testSlice,
    codeEditor: codeEditorSlice,
  },
});
