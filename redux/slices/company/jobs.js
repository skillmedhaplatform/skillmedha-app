import { GetToken } from "@/utils/universalUtils/token";
import { restUrl, studentUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { message } from "antd";
import axios from "axios";
import { getStudentCreds } from "../student";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

// Async thunk for fetching all jobs
export const getAllJobs = createAsyncThunk(
  "/fetchAllJobs",
  async (args, { rejectWithValue }) => {
    const { page = 1, limit = 20, status } = args;
    try {
      const response = await axios.get(
        restUrl + `/getAllJobs?page=${page}&limit=${limit}&status=${status}`,
        {
          headers: {
            Authorization: "Bearer " + GetToken(),
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const setJobStatus = createAsyncThunk(
  "/setJobStatus",
  async (args, { rejectWithValue }) => {
    const { jobId, status } = args;
    const hide = message.loading("Please wait while updating status of job", 0);
    try {
      const { data } = await axios.get(
        restUrl + `/setJobStatus?jobId=${jobId}&status=${status}`,
        {
          headers: {
            Authorization: "Bearer " + GetToken(),
          },
        }
      );
      if (data.msg) message.success("Job status updated successfully");
      return data.msg;
    } catch (error) {
      message.success("Failed update job status");
      return rejectWithValue(error.response?.data || error.message);
    } finally {
      hide();
    }
  }
);

const jobsSlice = createSlice({
  name: "Jobs",
  initialState: {
    jobs: [],
    loading: false,
    error: null,
    status: "",
    results: {},
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearJobs: (state) => {
      state.jobs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
        state.error = null;
      })

      .addCase(getAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setJobStatus.fulfilled, (state, action) => {
        state.status = action.payload;
      })
      .addCase(getStudentCreds.fulfilled, (state, { payload }) => {
        state.student = payload;
      });
  },
});

export const { clearError, clearJobs } = jobsSlice.actions;
export default jobsSlice.reducer;
