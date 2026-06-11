import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import { AllTests, getOneTest } from "@/modules/testportal_admin/graphql_quries/testSeries";
import _ from "lodash";
import { message } from "antd";
import {
  getLstorage,
  getSstorage,
  setSstorage,
} from "@/utils/universalUtils/windowMW";
import {
  gqlUrl,
  restUrl,
  testUrl as testsUrl,
} from "@/utils/universalUtils/urls";
import { getAllCategories } from "@/modules/testportal_admin/graphql_quries/category";

const TestsSlice = createSlice({
  name: "Tests",
  initialState: {
    value: [],
    test: {},
    status: "",
    error: "",
    getAllTestStatus: {
      status: "pending",
    },
    singleTestStatus: {
      status: "",
      error: null,
    },
    newTest: {
      value: {},
      error: null,
      status: "",
    },
    category: {
      value: {},
      error: null,
      status: "",
    },
    addLanguage: {
      value: {},
      error: null,
      status: "",
    },
    testCategories: {
      value: [],
      error: null,
      status: "",
    },
    addQuestionToTest: {
      value: [],
      error: null,
      status: "",
    },
    removeQuestionFromTest: {
      value: [],
      error: null,
      status: "",
    },
    DeleteTest: {
      value: null,
      error: null,
      status: "",
    },
    UserDetails: {
      value: {},
      status: "idle",
      error: null,
    },
    bulkEmail: {
      value: null,
      status: "idle",
      error: null,
      summary: null,
      successful: [],
      failed: [],
    },
  },
  reducers: {
    clearTestVals: (state, action) => {
      state.test = {};
    },
    updateTestValues: (state, action) => {
      state.test = { ...state.test, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTests.pending, (state, { payload }) => {
      state.getAllTestStatus.status = "pending";
    });
    builder.addCase(getTests.fulfilled, (state, { payload }) => {
      const withPrev = [...state.value, ...payload];
      state.value = _.uniqBy(withPrev, "_id");
      state.getAllTestStatus.status = "fulfilled";
    });
    builder.addCase(getOneTests.pending, (state, action) => {
      state.singleTestStatus.status = "pending";
    });
    builder.addCase(getOneTests.fulfilled, (state, action) => {
      state.singleTestStatus.status = "fulfilled";
      state.test = action.payload;
      if (!state.test) state.test = {};
      if (action.payload?.err) {
        state.test = {};
        message.error(action.payload?.err);
      }
      if (state.test) {
        if (!state.test.access) {
          state.test.access = {};
          state.test.access.attemptsPerRespondent = 1;
        } else if (!state.test.access.attemptsPerRespondent)
          state.test.access.attemptsPerRespondent = 1;
        if (!state.test.startPage) {
          state.test.startPage = {};
          state.test.startPage.formRequirements = [
            { label: "Full Name", value: "", requires: true },
            { label: "Email", value: "", requires: true },
            { label: "Phone Number", value: "", requires: true },
          ];
        } else if (!state.test.startPage.formRequirements)
          state.test.startPage.formRequirements = [
            { label: "Full Name", value: "", requires: true },
            { label: "Email", value: "", requires: true },
            { label: "Phone Number", value: "", requires: true },
          ];
      }
    });
    builder.addCase(getOneTests.rejected, (state, action) => {
      state.singleTestStatus.status = "rejected";
      state.singleTestStatus.error = action.error;
    });
    builder.addCase(createTests.pending, (state, action) => {
      state.newTest.status = "pending";
      state.newTest.error = null;
    });
    builder.addCase(createTests.fulfilled, (state, action) => {
      state.newTest.status = "fulfilled";
      state.newTest.error = null;
      state.newTest.value = action.payload;
    });
    builder.addCase(createTests.rejected, (state, action) => {
      state.newTest.status = "rejected";
      state.newTest.error = action.error;
    });
    builder.addCase(addCategory.pending, (state, action) => {
      state.category.status = "pending";
      state.category.error = null;
    });
    builder.addCase(addCategory.fulfilled, (state, action) => {
      state.category.status = "fulfilled";
      state.category.error = null;
      state.category.value = action.payload;
    });
    builder.addCase(addCategory.rejected, (state, action) => {
      state.category.status = "rejected";
      state.category.error = action.error;
      message.error(action.error.message);
    });
    builder.addCase(addLanguage.pending, (state, action) => {
      state.addLanguage.status = "pending";
      state.addLanguage.error = null;
    });
    builder.addCase(addLanguage.fulfilled, (state, action) => {
      state.addLanguage.status = "fulfilled";
      state.addLanguage.error = null;
      state.addLanguage.value = action.payload;
    });
    builder.addCase(addLanguage.rejected, (state, action) => {
      state.addLanguage.status = "rejected";
      state.addLanguage.error = action.error;
      message.error(action.error.message);
    });
    builder.addCase(getTestCategories.pending, (state, action) => {
      state.testCategories.status = "pending";
      state.testCategories.error = null;
    });
    builder.addCase(getTestCategories.fulfilled, (state, action) => {
      state.testCategories.status = "fulfilled";
      state.testCategories.error = null;
      state.testCategories.value = action.payload;
    });
    builder.addCase(getTestCategories.rejected, (state, action) => {
      state.testCategories.status = "rejected";
      state.testCategories.error = action.error;
      message.error(action.error.message);
    });
    builder.addCase(addQuestionToTest.pending, (state, action) => {
      state.addQuestionToTest.status = "pending";
      state.addQuestionToTest.error = null;
    });
    builder.addCase(addQuestionToTest.fulfilled, (state, action) => {
      state.addQuestionToTest.status = "fulfilled";
      state.addQuestionToTest.error = null;
      state.addQuestionToTest.value = action.payload;
    });
    builder.addCase(addQuestionToTest.rejected, (state, action) => {
      state.addQuestionToTest.status = "rejected";
      state.addQuestionToTest.error = action.error;
      message.error(action.error.message);
    });
    builder.addCase(removeQuestionFromTest.pending, (state, action) => {
      state.removeQuestionFromTest.status = "pending";
      state.removeQuestionFromTest.error = null;
    });
    builder.addCase(removeQuestionFromTest.fulfilled, (state, action) => {
      state.removeQuestionFromTest.status = "fulfilled";
      state.removeQuestionFromTest.error = null;
      state.removeQuestionFromTest.value = action.payload;
    });
    builder.addCase(removeQuestionFromTest.rejected, (state, action) => {
      state.removeQuestionFromTest.status = "rejected";
      state.removeQuestionFromTest.error = action.error;
      message.error(action.error.message);
    });
    builder.addCase(DeleteTest.pending, (state, action) => {
      state.DeleteTest.status = "pending";
      state.DeleteTest.error = null;
    });
    builder.addCase(DeleteTest.fulfilled, (state, action) => {
      state.DeleteTest.status = "fulfilled";
      state.DeleteTest.value = action.payload;
      state.DeleteTest.error = null;
    });
    builder
      .addCase(DeleteTest.rejected, (state, action) => {
        state.DeleteTest.status = "rejected";
        state.DeleteTest.error = action.error;
      })
      .addCase(GetOneUser.pending, (state) => {
        state.UserDetails.status = "pending";
        state.UserDetails.error = null;
      })
      .addCase(GetOneUser.fulfilled, (state, { payload }) => {
        state.UserDetails.status = "fulfilled";
        state.UserDetails.value = payload;
      })
      .addCase(GetOneUser.rejected, (state, { error }) => {
        state.UserDetails.status = "rejected";
        state.UserDetails.error = error.message;
      });
    builder
      .addCase(SendBulkEmailMail.pending, (state) => {
        state.bulkEmail.status = "pending";
        state.bulkEmail.error = null;
      })
      .addCase(SendBulkEmailMail.fulfilled, (state, { payload }) => {
        state.bulkEmail.status = "fulfilled";
        state.bulkEmail.value = payload;
        state.bulkEmail.summary = payload.summary;
        state.bulkEmail.successful = payload.successful;
        state.bulkEmail.failed = payload.failed;
        state.bulkEmail.error = null;
      })
      .addCase(SendBulkEmailMail.rejected, (state, { error, payload }) => {
        state.bulkEmail.status = "rejected";
        state.bulkEmail.error = payload?.err || error.message;
        state.bulkEmail.value = null;
      });
  },
});

export const GetOneUser = createAsyncThunk("/getOneUser", async (args) => {
  try {
    const { data } = await axios.get(`${restUrl}/getTpo`);
    return data;
  } catch (error) {
    console.log("Failed to fetch TPO profile, using token fallback:", error);
    const token = getLstorage("token");
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        if (decoded && decoded.userName) {
          return {
            data: {
              userName: decoded.userName,
              email: decoded.email,
              role: decoded.role,
              orgId: decoded.orgId
            }
          };
        }
      } catch (e) {
        console.error("Failed to decode token fallback:", e);
      }
    }
    throw error;
  }
});

