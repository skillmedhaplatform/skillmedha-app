import { comprehensionQuestionGql } from "@/modules/testportal_admin/graphql_quries/questions";
import { gqlUrl, testUrl as testsUrl } from "@/utils/universalUtils/urls";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import { getOneTests } from "./test";
import { getSstorage } from "@/utils/universalUtils/windowMW";

const ComprehensionQuestionSlice = createSlice({
  name: "ComprehensionQuestions",
  initialState: {
    comprehensionQuestion: {},
    comprehensionQuestions: [],
    comprehensionText: "",
    loading: false,
    saved: "",
    ComprehensionQueStatus: {
      status: "pending",
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      saveComprehensionQuestion.fulfilled,
      (state, { payload }) => {
        state.saved = true;
      }
    );
    builder.addCase(getOneComprehensionQuestion.pending, (state) => {
      state.comprehensionQuestion = null;
      state.ComprehensionQueStatus.status = "pending";
    });
    builder.addCase(
      getOneComprehensionQuestion.fulfilled,
      (state, { payload }) => {
        state.comprehensionQuestion = payload;
        state.ComprehensionQueStatus.status = "fulfilled";
      }
    );
  },
});

export const saveComprehensionQuestion = createAsyncThunk(
  "/createComprehensionQuestion",
  async (args) => {
    try {
      let newquestionType = "";
      const { testId, questionType } = args;

      if (questionType == "singleChoice") {
        newquestionType = "Single Choice";
      }
      if (questionType == "multipleChoice") {
        newquestionType = "Multiple Choice";
      }
      if (questionType == "trueFalse") {
        newquestionType = "True - False";
      }
      const { data } = await axios.post(
        testsUrl + "/createCompQuestion/" + testId,
        args
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getOneComprehensionQuestion = createAsyncThunk(
  "/getOneComprehension",
  async (args) => {
    try {
      const { id } = args;

      const { data } = await axios.post(gqlUrl, {
        query: comprehensionQuestionGql,
        variables: {
          comprehensionQuestionId: id,
        },
      });

      return data.data.ComprehensionQuestion;
    } catch (error) {
      console.log(error);
    }
  }
);

export const addQuestionComprehension = createAsyncThunk(
  "/addQuestionTOComprehension",
  async (args) => {
    try {
      const { data } = await axios.post(
        testsUrl + "/addQuestionToComprehension/" + args?.compId,
        {
          ...args,
        }
      );

      if (data?.msg == "Question Added Successfully")
        message.success("Question Added Successfully");
      else message.error("Failed to Add Question");

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const deleteQuestionComprehension = createAsyncThunk(
  "/deleteQuestionComprehension",
  async (args) => {
    const { dispatch, testId, ...details } = args;
    try {
      const { data } = await axios.post(
        testsUrl + "/deleteQuestionFromComp/" + args?.compId,
        {
          ...details,
        }
      );

      if (data?.msg == "Question deleted successfully") {
        message.success("Question deleted successfully");
        dispatch(getOneTests({ _id: args?.testId }));
      } else message.error("Failed to Delete Question");

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const updateComprehensionQues = createAsyncThunk(
  "/updateCompQuestion",
  async (args) => {
    const load = message.loading("Updating Comprehension Question");
    try {
      const { data } = await axios.post(
        testsUrl + "/updateCompQuestion/" + args.compId,
        { ...args.body }
      );

      if (data?.msg == "Comprehension updated successfully")
        message.success("Comprehension updated successfully");
      else message.error("Failed to update comprehension");
      load();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const deleteComprehensionQues = createAsyncThunk(
  "/deleteCompQuestion",
  async (args) => {
    const { dispatch } = args;
    const load = message.loading("Updating Comprehension Question");
    try {
      const { data } = await axios.post(
        testsUrl + "/deleteCompQuestion/" + args.compId,
        { testId: args.testId }
      );

      if (data?.msg == "Comprehension deleted successfully") {
        message.success("Comprehension deleted successfully");
        dispatch(getOneTests({ _id: args?.testId }));
      } else message.error("Failed to delete comprehension");
      load();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export default ComprehensionQuestionSlice.reducer;
