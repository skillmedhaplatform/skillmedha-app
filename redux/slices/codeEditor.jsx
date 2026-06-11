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
  },
});

export const {
  addOutput,
  addInput,
  aiSuggestions,
  setQuestion,
  resetOutput,
  resetAiSuggestions,
} = CodeEditorSlice.actions;

export default CodeEditorSlice.reducer;
