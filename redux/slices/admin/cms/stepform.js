import { createSlice } from "@reduxjs/toolkit";

const StepFormSlice = createSlice({
  name: "stepForm",
  initialState: {
    name: "",
    value: {},
    updatingVals: {},
    status: "",
    error: "",
    questionManagerComp: "home",
  },
  reducers: {
    setCurrentForm: (state, { payload }) => {
      state.name = payload;
    },
    setFormValues: (state, { payload }) => {
      state.value = payload;
    },

    setQuestionVals: (state, { payload }) => {
      state.questionVals = payload;
    },
    updatingVals: (state, { payload }) => {
      state.updatingVals = payload;
    },
    setQuestionManagerComp: (state, action) => {
      state.questionManagerComp = action.payload;
    },
  },
});

export const {
  setCurrentForm,
  setFormValues,
  setQuestionVals,
  updatingVals,
  setQuestionManagerComp,
} = StepFormSlice.actions;

export default StepFormSlice.reducer;
