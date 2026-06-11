// import { assessment_gql_url, testUrl } from "@/config/urls";
import {
  GetOneTestData,
  getOneTest,
  testsQuery,
} from "@/graphql_quries/assessments";
import { assessment_gql_url, testUrl, restUrl } from "@/config/urls";
import {
  deleteLstorageVal,
  getSstorage,
  deleteSstorageVal,
  getLstorage,
} from "@/universalUtils/windowMW";
import { message } from "antd";
import axios from "axios";
import _ from "lodash";
const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const testSlice = createSlice({
  name: "Tests",
  initialState: {
    selectedTest: "",
    allTests: [],
    error: null,
    status: "",
    pageinfo: {},
    testData: {
      error: null,
      status: "",
      value: null,
    },
    finishedTestData: {
      error: null,
      status: "",
      value: null,
    },
    uploadProgress: {
      error: null,
      status: "pending",
      value: null,
    },
  },
  reducers: {
    saveTempResults: (state, { payload }) => {
      const withPrev = [...state.tempResults, ...payload];
      state.tempResults = _.uniqBy(withPrev, "_id");
    },
    resetTests: (state) => {
      state.allTests = [];
      state.pageinfo = {};
      state.status = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllTests.pending, (state, action) => {
      state.error = null;
      state.status = "pending";
    });
    builder.addCase(fetchAllTests.fulfilled, (state, { payload }) => {
      state.pageinfo = payload.pageInfo;
      if (payload.append) {
        // Load More: append to existing list
        const withPrev = [...state.allTests, ...payload.tests];
        state.allTests = _.uniqBy(withPrev, "_id");
      } else {
        // Fresh load or page change: replace
        state.allTests = _.uniqBy(payload.tests, "_id");
      }
      state.error = null;
      state.status = "fulfilled";
    });
    builder.addCase(fetchAllTests.rejected, (state, action) => {
      state.allTests = [];
      state.error = action.error;
      state.status = "rejected";
    });
    builder.addCase(getSingleTest.pending, (state, action) => {
      state.testData.value = [];
      state.testData.error = null;
      state.testData.status = "pending";
    });
    builder.addCase(getSingleTest.fulfilled, (state, action) => {
      state.testData.value = action.payload;
      state.testData.error = null;
      state.testData.status = "fulfilled";
    });
    builder.addCase(getSingleTest.rejected, (state, action) => {
      state.testData.value = [];
      state.testData.error = action.error;
      state.testData.status = "rejected";
    });
    builder.addCase(fetchTestData.pending, (state, action) => {
      state.finishedTestData.value = [];
      state.finishedTestData.error = null;
      state.finishedTestData.status = "pending";
    });
    builder.addCase(fetchTestData.fulfilled, (state, action) => {
      state.finishedTestData.value = action.payload;
      state.finishedTestData.error = null;
      state.finishedTestData.status = "fulfilled";
    });
    builder.addCase(fetchTestData.rejected, (state, action) => {
      state.finishedTestData.value = [];
      state.finishedTestData.error = action.error;
      state.finishedTestData.status = "rejected";
    });
    builder.addCase(saveProgress.pending, (state, action) => {
      state.finishedTestData.value = [];
      state.finishedTestData.error = null;
      state.finishedTestData.status = "pending";
    });
    builder.addCase(saveProgress.fulfilled, (state, action) => {
      state.finishedTestData.value = action.payload;
      state.finishedTestData.error = null;
      state.finishedTestData.status = "fulfilled";
    });
    builder.addCase(saveProgress.rejected, (state, { payload }) => {
      state.uploadProgress.value = payload;
      state.uploadProgress.error = action.error;
      state.uploadProgress.status = "rejected";
    });
    builder.addCase(fetchAllTestsByCategory.pending, (state, action) => {
      state.error = null;
      state.status = "pending";
    });
    builder.addCase(fetchAllTestsByCategory.fulfilled, (state, { payload }) => {
      state.pageinfo = payload.pageInfo;
      // const withPrev = [...state.allTests, ...payload.tests];
      state.allTests = _.uniqBy(payload.tests, "_id");
      state.error = null;
      state.status = "fulfilled";
    });
  },
});

const headerVal = getSstorage("head");

export const fetchAllTests = createAsyncThunk(
  "tests/fetchall",
  async (action, { getState }) => {
    const state = getState();
    const studentId = state.student?.student?.data?._id || getSstorage("studentId");
    
    const { data } = await axios.post(
      assessment_gql_url,
      {
        query: testsQuery,
        variables: {
          cursor: action.cursor || null,
          limit: action.limit || 10,
          origin: "student",
          studentId: studentId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      }
    );
    // Mark payload so reducer knows whether to append or replace
    return {
      ...data.data.tests,
      append: !!action.cursor, // cursor present = load more = append
    };
  }
);

export const fetchTestData = createAsyncThunk(
  "test/GetOneTestData",
  async ({ testId }) => {
    const { data } = await axios.post(
      assessment_gql_url,
      {
        query: GetOneTestData,
        variables: { testId },
      },
      {
        headers: {
          user: headerVal,
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      }
    );
    return { test: data.data.test };
  }
);

export const getSingleTest = createAsyncThunk("test/getOne", async (args) => {
  const { data } = await axios.post(
    assessment_gql_url,
    {
      query: getOneTest,
      variables: { testId: args._id },
    },
    {
      headers: {
        user: headerVal,
        Authorization: `Bearer ${getLstorage("token")}`,
      },
    }
  );

  return data.data.test;
});

export const saveProgress = createAsyncThunk("saveTest", async (args) => {
  try {
    const { nav } = args;

    let reqbody = { ...args };
    delete reqbody.msgFlag;
    const { data } = await axios.post(testUrl + "/saveTestProgress", {
      ...reqbody,
      studentId: args.userId,
    });

    if (args.msgFlag) {
      if (data?.msg) {
        message.success(data?.msg);
        return data;
      } else {
        message.error(data?.err);
      }
    } else {
      nav.replace("/");
      deleteLstorageVal("isStarted");
      deleteSstorageVal("userIdInProgress");
    }
  } catch (error) {
    console.log(error);
  }
});

export const fetchAllTestsByCategory = createAsyncThunk(
  "tests/fetchbycategory",
  async (action) => {
    const { data } = await axios.post(testUrl, {
      query: testsQuery,
      variables: {
        limit: action?.limit,
        category: action?.category,
        origin: "student",
      },
    });
    return data.data.tests.tests;
  }
);

export const { saveTempResults, resetTests } = testSlice.actions;
export default testSlice.reducer;
