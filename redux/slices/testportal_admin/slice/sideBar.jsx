import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createQuestion } from "./questions";
import { message } from "antd";

const SideTitlesSlice = new createSlice({
  name: "stepForm",
  initialState: {
    name: "",
    collapse: false,
  },
  reducers: {
    setCurrentTitle: (state, { payload }) => {
      state.name = payload;
    },
    changeCollapse: (state, { payload }) => {
      state.collapse = payload;
    },
  },
});

export const createBulkQuestionsParallel = createAsyncThunk(
  "/createBulkQuestionsParallel",
  async (args, { dispatch, rejectWithValue }) => {
    const { questions, testId, testTitle } = args;

    try {
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error("Questions array is required and must not be empty");
      }

      message.loading({
        content: `Creating ${questions.length} questions...`,
        key: "bulkCreate",
        duration: 0,
      });

      // Create all questions simultaneously
      const promises = questions.map((question, index) => {
        const questionData = {
          ...question,
          testId,
          testTitle,
        };

        return dispatch(createQuestion(questionData))
          .unwrap()
          .then((response) => ({
            success: true,
            index,
            data: response,
          }))
          .catch((error) => ({
            success: false,
            index,
            question:
              question.questionContent?.question || `Question ${index + 1}`,
            error: error.message || "Unknown error",
          }));
      });

      const results = await Promise.all(promises);

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      message.destroy("bulkCreate");

      if (failed.length === 0) {
        message.success(
          `All ${successful.length} questions created successfully!`
        );
      } else if (successful.length === 0) {
        message.error("All questions failed to create");
      } else {
        message.warning(
          `Created ${successful.length} questions, ${failed.length} failed`
        );
      }

      return {
        successful,
        failed,
        totalProcessed: results.length,
      };
    } catch (error) {
      message.destroy("bulkCreate");
      message.error(error.message || "Failed to create bulk questions");
      return rejectWithValue(error.message);
    }
  }
);

export const { setCurrentTitle, changeCollapse } = SideTitlesSlice.actions;

export default SideTitlesSlice.reducer;
