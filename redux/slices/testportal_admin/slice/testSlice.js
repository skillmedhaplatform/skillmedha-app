import { getOneTest } from "@/modules/testportal_admin/graphql_quries/testQuery";
import { getLstorage, setSstorage } from "@/utils/universalUtils/windowMW";
import {gqlUrl } from "@/utils/universalUtils/urls";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import _ from "lodash";
import { v4 as uuid } from "uuid";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const testSlice = createSlice({
  name: "Test",
  initialState: {
    testData: {
      value: null,
      error: null,
      status: "pending",
    },
    responses: {
      value: {},
      error: null,
    },
    review: {
      value: [],
      error: null,
    },
    flagged: {
      value: [],
      error: null,
    },
  },
  reducers: {
    updateTimeTaken: (state, action) => {
      if (state.responses.value[action.payload.questionId]) {
        if (state.responses.value[action.payload.questionId].timeTaken)
          state.responses.value[action.payload.questionId].timeTaken += 1;
        else {
          state.responses.value[action.payload.questionId] = {};
          state.responses.value[action.payload.questionId].timeTaken = 1;
        }
      } else {
        state.responses.value[action.payload.questionId] = {};
        state.responses.value[action.payload.questionId].timeTaken = 1;
      }
      setSstorage("value", JSON.stringify(state.responses.value));
    },
    save_response: (state, action) => {
      let timeTaken = action.payload.timeTaken;
      // if (state.responses.value[action.payload.questionId]) {
      //   if (state.responses.value[action.payload.questionId].timeTaken)
      //     timeTaken =
      //       state.responses.value[action.payload.questionId].timeTaken;
      // }
      if (timeTaken) {
        state.responses.value[action.payload.questionId] = {
          ...state.responses.value[action.payload.questionId],
          timeTaken,
        };
      }
      if (action.payload.response?.length) {
        state.responses.value[action.payload.questionId] = {
          ...state.responses.value[action.payload.questionId],
          answers: action.payload.response,
          // timeTaken: action.payload.timeTaken
          //   ? action.payload.timeTaken
          //   : state.responses.value[action.payload.questionId]?.timeTaken,
        };
      }
      let status = "answered";
      if (!action.payload.response?.length) {
        state.responses.value[action.payload.questionId] = {
          ...state.responses.value[action.payload.questionId],
          answers: action.payload.response,

          // timeTaken: action.payload.timeTaken
          //   ? action.payload.timeTaken
          //   : state.responses.value[action.payload.questionId]?.timeTaken,
        };
        status = "not answered";
      }
      state.testData.value.questions = state.testData.value.questions.map(
        (e) => {
          if (e._id == action.payload.questionId) {
            if (e.status == "marked" && status == "answered")
              e.status = "markedAndAnswered";
            else if (e.status == "marked" && status == "not answered")
              e.status = "marked";
            else e.status = status;
          }
          return e;
        }
      );

      setSstorage("value", JSON.stringify(state.responses.value));
    },
    clear_response: (state, action) => {
      delete state.responses.value[action.payload.questionId];
      let status = "not answered";
      state.testData.value.questions = state.testData.value.questions.map(
        (e) => {
          if (e._id == action.payload.questionId) e.status = status;
          return e;
        }
      );
    },
    mark_for_review: (state, action) => {
      state.review.value.push(action.payload.questionId);
      state.review.value = _.uniq(state.review.value);
      let status = "marked";
      state.testData.value.questions = state.testData.value.questions.map(
        (e) => {
          if (e._id == action.payload.questionId) e.status = status;
          return e;
        }
      );

      setSstorage("marked", JSON.stringify(state.review.value));
    },

    flagQuestion: (state, { payload }) => {
      console.log("====================================");
      console.log(state.flagged);
      console.log("====================================");
      state.flagged.value.push(payload.questionId);
      state.flagged.value = _.uniq(state.flagged.value);
      let status = "flagged";
      state.testData.value.questions = state.testData.value.questions.map(
        (e) => {
          if (e._id == action.payload.questionId) e.status = status;
          return e;
        }
      );
      setSstorage("flagged", state.flagged.value);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSingleTest.pending, (state, action) => {
      state.testData.value = [];
      state.testData.error = null;
      state.testData.status = "pending";
    });
    builder.addCase(getSingleTest.fulfilled, (state, action) => {
      const testData = action.payload;

      testData.questions = testData?.questions?.reduce((acc, e) => {
        if (e?.questionType?.includes("Comprehension")) {
          if (e?.questionContentArr) {
            e.questionContentArr.forEach((content) => {
              if (content?._id) {
                acc.push({
                  ...content,
                  resource: e?.resources,
                  compText: e?.comprehensionText,
                  compType: e?.questionType,
                });
              }
            });
          }
        } else {
          acc.push(e);
        }
        return acc;
      }, []);

      // testData.questions = _.shuffle(testData.questions); -- for suffuling questions
      testData.questions = testData?.questions?.map((que) => {
        let options = Object.keys(que?.questionContent)
          .filter((e) => e.includes("option"))
          .map((e) => ({ [e]: que.questionContent[e] }))
          .sort((a, b) => {
            return Object.keys(a)[0].slice(-1) - Object.keys(b)[0].slice(-1);
          });
        // options = _.shuffle(options); //-- for shuffling options
        let questionContent = {
          question: que.questionContent.question,
          options,
        };
        return {
          ...que,
          questionContent,
        };
      });
      state.testData.value = testData;
      state.testData.error = null;
      state.testData.status = "fulfilled";
    });
    builder.addCase(getSingleTest.rejected, (state, action) => {
      state.testData.value = [];
      state.testData.error = action.error;
      state.testData.status = "rejected";
    });
  },
});

export const getSingleTest = createAsyncThunk("test/getOne", async (args) => {
  const { data } = await axios.post(
    gqlUrl,
    {
      query: getOneTest,
      variables: { testId: args._id },
    }
  ); 

  return data.data.test;
});

export const {
  save_response,
  clear_response,
  mark_for_review,
  flagQuestion,
  updateTimeTaken,
} = testSlice.actions;

export default testSlice.reducer;
