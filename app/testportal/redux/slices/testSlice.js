import { getOneTest } from "@/app/testportal/graphQl/testQuery";
import { getLstorage, setSstorage } from "@/app/testportal/utils/storageMiddleware";
import { awsUrl, gqlUrl } from "@/app/testportal/utils/urls";
import axios from "axios";
import _ from "lodash";
import { v4 as uuid } from "uuid";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

// Helper function to handle shuffling logic
const processTestQuestions = (testData, testId) => {
  // Use a versioned key (_v2) so old globally-shuffled caches are automatically
  // ignored and a fresh per-category shuffle is applied on first load.
  const storageKey = `shuffled_questions_${testId}_v2`;
  const storedQuestions = sessionStorage.getItem(storageKey);

  // Respect test-level randomization setting (treat missing/null as enabled).
  const shouldRandomize = testData?.randomizeQuestions !== false;

  // Process questions (flatten comprehension questions)
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

  if (storedQuestions) {
    // Restore the per-category-shuffled order saved earlier in this session.
    const questionOrder = JSON.parse(storedQuestions);
    testData.questions = questionOrder
      .map((id) => testData.questions.find((q) => q._id === id))
      .filter(Boolean);
  } else if (shouldRandomize) {
    // Group questions by category, preserving the first-appearance order of
    // each category — only the questions *within* a category are shuffled.
    const categoryGroups = {};
    const categoryOrder = [];

    testData.questions.forEach((q) => {
      const catName = q.questionCategory?.[0]?.name || "Uncategorized";
      if (!categoryGroups[catName]) {
        categoryGroups[catName] = [];
        categoryOrder.push(catName);
      }
      categoryGroups[catName].push(q);
    });

    // Shuffle ONLY within each category, then join in original category order.
    testData.questions = categoryOrder.reduce((acc, catName) => {
      return [...acc, ..._.shuffle(categoryGroups[catName])];
    }, []);

    // Persist this shuffled order for the rest of the session.
    const questionIds = testData.questions.map((q) => q._id);
    sessionStorage.setItem(storageKey, JSON.stringify(questionIds));
  }
  // If !shouldRandomize: keep original server-returned order (no sessionStorage saved).

  // Process question content (options, etc.)
  testData.questions = testData?.questions?.map((que) => {
    let options = Object.keys(que?.questionContent)
      .filter((e) => e.includes("option"))
      .map((e) => ({ [e]: que.questionContent[e] }))
      .sort((a, b) => {
        return Object.keys(a)[0].slice(-1) - Object.keys(b)[0].slice(-1);
      });
    // options = _.shuffle(options); // Uncomment for shuffling options
    let questionContent = {
      question: que.questionContent.question,
      options,
      testCases: que?.questionContent?.testCases,
    };
    return {
      ...que,
      questionContent,
    };
  });

  return testData;
};

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
        };
      }
      let status = "answered";
      if (!action.payload.response?.length) {
        state.responses.value[action.payload.questionId] = {
          ...state.responses.value[action.payload.questionId],
          answers: action.payload.response,
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
      // console.log("====================================");
      // console.log(state.flagged);
      // console.log("====================================");
      state.flagged.value.push(payload.questionId);
      state.flagged.value = _.uniq(state.flagged.value);
      let status = "flagged";
      state.testData.value.questions = state.testData.value.questions.map(
        (e) => {
          if (e._id == payload.questionId) e.status = status;
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
      let testData = action.payload;
      // Process questions with shuffle logic
      testData = processTestQuestions(testData, testData._id);
      state.testData.value = testData;
      state.testData.error = null;
      state.testData.status = "fulfilled";
    });
    builder.addCase(getSingleTest.rejected, (state, action) => {
      state.testData.value = [];
      state.testData.error = action.error;
      state.testData.status = "rejected";
    });
    builder.addCase(getSingleJobTest.fulfilled, (state, action) => {
      let testData = action.payload;
      // Process questions with shuffle logic
      testData = processTestQuestions(testData, testData._id);
      state.testData.value = testData;
      state.testData.error = null;
      state.testData.status = "fulfilled";
    });
  },
});

export const getSingleTest = createAsyncThunk("test/getOne", async (args) => {
  const { data } = await axios.post(
    gqlUrl,
    {
      query: getOneTest,
      variables: { testId: args._id },
    },
    {
      headers: {
        Authorization: `Bearer ${getLstorage("token")}`,
      },
    }
  );

  return data.data.test;
});

export const getSingleJobTest = createAsyncThunk(
  "test/getOneJobTest",
  async (args) => {
    const { data } = await axios.get(
      `${awsUrl}/getoneassessmentfromstudent/${args?.testId}`,
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      }
    );
    return data.data;
  }
);

export const {
  save_response,
  clear_response,
  mark_for_review,
  flagQuestion,
  updateTimeTaken,
} = testSlice.actions;

export default testSlice.reducer;
