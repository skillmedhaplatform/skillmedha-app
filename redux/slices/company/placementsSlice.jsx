import { GetToken } from "@/utils/universalUtils/token";
import { restUrl } from "@/utils/universalUtils/urls";
import {
  getLstorage,
  setLstorage,
  setSstorage,
} from "@/utils/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";

const JobsSlice = createSlice({
  name: "JobsSlice",
  initialState: {
    AllJobs: {
      value: {},
      status: "idle",
      error: null,
    },
    OneJob: {
      value: {},
      status: "idle",
      error: null,
    },
    CreateJob: {
      value: {},
      status: "idle",
      error: null,
    },
    UpdateJob: {
      value: {},
      status: "idle",
      error: null,
    },
    results: {},
    // From the previous conversation - simplified jobs state
    jobs: [],
    loading: false,
    error: null,
    resultsError: null,
  },
  reducers: {
    // From the previous conversation
    clearError: (state) => {
      state.error = null;
    },
    clearJobs: (state) => {
      state.jobs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetAllJobs.pending, (state) => {
        state.AllJobs.status = "loading";
        state.AllJobs.error = null;
      })
      .addCase(GetAllJobs.fulfilled, (state, { payload }) => {
        state.AllJobs.status = "succeeded";
        state.AllJobs.value = payload;
      })
      .addCase(GetAllJobs.rejected, (state, { error }) => {
        state.AllJobs.status = "failed";
        state.AllJobs.error = error.message;
      })
      .addCase(GetOneJob.pending, (state) => {
        state.OneJob.status = "loading";
        state.OneJob.error = null;
      })
      .addCase(GetOneJob.fulfilled, (state, { payload }) => {
        state.OneJob.status = "succeeded";
        state.OneJob.value = payload;
      })
      .addCase(GetOneJob.rejected, (state, { error }) => {
        state.OneJob.status = "failed";
        state.OneJob.error = error.message;
      })
      // CreateJob cases
      .addCase(CreateJob.pending, (state) => {
        state.CreateJob.status = "loading";
        state.CreateJob.error = null;
      })
      .addCase(CreateJob.fulfilled, (state, { payload }) => {
        state.CreateJob.status = "succeeded";
        state.CreateJob.value = payload;
      })
      .addCase(CreateJob.rejected, (state, { error }) => {
        state.CreateJob.status = "failed";
        state.CreateJob.error = error.message;
      })
      // UpdateJob cases
      .addCase(UpdateJob.pending, (state) => {
        state.UpdateJob.status = "loading";
        state.UpdateJob.error = null;
      })
      .addCase(UpdateJob.fulfilled, (state, { payload }) => {
        state.UpdateJob.status = "succeeded";
        state.UpdateJob.value = payload;
      })
      .addCase(UpdateJob.rejected, (state, { error }) => {
        state.UpdateJob.status = "failed";
        state.UpdateJob.error = error.message;
      })
      // From the previous conversation - getAllJobs thunk
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
      .addCase(
        getJobAssessmentResultsForStudent.fulfilled,
        (state, { payload }) => {
          state.results = payload;
        }
      )
      .addCase(getJobAssessmentResultsForStudent.rejected, (state, action) => {
        state.resultsError = action.error;
      });
  },
});

const baseurl = restUrl;
const token = GetToken();

// From the previous conversation - simplified getAllJobs
export const getAllJobs = createAsyncThunk(
  "/fetchAllJobs",
  async (args, { rejectWithValue }) => {
    const { page = 1, limit = 20, status } = args;
    try {
      if (!status) return;
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

export const GetAllJobs = createAsyncThunk(
  "/getAllJobsBasedOnplacements",
  async (args) => {
    try {
      const { limit = 10, cursor = null, profileId } = args;
      const { data } = await axios.get(
        `${baseurl}/getAllJobsBasedOnplacements?limit=${limit}&cursor=${cursor}&profileId=${profileId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const GetOneJob = createAsyncThunk("/getOneJob", async (args) => {
  try {
    const { jobid } = args;
    const { data } = await axios.post(
      `${baseurl}/getOneJob/${jobid}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token") || token}`,
        },
      }
    );
    return data.data ? data : { data };
  } catch (error) {
    console.log(error);
  }
});

export const CreateJob = createAsyncThunk(
  "/createAJob",
  async (args, { rejectWithValue }) => {
    try {
      const hideLoading = message.loading("Creating Job ...");
      const { dispatch, placementId, payload } = args;
      const { data } = await axios.post(
        `${baseurl}/createAJob/${placementId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      if (data?.msg) {
        hideLoading();
        message.success("Job Created");
        setSstorage("jobid", data?.insertedId);
        await dispatch(GetOneJob({ jobid: data?.insertedId }));
      }
      return data;
    } catch (error) {
      hideLoading();
      message.error("Error Creating Job ");
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const UpdateJob = createAsyncThunk(
  "/updateAJob",
  async (args, { rejectWithValue }) => {
    try {
      const hideLoading = message.loading("Updating Job ...");
      const { dispatch, jobid, payload } = args;
      const { _id, ...sanitizedPayload } = payload;
      const { data } = await axios.post(
        `${baseurl}/updateAJob/${jobid}`,
        sanitizedPayload,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      if (data?.msg) {
        hideLoading();
        message.success("Job Updated");
        await dispatch(GetOneJob({ jobid }));
      }
      return data;
    } catch (error) {
      hideLoading();
      message.error("Error Updating Job ");
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getJobAssessmentResultsForStudent = createAsyncThunk(
  "assessment/getJobAssessmentResultsForStudent",
  async ({ assessmentId, studentId, router=null, params }, thunkAPI) => {
    try {
      const response = await axios.get(
        restUrl +
          `/getJobAssessmentResultsForStudent/${assessmentId}/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      
      return response.data;
    } catch (error) {
      const errMsg =
        // error.response?.data?.message ||
        // error.message ||
        "No progress found for this student and assessment";

      message.error(errMsg);
      if(router) router.push(`/jobassessments/${params?.jobDetails}`);

      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const { clearError, clearJobs } = JobsSlice.actions;
export default JobsSlice.reducer;
