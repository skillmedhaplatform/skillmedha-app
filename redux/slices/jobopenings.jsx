import { restUrl } from "@/config/urls";
import axios from "axios";
import { getStudentCreds } from "./student";
import { message } from "antd";
import { getLstorage } from "@/universalUtils/windowMW";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const JobOpeningSlice = createSlice({
  name: "JobOpeningSlice",
  initialState: {
    allJobOpenings: {
      value: {
        jobs: [],
        pagination: {
          totalDocs: 0,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
        },
      },
      status: "",
      error: null,
    },
    appliedJob: {
      value: {},
      status: "",
      error: null,
    },
    allNotices: {
      value: [],
      status: "",
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(GetAllJobs.pending, (state, { payload }) => {
      state.allJobOpenings.status = "pending";
    });
    builder.addCase(GetAllJobs.fulfilled, (state, { payload }) => {
      const { data } = payload;
      state.allJobOpenings.value.jobs = data?.data || [];
      state.allJobOpenings.value.pagination = data?.pagination || {
        totalDocs: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      };
      state.allJobOpenings.status = "fulfilled";
    });
    builder.addCase(GetAllJobs.rejected, (state, action) => {
      state.allJobOpenings.error = action.error;
      state.allJobOpenings.status = "rejected";
    });
    builder.addCase(ApplyJob.pending, (state, { payload }) => {
      state.appliedJob.status = "pending";
    });
    builder.addCase(ApplyJob.fulfilled, (state, action) => {
      state.appliedJob.status = "fulfilled";
    });
    builder.addCase(ApplyJob.rejected, (state, action) => {
      state.appliedJob.error = action.error;
      state.appliedJob.status = "rejected";
    });
    builder.addCase(GetAllNotifiocations.pending, (state, { payload }) => {
      state.allNotices.status = "pending";
    });
    builder.addCase(GetAllNotifiocations.fulfilled, (state, { payload }) => {
      state.allNotices.status = "fulfilled";
      state.allNotices.value = payload;
    });
    builder.addCase(GetAllNotifiocations.rejected, (state, action) => {
      state.allNotices.error = action.error;
      state.allNotices.status = "rejected";
    });
  },
});
export const GetAllJobs = createAsyncThunk("/getAllJobs", async (args) => {
  try {
    const { queryObj = {}, page = 1, limit = 10 } = args || {};

    const params = new URLSearchParams({
      page,
      limit,
      ...queryObj,
    });

    const queryString = params.toString().replace(/\+/g, "%20");

    const fullUrl = `${restUrl}/getAllJobs?${queryString}`;

    const { data } = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ` + getLstorage("token"),
      },
    });

    return { data };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
});

export const ApplyJob = createAsyncThunk("/applyJob", async (args) => {
  const { dispatch } = args;
  const hide = message.loading("Applying for the job, please wait...");
  try {
    const { data } = await axios.get(
      restUrl + `/applyJob?jobId=${args?.jobid}&studentId=${args?.studentId}`,
      {
        headers: {
          Authorization: `Bearer ` + getLstorage("token"),
        },
      }
    );
    if (data?.msg) {
      dispatch(GetAllJobs({ fetchType: "initial" }));
      dispatch(getStudentCreds());
      hide();
      message.success(data?.msg || "Applied successfully");
    }
    return data;
  } catch (error) {
    hide();
    message.error("Failed to apply for the job.");
    console.log(error);
  }
});

export const GetAllNotifiocations = createAsyncThunk(
  "/GetAllNotifiocations",
  async (args) => {
    try {
      const { data } = await axios.get(restUrl + `/getNoticeByStudent`, {
        headers: {
          Authorization: `Bearer ` + getLstorage("token"),
        },
      });
      return data?.data;
    } catch (error) {
      // message.error("Failed to apply for the job.");
      console.log(error);
    }
  }
);

export default JobOpeningSlice.reducer;
