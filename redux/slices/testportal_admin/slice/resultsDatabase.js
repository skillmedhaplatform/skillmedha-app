import {
  allProgressSchema,
  progressTotalSchema,
  singleProgress,
} from "@/modules/testportal_admin/graphql_quries/resultsDatabase";
import {
  GetOneTestData,
  SingleStudentGqlQuery,
  Students,
} from "@/modules/testportal_admin/graphql_quries/students";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { gqlUrl } from "@/utils/universalUtils/urls";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "@/modules/testportal_admin/utils/axiosInstance";

const PAGE_SIZE = 10;

const resultsDatabaseSlice = createSlice({
  name: "results",
  initialState: {
    progress: [],
    total: 0,
    singleProgress: {},
    singleProgressStatus: "idle",
    status: "",
    error: null,
  },
  reducers: {
    saveTestResults: (state, action) => {
      if (!state.testResults.value) {
        state.testResults.value = {};
      }
      state.testResults.value[action.payload.testId] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllProgress.pending, (state) => {
      state.status = "pending";
    });
    builder.addCase(getAllProgress.fulfilled, (state, { payload }) => {
      state.status = "fulfilled";
      state.progress = payload?.data || [];
      if (payload?.total !== undefined) state.total = payload.total;
    });
    builder.addCase(getOneProgress.pending, (state) => {
      state.singleProgressStatus = "pending";
    });
    builder.addCase(getOneProgress.fulfilled, (state, { payload }) => {
      state.singleProgressStatus = "fulfilled";
      state.singleProgress = payload;
    });
    builder.addCase(getOneProgress.rejected, (state, { error }) => {
      state.singleProgressStatus = "rejected";
      state.error = error.message;
    });
  },
});

// Fetch a reasonable batch upfront so client-side filters work across all records
export const getAllProgress = createAsyncThunk(
  "/allProgress",
  async (args) => {
    try {
      const limit = args?.limit || 500;

      // Fetch current page data + total count in parallel
      const [pageRes, totalRes] = await Promise.all([
        axios.post(gqlUrl, {
          query: allProgressSchema,
          variables: { cursor: null, limit, skip: 0 },
        }),
        axios.post(gqlUrl, {
          query: progressTotalSchema,
        }),
      ]);

      return {
        data: pageRes.data?.data?.progressLimit || [],
        total: totalRes.data?.data?.progressTotal || 0,
      };
    } catch (error) {
      console.log(error);
      return { data: [], total: 0 };
    }
  }
);

export const getOneProgress = createAsyncThunk("/oneProgress", async (args) => {
  try {
    const { data } = await axios.post(gqlUrl, {
      query: singleProgress,
      variables: { id: args.id },
    });

    return data?.data?.progresses || {};
  } catch (error) {
    console.log(error);
  }
});

export { PAGE_SIZE };
export const { saveTestResults } = resultsDatabaseSlice.actions;

export default resultsDatabaseSlice.reducer;