export const getTests = createAsyncThunk("/getAllTests", async (args) => {
    const response = await axios.post(
    gqlUrl,
    {
      query: AllTests,
      variables: {
        cursor: args.cursor,
        limit: args.limit,
        category: args.category,
        language: args.language,
        status: args.status,
      },
    }
  );
  if (!response?.data?.data?.tests?.tests) args?.nav?.replace("/");
  return response?.data?.data?.tests?.tests || [];
});

export const createTests = createAsyncThunk(
  "/createTests",
  async ({ values }) => {
    try {
      const { data } = await axios.post(
        testsUrl + "/addTest",
        {
          ...values,
          status: "inprogress",
        }
      );
      // encryptObject(({object:data, key:data?.id,name:"selectedTest"}))
      setSstorage("testId", data?.id);
      setSstorage("testTitle", "new test");
      if (data.msg) {
        message.success(data.msg);
        if (window) {
          window.location.href =
            window.location.origin +
            "/myTests/" +
            values.title +
            "_id-" +
            data.id +
            "/questionManager";
        }
      } else {
        message.error(data.err);
      }
      return data;
    } catch (error) {
      message.error(error.message);
      console.log(error);
    }
  }
);

export const getOneTests = createAsyncThunk("/getOneTests", async (args) => {
  if (args?._id) {
    const { data } = await axios.post(gqlUrl, {
      query: getOneTest,
      variables: { testId: args._id },
    });
    //  encryptObject(({object:data.data?.test, key:data.data?.test?._id,name:"selectedTest"}))
    setSstorage("testId", data.data?.test?._id);
    setSstorage("testTitle", data.data?.test?.title);
    return data.data.test;
  }
});

