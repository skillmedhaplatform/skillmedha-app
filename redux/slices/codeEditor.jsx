import { languageOptions } from "@/universalUtils/codeEditorLanguages";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const CodeEditorSlice = createSlice({
  name: "CodeEditor",
  initialState: {
    output: "",
    inputVal: "",
    aiSuggestions: "",
    question: "",
    codeLang: languageOptions,
    testCaseResults: [],
    triggerRunTests: false,
  },
  reducers: {
    addOutput: (state, { payload }) => {
      state.output = payload;
    },
    addInput: (state, { payload }) => {
      state.inputVal = payload;
    },
    aiSuggestions: (state, { payload }) => {
      state.aiSuggestions = payload;
    },
    resetAiSuggestions: (state, { payload }) => {
      state.aiSuggestions = "";
    },
    setQuestion: (state, { payload }) => {
      state.question = payload;
    },
    resetOutput: (state) => {
      state.output = "";
    },
    filterLanguage: (state, { payload }) => {
      state.codeLang = payload;
    },
    setTestCaseResults: (state, { payload }) => {
      state.testCaseResults = payload;
    },
    resetTestCaseResults: (state) => {
      state.testCaseResults = [];
    },
    requestRunTests: (state) => {
      state.triggerRunTests = true;
    },
    clearRunTestsRequest: (state) => {
      state.triggerRunTests = false;
    },
  },
});

export const {
  addOutput,
  addInput,
  aiSuggestions,
  setQuestion,
  resetOutput,
  resetAiSuggestions,
  setTestCaseResults,
  resetTestCaseResults,
  requestRunTests,
  clearRunTestsRequest,
} = CodeEditorSlice.actions;

export default CodeEditorSlice.reducer;
