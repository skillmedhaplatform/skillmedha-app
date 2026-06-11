import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { message } from "antd";
import { v4 as uuid } from "uuid";
import { getOneTests } from "./test";
import { allQuestions, singleQuestion } from "@/graphql_quries/questions";
import { gqlUrl } from "@/config/urls";
// import { updateObject } from "../utils/updateNestedObjs";

// TODO ---- minimize the action payload for value updates

const updateObject = (keyNames, value, object) => {
  if (!Array.isArray(keyNames)) return object;

  const [currentKey, ...remainingKeys] = keyNames;

  if (remainingKeys.length === 0) {
    return { ...object, [currentKey]: value };
  }

  return {
    ...object,
    [currentKey]: updateObject(object[currentKey], remainingKeys, value),
  };
};

const QuestionSlice = createSlice({
  name: "Questions",
  initialState: {
    value: [],
    question: {},
    status: "",
    error: "",
    bulkEdit: {},
    selectedQuestionType: "multiple",
    filteredQuestions: [],
    searchquestions: {
      status: "",
      value: [],
    },
    allQuestions: {
      status: "pending",
    },
    newQuestion: {
      status: "pending",
      value: {},
      error: null,
    },
    saveCompQuestionVal: {
      status: "pending",
      value: {},
      error: null,
    },
    getCompQuestionVal: {
      status: "pending",
      value: {},
      error: null,
    },
    updateQuestionVal: {
      status: "pending",
      value: {},
      error: null,
    },
    addQuestionCompQuestionVal: {
      status: "pending",
      value: {},
      error: null,
    },
    questionVals: {
      questionCategory: [],
      questionType: "multiple",
      status: "pending",
    },
    compQuestions: {
      _id: "newcomp-" + uuid().split("-").join(""),
      questionContentArr: [
        {
          _id: "newques-" + uuid().split("-").join(""),
        },
      ],
    },

    QuestionsLength: {
      status: "pending",
      value: {},
      error: null,
    },

    resources: {},
  },
  reducers: {
    questionResource: (state, { payload }) => {
      state.resources = payload;
    },
    filteredQues: (state, { payload }) => {
      state.filteredQuestions = payload;
    },
    clearTestVals: (state, action) => {
      state.question = {};
    },
    selectQuestion: (state, action) => {
      state.Edit[action.payload.questionId] = action.payload.status;
    },
    clearSelectQuestions: (state, { payload }) => {
      state.bulkEdit = {};
    },
    setQuestionType: (state, action) => {
      state.selectedQuestionType = action.payload;
    },
    resetQuestion: (state, action) => {
      state.question = {};
      state.questionVals = {
        questionType: "singleChoice",
      };
    },
    setQuestionVals: (state, { payload }) => {
      const data = { ...payload };
      delete data.err;

      // console.log(data);

      state.questionVals = data;
      // state.questionVals = updateObject(payload.keysArr, payload.value, {
      //   ...state.questionVals,
      // });
    },
    updateCategory: (state, action) => {
      if (state.questionVals.questionCategory) {
        state.questionVals.questionCategory = [
          ...state.questionVals.questionCategory,
          action.payload,
        ];
      }
      state.questionVals.questionCategory = [action.payload];
    },
    addCompQuestion: (state, { payload }) => {
      const data = { ...payload };
      delete data.err;
      state.compQuestions = {
        ...data,
      };
    },
    addQuestionToQuestionComs: (state, { payload }) => {
      const data = { ...payload };
      delete data.err;
      const { _id } = data;
      if (!_id) {
        state.compQuestions.questionContentArr.push({
          ...data,
          _id: payload.quesId,
        });
      } else {
        const checkQues = state.compQuestions.questionContentArr.findIndex(
          (e) => e._id == _id
        );
        if (checkQues !== -1) {
          state.compQuestions.questionContentArr =
            state.compQuestions.questionContentArr.map((e) => {
              if (e._id == _id) {
                return data;
              }
              return e;
            });
        } else {
          state.compQuestions.questionContentArr.push(data);
        }
      }
      state.compQuestions.updateNo += 1;
    },
    deleteCompQues: (state, { payload }) => {
      state.compQuestions.questionContentArr =
        state.compQuestions.questionContentArr.filter(
          (e) => e._id !== payload.questionId
        );
      state.compQuestions.updateNo += 1;
    },
    addtemplateQues: (state, action) => {
      state.compQuestions.questionContentArr.push({
        _id: uuid().split("-").join(""),
      });
    },
    clearsearchQuestions: (state, action) => {
      state.searchquestions.value = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(allQues.pending, (state, action) => {
      state.allQuestions.status = "pending";
    });
    builder.addCase(allQues.fulfilled, (state, action) => {
      state.allQuestions.status = "fulfilled";
      state.value = action.payload;
    });
    builder.addCase(allQues.rejected, (state, action) => {
      state.allQuestions.status = "rejected";
      state.value = null;
    });
    builder.addCase(getOneQues.pending, (state) => {
      state.questionVals.status = "pending";
    });
    builder.addCase(getOneQues.fulfilled, (state, action) => {
      state.question = action.payload;
      state.questionVals = action.payload;
      if (!action.payload) {
        // Prevent redirecting user if payload is falsy
        console.warn("Question not found or API returned null");
      }
      state.questionVals.status = "fulfilled";
    });
    builder.addCase(deleteQuestion.pending, (state, action) => {
      // state.question = action.payload;
    });
    builder.addCase(deleteQuestion.fulfilled, (state, action) => {
      message.info(action.payload.msg);
    });
    builder.addCase(deleteQuestion.rejected, (state, action) => {
      // message.error(action.error)
    });
    builder.addCase(createQuestion.pending, (state, action) => {
      // state.question = action.payload;
      state.newQuestion.status = "pending";
      state.newQuestion.value = {};
      state.newQuestion.error = null;
    });
    builder.addCase(createQuestion.fulfilled, (state, action) => {
      // message.info(action.payload.message)

      state.newQuestion.status = "fulfilled";
      state.newQuestion.value = action.payload;
      state.questionVals = action.payload;
      state.newQuestion.error = null;
    });
    builder.addCase(createQuestion.rejected, (state, action) => {
      // message.error(action.error)
      state.newQuestion.status = "rejected";
      state.newQuestion.value = {};
      state.newQuestion.error = action.error;
    });
    builder.addCase(updateQuestion.pending, (state, action) => {
      // state.question = action.payload;
      state.updateQuestionVal.status = "pending";
      state.updateQuestionVal.value = {};
      state.updateQuestionVal.error = null;
    });
    builder.addCase(updateQuestion.fulfilled, (state, action) => {
      // message.info(action.payload.message)
      console.log(action.payload);
      state.updateQuestionVal.status = "fulfilled";
      state.updateQuestionVal.value = action.payload;
      state.updateQuestionVal.error = null;
    });
    builder.addCase(updateQuestion.rejected, (state, action) => {
      // message.error(action.error)
      state.updateQuestionVal.status = "rejected";
      state.updateQuestionVal.value = {};
      state.updateQuestionVal.error = action.error;
    });
    builder.addCase(saveCompQuestion.pending, (state, action) => {
      // state.question = action.payload;
      state.saveCompQuestionVal.status = "pending";
      state.saveCompQuestionVal.value = {};
      state.saveCompQuestionVal.error = null;
    });
    builder.addCase(saveCompQuestion.fulfilled, (state, action) => {
      // message.info(action.payload.message)
      console.log(action.payload);
      state.saveCompQuestionVal.status = "fulfilled";
      state.saveCompQuestionVal.value = action.payload;
      state.saveCompQuestionVal.error = null;
    });
    builder.addCase(saveCompQuestion.rejected, (state, action) => {
      // message.error(action.error)
      state.saveCompQuestionVal.status = "rejected";
      state.saveCompQuestionVal.value = {};
      state.saveCompQuestionVal.error = action.error;
    });
    builder.addCase(getCompQuestion.pending, (state, action) => {
      // state.question = action.payload;
      state.getCompQuestionVal.status = "pending";
      state.getCompQuestionVal.value = {};
      state.getCompQuestionVal.error = null;
    });
    builder.addCase(getCompQuestion.fulfilled, (state, action) => {
      // message.info(action.payload.message)
      console.log(action.payload);
      state.getCompQuestionVal.status = "fulfilled";
      state.getCompQuestionVal.value = action.payload;
      state.getCompQuestionVal.error = null;
    });
    builder.addCase(getCompQuestion.rejected, (state, action) => {
      // message.error(action.error)
      state.getCompQuestionVal.status = "rejected";
      state.getCompQuestionVal.value = {};
      state.getCompQuestionVal.error = action.error;
    });
    builder.addCase(addQuestionCompQuestion.pending, (state, action) => {
      // state.question = action.payload;
      state.addQuestionCompQuestionVal.status = "pending";
      state.addQuestionCompQuestionVal.value = {};
      state.addQuestionCompQuestionVal.error = null;
    });
    builder.addCase(addQuestionCompQuestion.fulfilled, (state, action) => {
      // message.info(action.payload.message)
      console.log(action.payload);
      state.addQuestionCompQuestionVal.status = "fulfilled";
      state.addQuestionCompQuestionVal.value = action.payload;
      state.compQuestions.questionContentArr =
        state.compQuestions.questionContentArr.map((e) => {
          if (e._id == action.payload.oldId)
            e._id = action.payload.data.insertedId;
          return e;
        });
      state.addQuestionCompQuestionVal.error = null;
    });
    builder.addCase(addQuestionCompQuestion.rejected, (state, action) => {
      // message.error(action.error)
      state.addQuestionCompQuestionVal.status = "rejected";
      state.addQuestionCompQuestionVal.value = {};
      state.addQuestionCompQuestionVal.error = action.error;
    });
    builder.addCase(getQuestionsLength.pending, (state, action) => {
      state.QuestionsLength.status = "pending";
      state.QuestionsLength.value = {};
    });
    builder.addCase(getQuestionsLength.fulfilled, (state, action) => {
      state.QuestionsLength.status = "fulfilled";
      state.QuestionsLength.value = action.payload;
      state.QuestionsLength.error = null;
    });
    builder.addCase(getQuestionsLength.rejected, (state, action) => {
      state.QuestionsLength.status = "rejected";
      state.QuestionsLength.value = {};
      state.QuestionsLength.error = action.payload;
    });
    builder.addCase(searchQuestions.pending, (state, { payload }) => {
      state.searchquestions.status = "pending";
    });
    builder.addCase(searchQuestions.fulfilled, (state, { payload }) => {
      state.searchquestions.status = "fulfilled";
      state.filteredQuestions = payload;
    });
    builder.addCase(searchQuestionsForBank.pending, (state, { payload }) => {
      state.searchquestions.status = "pending";
    });
    builder.addCase(searchQuestionsForBank.fulfilled, (state, { payload }) => {
      state.searchquestions.value = payload;
      state.searchquestions.status = "fulfilled";
    });
  },
});

export const allQues = createAsyncThunk(
  "/allQues",
  async ({ cursor, limit, category, questionType }) => {
    const response = await axios.post(
      gqlUrl,
      {
        query: allQuestions,
        variables: {
          cursor: cursor,
          limit: limit,
          category: category,
          questionType: questionType,
        },
      },
      {
        headers: {
          Authorization: "Bearer ",
        },
      }
    );

    return response.data.data.questions;
  }
);

export const createQuestion = createAsyncThunk(
  "/createQuestion",
  async (args) => {
    try {
      if (
        ![
          "Multiple Choice",
          "Single Choice",
          "True - False",
          "Short Paragraph",
          "Audio Question",
          "Video Question",
        ].find((e) => e == args.questionType)
      )
        throw new Error("Question Type Must Be Provided");
      if (!args?.questionContent?.question)
        throw new Error("Question Field Cannot be Empty");
      if (!args.answer) {
        throw new Error("Answer must be provided");
      } else {
        if (args.answer.multipleChoice) {
          let pass = false;
          for (const val in args.answer.multipleChoice) {
            if (args.answer.multipleChoice[val]) pass = true;
          }
          if (!pass)
            throw new Error("Please select atleast one correct option");
        }
      }
      if (!args.scoreSettings) {
        throw new Error("Please Provide Score Settings");
      } else {
        if (args.scoreSettings.scoreType == "fullScore") {
          if (!args.scoreSettings.pointsForCorrectAns)
            throw new Error("Please provide points for correct answer");
        }
        if (args.scoreSettings.scoreType == "partialScore") {
          if (!args.scoreSettings.PointsForEachCorrectAnswer)
            throw new Error("Please provide partial points for correct answer");
        }
      }
      let questionScore = 0;
      if (args.scoreSettings.scoreType == "fullScore") {
        questionScore = args.scoreSettings.pointsForCorrectAns;
      }
      if (args.scoreSettings.scoreType == "partialScore") {
        if (args.questionType == "Multiple Choice") {
          const answersKeyArr = Object.keys(args.answer.multipleChoice).map(
            (e) => args.answer.multipleChoice[e]
          );
          questionScore =
            parseInt(args.scoreSettings.PointsForEachCorrectAnswer) *
            answersKeyArr.length;
        } else {
          questionScore = parseInt(
            args.scoreSettings.PointsForEachCorrectAnswer
          );
        }
        if (args.scoreSettings.bonusPointsForAllCorrect) {
          questionScore += parseInt(
            args.scoreSettings.bonusPointsForAllCorrect
          );
        }
      }
      let addQuestionUrl = testsUrl + "/addQuestion";
      if (args.testId) addQuestionUrl += "?testId=" + args.testId;
      const { data } = await axios.post(
        addQuestionUrl,
        {
          ...args,
          questionScore,
        },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      message.destroy();
      message.success(data.msg);
      return { ...data, testTitle: args.testTitle, testId: args.testId };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);
export const updateQuestion = createAsyncThunk(
  "/updateQuestion",
  async (args) => {
    const dispatch = args.dispatch;

    try {
      let questionScore = 0;
      if (
        ![
          "Multiple Choice",
          "Single Choice",
          "True - False",
          "Short Paragraph",
          "Audio Question",
          "Video Question",
        ].find((e) => e == args.questionType)
      )
        throw new Error("Question Type Must Be Provided");
      if (args.questionContent.question == '"<p><br></p>"')
        throw new Error("Question Field Cannot be Empty");
      if (!args.answer) {
        throw new Error("Answer must be provided");
      } else {
        if (args.answer.multipleChoice) {
          let pass = false;
          for (const val in args.answer.multipleChoice) {
            if (args.answer.multipleChoice[val]) pass = true;
          }
          if (!pass)
            throw new Error("Please select atleast one correct option");
        }
      }
      if (!args.scoreSettings) {
        throw new Error("Please Provide Score Settings");
      } else {
        if (args.scoreSettings.scoreType == "fullScore") {
          if (!args.scoreSettings.pointsForCorrectAns)
            throw new Error("Please provide points for correct answer");
        }
        if (args.scoreSettings.scoreType == "partialScore") {
          if (!args.scoreSettings.PointsForEachCorrectAnswer)
            throw new Error("Please provide partial points for correct answer");
        }
      }
      if (args.scoreSettings.scoreType == "fullScore") {
        questionScore = args.scoreSettings.pointsForCorrectAns;
      }
      if (args.scoreSettings.scoreType == "partialScore") {
        if (args.questionType == "Multiple Choice") {
          const answersKeyArr = Object.keys(args.answer.multipleChoice).map(
            (e) => args.answer.multipleChoice[e]
          );
          questionScore =
            parseInt(args.scoreSettings.PointsForEachCorrectAnswer) *
            answersKeyArr.length;
        } else {
          questionScore = parseInt(
            args.scoreSettings.PointsForEachCorrectAnswer
          );
        }
        if (args.scoreSettings.bonusPointsForAllCorrect) {
          questionScore += parseInt(
            args.scoreSettings.bonusPointsForAllCorrect
          );
        }
      }
      let payload = { ...args };
      delete payload._id;
      delete payload.testId;
      delete payload.testTitle;
      payload.questionScore = questionScore;

      const { data } = await axios.post(
        testsUrl + "/updateQuestion/" + args.questionId,
        payload,
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );

      message.success(data.msg);
      dispatch(getOneTests({ _id: args?.testId }));
      return { ...data, testTitle: args.testTitle, testId: args.testId };
    } catch (error) {
      console.log(error);
      message.error(error.message || "An unexpected error occurred.");
      throw error;
    }
  }
);

export const ChangeQuestionOrder = createAsyncThunk(
  "/ChangeQuestionOrder",
  async (args) => {
    try {
      const { data } = await axios.post(
        testsUrl + "/changeQuestionsOrder/" + args.testId,
        { questions: args?.questions },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );

      // message.success(data.msg)
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getOneQues = createAsyncThunk("/getOneQues", async (args) => {
  const { data } = await axios.post(gqlUrl, {
    query: singleQuestion,
    variables: { questionId: args._id },
  });
  return data.data.question;
});

export const deleteQuestion = createAsyncThunk(
  "/question/deletequestion",
  async (args) => {
    const { dispatch } = args;
    const questionIds = Object.keys(args.selectedQuestions);
    const deleteQuestionPromise = questionIds.map((e) => {
      if (args.selectedQuestions[e]) {
        return axios.post(
          StudentUrl + "/deleteQuestion/",
          {
            questionId: e,
          },
          { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
        );
      }
    });

    const data = await Promise.all(deleteQuestionPromise);
    let ctr = true;
    data.forEach((e) => {
      if (e.data.err) {
        ctr = false;
      }
    });
    if (ctr) {
      // args.dispatch(getOneQues());
      dispatch(allQues({ limit: 1000 }));
      args.setConfirmDeleteLoading(false);
      args.setOpenDeleteModal(false);

      return { msg: "question deleted" };
    } else {
      args.setConfirmDeleteLoading(false);
      args.setOpenDeleteModal(false);
      return { err: "Something went worng" };
    }
  }
);

export const saveCompQuestion = createAsyncThunk(
  "/addCompQues",
  async (args) => {
    const { data } = await axios.post(
      StudentUrl + "/createCompQuestion",
      args,
      { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
    );
    return data;
  }
);
export const updateCompQuestion = createAsyncThunk(
  "/updateCompQues",
  async (args) => {
    const { data } = await axios.post(
      StudentUrl + "/updateCompQuestion/" + args.compQuesId,
      args,
      { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
    );
    return data;
  }
);
export const deleteQuesCompQuestion = createAsyncThunk(
  "/updateCompQues",
  async (args) => {
    const { data } = await axios.post(
      StudentUrl + "/deleteQuestionFromComp/" + args.compQuesId,
      args,
      { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
    );
    return data;
  }
);
export const addQuestionCompQuestion = createAsyncThunk(
  "/addQuestionCompQues",
  async (payload) => {
    const args = { ...payload.questionDataVal };
    const oldId = payload.oldQuesId;
    // if (
    //   ![
    //     "Multiple Choice",
    //     "Single Choice",
    //     "True - False",
    //     "Short Paragraph",
    //   ].find((e) => e == args.questionType)
    // )
    //   throw new Error("Question Type Must Be Provided");
    // if (args.questionContent.question == '"<p><br></p>"')
    //   throw new Error("Question Field Cannot be Empty");
    // if (!args.answer) {
    //   throw new Error("Answer must be provided");
    // } else {
    //   if (args.answer.multipleChoice) {
    //     let pass = false;
    //     for (const val in args.answer.multipleChoice) {
    //       if (args.answer.multipleChoice[val]) pass = true;
    //     }
    //     if (!pass)
    //       throw new Error("Please select atleast one correct option");
    //   }
    // }
    // if (!args.scoreSettings) {
    //   throw new Error("Please Provide Score Settings");
    // } else {
    //   if (args.scoreSettings.scoreType == "fullScore") {
    //     if (!args.scoreSettings.pointsForCorrectAns)
    //       throw new Error("Please provide points for correct answer");
    //   }
    //   if (args.scoreSettings.scoreType == "partialScore") {
    //     if (!args.scoreSettings.PointsForEachCorrectAnswer)
    //       throw new Error("Please provide partial points for correct answer");
    //   }
    // }
    // let questionScore = 0;
    // if (args.scoreSettings.scoreType == "fullScore") {
    //   questionScore = args.scoreSettings.pointsForCorrectAns;
    // }
    // if (args.scoreSettings.scoreType == "partialScore") {
    //   if (args.questionType == "Multiple Choice") {
    //     const answersKeyArr = Object.keys(args.answer.multipleChoice).map(
    //       (e) => args.answer.multipleChoice[e]
    //     );
    //     questionScore =
    //       parseInt(args.scoreSettings.PointsForEachCorrectAnswer) *
    //       answersKeyArr.length;
    //   } else {
    //     questionScore = parseInt(
    //       args.scoreSettings.PointsForEachCorrectAnswer
    //     );
    //   }
    //   if (args.scoreSettings.bonusPointsForAllCorrect) {
    //     questionScore += parseInt(
    //       args.scoreSettings.bonusPointsForAllCorrect
    //     );
    //   }
    // }
    const { data } = await axios.post(
      StudentUrl + "/addQuestionToComprehension/" + payload.quesId,
      args,
      { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
    );
    return { data, oldId };
  }
);

export const getCompQuestion = createAsyncThunk(
  "/getCompQuestion",
  async (args) => {
    const { data } = await axios.post(gqlUrl, {
      query: singleQuestion,
      variables: {
        comprehensionQuestionId: args.comprehensionQuestionId,
      },
    });
    return data.data.ComprehensionQuestion;
  }
);

export const getQuestionsLength = createAsyncThunk(
  "/getQuestionsLength",
  async () => {
    const { data } = await axios.get(testsUrl + "/getQuestionLength", {
      headers: { Authorization: `Bearer ${getLstorage("token")}` },
    });
    return data;
  }
);

export const searchQuestions = createAsyncThunk(
  "/searchQuestions",
  async (args) => {
    try {
      const { data } = await axios.get(
        testsUrl + `/searchQuestion?text=${args.text}`,
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      if (!data.length) {
        message.error(<strong>Question not found</strong>);
      }

      return data;
    } catch (err) {
      console.log(err);
    }
  }
);
export const searchQuestionsForBank = createAsyncThunk(
  "/searchQuestionsforbank",
  async (args) => {
    try {
      const { data } = await axios.get(
        testsUrl + `/searchQuestion?text=${args.text}`,
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );

      return data;
    } catch (err) {
      console.log(err);
    }
  }
);

export const {
  clearQuestionsVals,
  selectQuestion,
  setQuestionType,
  resetQuestion,
  setQuestionVals,
  updateCategory,
  addCompQuestion,
  addQuestionToQuestionComs,
  deleteCompQues,
  addtemplateQues,
  filteredQues,
  clearSelectQuestions,
  clearsearchQuestions,
  questionResource,
} = QuestionSlice.actions;
export default QuestionSlice.reducer;