export const updateTest = createAsyncThunk("/updateTest", async (args) => {
  try {
    const { data } = await axios.post(
      testsUrl + "/updateTest/" + args?.id,
      args?.updates
    );
    message.success(data.msg);
    return data;
  } catch (error) {
    message.error(error.message);
  }
});

// sendTestAccessMail
export const SendEmailMail = createAsyncThunk(
  "/sendTestAccessMail",
  async (args) => {
    try {
      const { data } = await axios.post(
        testsUrl + "/sendTestAccessMail",
        {
          mailOptions: args?.updates,
        }
      );
    } catch (error) {
      message.error(error.message);
    }
  }
);

// Add this async thunk after your other thunks (after SendEmailMail)
export const SendBulkEmailMail = createAsyncThunk(
  "/sendBulkTestAccessMail",
  async (args, { rejectWithValue }) => {
    const hideLoading = message.loading("Sending bulk emails...");
    try {
      const { data } = await axios.post(
        testsUrl + "/sendBulkTestAccessMail",
        {
          studentIds: args.studentIds,
          mailTemplate: args.mailTemplate,
          batchSize: args.batchSize || 10,
        }
      );
      hideLoading();

      if (data.msg) {
        message.success(
          `${data.summary.successful}/${data.summary.total} emails sent successfully`
        );
      }

      if (data.summary.failed > 0) {
        message.warning(`${data.summary.failed} emails failed to send`);
      }

      return data;
    } catch (error) {
      hideLoading();
      message.error(error.message);
      return rejectWithValue({ err: error.message });
    }
  }
);

export const DeleteTest = createAsyncThunk(
  "/DeleteTest",
  async ({ test, dispatch }) => {
    const hideLoading = message.loading(`Deleting ${test?.title}`);
    try {
      const { data } = await axios.post(
        testsUrl + "/deleteTest/" + test?._id,
        {}
      );
      hideLoading();
      message.success(`${test?.title} Test Deleted Sucsessfully`);
      dispatch(getTests({ cursor: null, limit: 100 }));
      return data;
    } catch (error) {
      message.error(error.message);
    }
  }
);

