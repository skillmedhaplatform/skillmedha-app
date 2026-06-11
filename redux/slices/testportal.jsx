import { questionData } from "@/universalUtils/questionData";
import { aiUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import axios from "axios";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const TestPortalSlice = createSlice({
  name: "Portal",
  initialState: {
    questions: questionData,
    questionsData: {},
    currentQuestionId: null,
    userResponse: [],
    aiSuggestions: "",
  },
  reducers: {
    setQuestionsData: (state, action) => {
      state.questionsData = action.payload;
    },
    setNextQuestion: (state, action) => {
      state.currentQuestionId = action.payload;
    },
    findQuestion: (state, action) => {
      const questionId = action.payload;
      const foundQuestion = questions.find((q) => q?._id?.$oid === questionId);
      if (foundQuestion) {
        state.currentQuestionId = foundQuestion?._id?.$oid;
      } else {
        state.currentQuestionId = null;
      }
    },
    saveUserResponse: (state, action) => {
      const { questionId, userSelectedOption } = action.payload;
      console.log("payload", action.payload);

      const existingResponse = state.userResponse.find(
        (resp) => resp.questionId === questionId
      );

      if (existingResponse) {
        existingResponse.userSelectedOption = userSelectedOption;
      } else {
        state.userResponse.push({ ...action.payload });
      }
    },
    resetAisugg: (state, action) => {
      state.aiSuggestions = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postQuesToAi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postQuesToAi.fulfilled, (state, action) => {
        state.loading = false;
        state.aiSuggestions = action.payload;
      })
      .addCase(postQuesToAi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

const token = getLstorage("token");
export const postQuesToAi = createAsyncThunk(
  "ai/postQuesToAi",
  async (payload, { rejectWithValue }) => {
    try {
      const token = getLstorage("token");
      const res = await axios.post(aiUrl + "/generateExp", payload, {
        headers: {
          Authorization: `Bearer ` + token,
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const {
  setQuestionsData,
  setNextQuestion,
  findQuestion,
  saveUserResponse,
  resetAisugg,
} = TestPortalSlice.actions;

export default TestPortalSlice.reducer;
