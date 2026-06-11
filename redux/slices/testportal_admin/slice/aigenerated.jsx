import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import { message } from "antd";
import { aiUrl } from "@/utils/universalUtils/urls";

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    generatedQuestions: {
      questions: [],
    },
    status: "",
    error: "",
    originalQuestions: "",
  },
  reducers: {
    updateQuestionContent: (state, action) => {
      const { index, key, newValue } = action.payload;
      state.generatedQuestions.questions[index].questionContent[key] = newValue;
    },
    cancelAiQues: (state, { payload }) => {
      console.log(state.originalQuestions);

      if (state.originalQuestions) {
        state.generatedQuestions = state.originalQuestions;
      }
    },
    setOriginalQuestions: (state, action) => {
      state.originalQuestions = action.payload;
    },
    deleteQuestionFromGenerated: (state, action) => {
      state.generatedQuestions.questions.splice(action.payload, 1);
    },
    clearGeneratedQuestions: (state, action) => {
      state.generatedQuestions.questions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuestions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(generateQuestions.fulfilled, (state, { payload }) => {
        function parseIfJson(text) {
          try {
            const trimmedText = text.trim();
            if (/^[{\[][\s\S]*[}\]]$/.test(trimmedText)) {
              return JSON.parse(trimmedText);
            }
            return text;
          } catch (e) {
            return text;
          }
        }
        state.generatedQuestions = parseIfJson(payload);
        state.status = "succeeded";
      })
      .addCase(generateQuestions.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      });
  },
});

export const generateQuestions = createAsyncThunk(
  "ai/generateQuestions",
  async (args, { rejectWithValue }) => {
    try {
      const load = message.loading("Generating questions using AI", 0);
      const { data } = await axios.post(
        `${aiUrl}/generateQuestionsfromText`,
        args
      );
      if (data?.data) {
        load();
        message.success("Questions generated successfully");
        return data?.data;
      }
      return rejectWithValue("Failed to generate questions");
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.message);
    }
  }
);

export const {
  updateQuestionContent,
  cancelAiQues,
  setOriginalQuestions,
  deleteQuestionFromGenerated,
  clearGeneratedQuestions,
} = aiSlice.actions;

export default aiSlice.reducer;