export const addCategory = createAsyncThunk("/addCategory", async (args) => {
  const { data } = await axios.post(
    testsUrl + "/addCategory",
    {
      name: args.name,
      type: args.type,
    }
  );
  if (data.err) throw new Error(data.err);
  if (Array.isArray(args.values[args.key]))
    args.dispatch(
      args.setFormValues({
        ...args.values,
        [args.key]: [...args.values[args.key], data.id],
      })
    );
  else
    args.dispatch(
      args.setFormValues({ ...args.values, [args.key]: [data.id] })
    );

  return data.data;
});

export const addLanguage = createAsyncThunk("/addLanguage", async (args) => {
  const { data } = await axios.post(testsUrl + "/addLanguage", {
    name: args.name,
    type: args.type,
  });
  if (data.err) throw new Error(data.err);
  if (Array.isArray(args.values[args.key]))
    args.dispatch(
      args.setFormValues({
        ...args.values,
        [args.key]: [...args.values[args.key], data.id],
      })
    );
  else
    args.dispatch(
      args.setFormValues({ ...args.values, [args.key]: [data.id] })
    );

  return data.data;
});

export const getTestCategories = createAsyncThunk(
  "/gettestcategories",
  async () => {
    const { data } = await axios.post(gqlUrl, {
      query: getAllCategories,
      variables: {
        type: "test",
      },
    });
    return data.data.category;
  }
);

export const addQuestionToTest = createAsyncThunk(
  "/addQuestionToTest",
  async (args) => {
    if (!args.testId) {
      return { err: "Select Test Id" };
    }

    const questionIds = Object.keys(args.selectedQuestions);
    const addQuestionPromises = [];

    if (Array.isArray(args.testId)) {
      args.testId.forEach((testId) => {
        questionIds.forEach((questionId) => {
          if (args.selectedQuestions[questionId]) {
            addQuestionPromises.push(
              axios.post(`${testsUrl}/addQuestionToTest/${testId}`, {
                questionId,
              })
            );
          }
        });
      });
    } else {
      questionIds.forEach((questionId) => {
        if (args.selectedQuestions[questionId]) {
          addQuestionPromises.push(
            axios.post(`${testsUrl}/addQuestionToTest/${args.testId}`, {
              questionId,
            })
          );
        }
      });
    }

    const data = await Promise.all(addQuestionPromises);

    if (data && data[0]?.data?.msg == "question already added to this test")
      message.warning("Question already added to this test");
    let ctr = true;
    data.forEach((e) => {
      if (e?.data?.data?.err) {
        ctr = false;
      }
    });
    if (ctr && data && data[0]?.data?.msg == "Question Added to test") {
      if (!Array.isArray(args.testId)) {
        args.dispatch(getOneTests({ _id: args.testId }));
      }
      message.success("question added successfully");
      return { msg: "question added successfully" };
    } else {
      return { err: "Something went wrong" };
    }
  }
);

export const removeQuestionFromTest = createAsyncThunk(
  "/removeQuestionFromTest",
  async (args) => {
    if (!args.testId) {
      args.setConfirmDeleteLoading(false);
      args.setOpenDeleteModal(false);
      message.error("Select Test Id");
      return { err: "Select Test Id" };
    }

    const questionIds = Object.keys(args.selectedQuestions);
    const deleteQuestionPromise = questionIds.map((e) => {
      if (args.selectedQuestions[e]) {
        return axios.post(
          testsUrl + "/removeQuestionFromTest/" + args.testId,
          {
            questionId: e,
          }
        );
      }
    });

    const data = await Promise.all(deleteQuestionPromise);
    let ctr = true;
    data.forEach((e) => {
      if (e.data.data.err) {
        ctr = false;
      }
    });
    if (ctr) {
      args.dispatch(getOneTests({ _id: args.testId }));
      args.setConfirmDeleteLoading(false);
      args.setOpenDeleteModal(false);

      message.success("question deleted");
      return { msg: "question deleted" };
    } else {
      args.setConfirmDeleteLoading(false);
      args.setOpenDeleteModal(false);
      return { err: "Something went worng" };
    }
  }
);

export const { clearTestVals, updateTestValues } = TestsSlice.actions;
export default TestsSlice.reducer;
