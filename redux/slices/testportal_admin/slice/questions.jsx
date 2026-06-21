import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import { message } from "antd";
import { allQuestions, singleQuestion } from "@/modules/testportal_admin/graphql_quries/questions";
import { v4 as uuid } from "uuid";
import { getOneTests } from "./test";
import {
  gqlUrl,
  restUrl,
  studentUrl,
  testUrl as testsUrl,
} from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
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
    error: null,
    uploadStatus: null,
    uploadResult: null,

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
      state.bulkEdit[action.payload.questionId] = action.payload.status;
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
    clearUploadStatus: (state) => {
      state.uploadStatus = null;
      state.uploadResult = null;
      state.error = null;
    },
    setQuestionVals: (state, { payload }) => {
      const data = { ...payload };
      delete data.err;
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
    builder
      // Bulk upload pending
      .addCase(bulkUploadQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadStatus = "uploading";
      })
      // Bulk upload fulfilled
      .addCase(bulkUploadQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadStatus = "success";
        state.uploadResult = action.payload;
        state.error = null;
      })
      // Bulk upload rejected
      .addCase(bulkUploadQuestions.rejected, (state, action) => {
        state.loading = false;
        state.uploadStatus = "error";
        state.error = action.payload;
      });
    builder
      // Bulk upload pending
      .addCase(bulkUploadQuestionstobank.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadStatus = "uploading";
      })
      // Bulk upload fulfilled
      .addCase(bulkUploadQuestionstobank.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadStatus = "success";
        state.uploadResult = action.payload;
        state.error = null;
      })
      // Bulk upload rejected
      .addCase(bulkUploadQuestionstobank.rejected, (state, action) => {
        state.loading = false;
        state.uploadStatus = "error";
        state.error = action.payload;
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
      }
    );

    return response?.data?.data?.questions || [];
  }
);

export const createQuestion = createAsyncThunk(
  "/createQuestion",
  async (args) => {
    const type = args?.type; // extract type

    try {
      // ✅ Validation section
      if (
        ![
          "Multiple Choice",
          "Single Choice",
          "True - False",
          "Short Paragraph",
          "Audio Question",
          "Video Question",
          "Coding Question",
        ].includes(args.questionType)
      ) {
        throw new Error("Question Type Must Be Provided");
      }

      if (!args?.questionContent?.question)
        throw new Error("Question Field Cannot be Empty");

      if (!args.answer) throw new Error("Answer must be provided");

      if (args.answer.multipleChoice) {
        const hasCorrectOption = Object.values(args.answer.multipleChoice).some(
          (v) => v
        );
        if (!hasCorrectOption)
          throw new Error("Please select at least one correct option");
      }

      if (!args.scoreSettings) throw new Error("Please Provide Score Settings");

      const { scoreSettings } = args;

      if (
        scoreSettings.scoreType === "fullScore" &&
        !scoreSettings.pointsForCorrectAns
      )
        throw new Error("Please provide points for correct answer");

      if (
        scoreSettings.scoreType === "partialScore" &&
        !scoreSettings.PointsForEachCorrectAnswer
      )
        throw new Error("Please provide partial points for correct answer");

      // ✅ Calculate question score
      let questionScore = 0;
      if (scoreSettings.scoreType === "fullScore") {
        questionScore = scoreSettings.pointsForCorrectAns;
      } else if (scoreSettings.scoreType === "partialScore") {
        if (args.questionType === "Multiple Choice") {
          const totalCorrect = Object.values(args.answer.multipleChoice).filter(
            Boolean
          ).length;
          questionScore =
            parseInt(scoreSettings.PointsForEachCorrectAnswer) * totalCorrect;
        } else {
          questionScore = parseInt(scoreSettings.PointsForEachCorrectAnswer);
        }

        if (scoreSettings.bonusPointsForAllCorrect) {
          questionScore += parseInt(scoreSettings.bonusPointsForAllCorrect);
        }
      }

      // ✅ Decide API endpoint based on `type`
      let addQuestionUrl;

      if (type === "bank") {
        addQuestionUrl = testsUrl + "/addBankQuestion"; // <-- change for bank type
      } else {
        addQuestionUrl = testsUrl + "/addQuestion";
      }

      // ✅ Append testId if present
      if (args.testId) addQuestionUrl += "?testId=" + args.testId;

      // ✅ API request
      const { data } = await axios.post(
        addQuestionUrl,
        {
          ...args,
          questionScore,
        }
      );

      message.destroy();
      message.success(data.msg);

      return { ...data, testTitle: args.testTitle, testId: args.testId };
    } catch (error) {
      console.error(error);
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
          "Coding Question",
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
        payload
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
        { questions: args?.questions }
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
        return axios.post(restUrl + "/assessments/deleteQuestion/", {
          questionId: e,
        });
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
      studentUrl + "/createCompQuestion",
      args
    );
    return data;
  }
);
export const updateCompQuestion = createAsyncThunk(
  "/updateCompQues",
  async (args) => {
    const { data } = await axios.post(
      studentUrl + "/updateCompQuestion/" + args.compQuesId,
      args
    );
    return data;
  }
);
export const deleteQuesCompQuestion = createAsyncThunk(
  "/updateCompQues",
  async (args) => {
    const { data } = await axios.post(
      studentUrl + "/deleteQuestionFromComp/" + args.compQuesId,
      args
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
      studentUrl + "/addQuestionToComprehension/" + payload.quesId,
      args
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
    const { data } = await axios.get(testsUrl + "/getQuestionLength");
    return data;
  }
);

export const searchQuestions = createAsyncThunk(
  "/searchQuestions",
  async (args) => {
    try {
      const { data } = await axios.get(
        testsUrl + `/searchQuestions?text=${args.text}`
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
        testsUrl + `/searchQuestions?text=${args.text}`
      );

      return data;
    } catch (err) {
      console.log(err);
    }
  }
);

export const bulkUploadQuestions = createAsyncThunk(
  "questions/bulkUpload",
  async ({ file, testId }, { rejectWithValue }) => {
    const hideLoading = message.loading("Uploading questions...", 0);

    try {
      const response = await axios.post(
        `${testsUrl}/bulkUploadQuestions/${testId}`,
        file
      );

      hideLoading();

      message.success({
        content: `${response.data.insertedCount} questions uploaded successfully!`,
        duration: 3,
      });

      if (response.data.skippedCount > 0) {
        message.warning({
          content: `${response.data.skippedCount} questions were skipped`,
          duration: 4,
        });
      }

      return response.data;
    } catch (error) {
      hideLoading();

      const errorMessage =
        error.response?.data?.err || error.message || "Upload failed";

      message.error({
        content: errorMessage,
        duration: 5,
      });

      return rejectWithValue(errorMessage);
    }
  }
);

export const bulkUploadQuestionstobank = createAsyncThunk(
  "questions/bulkUploadQuestionstobank",
  async ({ file }, { rejectWithValue }) => {
    const hideLoading = message.loading("Uploading questions...", 0);

    try {
      const response = await axios.post(
        `${testsUrl}/bulkUploadQuestionstobank`,
        file
      );

      hideLoading();

      message.success({
        content: `${response.data.insertedCount} questions uploaded successfully!`,
        duration: 3,
      });

      if (response.data.skippedCount > 0) {
        message.warning({
          content: `${response.data.skippedCount} questions were skipped`,
          duration: 4,
        });
      }

      return response.data;
    } catch (error) {
      hideLoading();

      const errorMessage =
        error.response?.data?.err || error.message || "Upload failed";

      message.error({
        content: errorMessage,
        duration: 5,
      });

      return rejectWithValue(errorMessage);
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
