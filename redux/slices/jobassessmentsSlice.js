import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAssignedAssessments = createAsyncThunk(
  "JobAssessment/fetchAssignedAssessments",
  async (args, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        restUrl + `/getAssignedAssessments?page=${args?.page || 1}&limit=${args?.limit || 20}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to fetch assigned assessments"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const fetchOneAssessment = createAsyncThunk(
  "JobAssessment/fetchOneAssessment",
  async (assessmentId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        restUrl + `/getOneAssessmentFromStudent/${assessmentId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return data?.data;
    } catch (error) {
      console.log(error);
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to fetch assessment"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

const JobAssessmentSlice = createSlice({
  name: "JobAssessment",
  initialState: {
    assessments: {
      value: [], // Consistently use array
      status: "idle",
      error: "",
    },
    singleAssessment: {
      value: {},
      status: "idle",
      error: "",
    },
  },
  reducers: {
    clearError: (state) => {
      state.assessments.error = "";
      state.singleAssessment.error = "";
    },
    clearAssessments: (state) => {
      state.assessments.value = [];
      state.assessments.status = "idle";
      state.assessments.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing fetchAssignedAssessments cases
      .addCase(fetchAssignedAssessments.pending, (state) => {
        state.assessments.status = "loading";
        state.assessments.error = "";
      })
      .addCase(fetchAssignedAssessments.fulfilled, (state, action) => {
        state.assessments.status = "succeeded";
        if (action.meta.arg?.page > 1) {
          const existingData = Array.isArray(state.assessments.value?.data) ? state.assessments.value.data : [];
          const newData = Array.isArray(action.payload?.data) ? action.payload.data : [];
          state.assessments.value = {
            ...action.payload,
            data: [...existingData, ...newData]
          };
        } else {
          state.assessments.value = action.payload;
        }
        state.assessments.error = "";
      })
      .addCase(fetchAssignedAssessments.rejected, (state, action) => {
        state.assessments.status = "failed";
        state.assessments.error = action.payload;
      })
      // New fetchOneAssessment cases
      .addCase(fetchOneAssessment.pending, (state) => {
        state.singleAssessment.status = "loading";
        state.singleAssessment.error = "";
      })
      .addCase(fetchOneAssessment.fulfilled, (state, action) => {
        state.singleAssessment.status = "succeeded";
        state.singleAssessment.value = action.payload;
        state.singleAssessment.error = "";
      })
      .addCase(fetchOneAssessment.rejected, (state, action) => {
        state.singleAssessment.status = "failed";
        state.singleAssessment.error = action.payload;
      });
  },
});

export const { clearError, clearAssessments } = JobAssessmentSlice.actions;
export default JobAssessmentSlice.reducer;
