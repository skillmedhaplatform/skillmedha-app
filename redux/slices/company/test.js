import { assessmentServer, restUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";
import _ from "lodash";

const TestsSlice = createSlice({
  name: "Tests",
  initialState: {
    value: [],
    test: {},
    allAssessments: [],
    singleAssessment: {},
    status: "",
    allQuestions: {
      status: "idle",
      data: [],
      pagination: null,
      error: null,
    },
  },
  reducers: {
    updateTestValues: (state, action) => {
      state.test = { ...state.test, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createAssessment.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
    builder.addCase(updateAssessment.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
    builder.addCase(sendInvitiesAssessment.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
    builder.addCase(getAllAssessments.fulfilled, (state, { payload }) => {
      state.allAssessments = payload;
    });

    builder.addCase(getOneAssessment.fulfilled, (state, { payload }) => {
      state.singleAssessment = payload;
    });

    builder.addCase(GetAllQuestions.pending, (state) => {
      state.allQuestions.status = "loading";
      state.allQuestions.error = null;
    });
    builder.addCase(GetAllQuestions.fulfilled, (state, action) => {
      state.allQuestions.status = "succeeded";
      state.allQuestions.data = action.payload.data;
      state.allQuestions.pagination = action.payload.pagination;
      state.allQuestions.error = null;
    });
    builder.addCase(GetAllQuestions.rejected, (state, action) => {
      state.allQuestions.status = "failed";
      state.allQuestions.error = action.payload;
    });
  },
});

export const getAllAssessments = createAsyncThunk(
  "/getAllAssessments",
  async (args) => {
    try {
      const token = getLstorage("token");
      const { data } = await axios.get(
        assessmentServer +
          `/getAllAssessments?limit=${args.limit}&cursor=${args.cursor}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const GetAllQuestions = createAsyncThunk(
  "/GetAllQuestions",
  async ({ pageNo = 1, limit = 10, filters }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        restUrl + `/questions/allQuestions?pageNo=${pageNo}&limit=${limit}`,
        filters,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createAssessment = createAsyncThunk(
  "/createAssessment",
  async (args) => {
    const token = getLstorage("token");
    const hide = message.loading("Please wait while creating assessment", 0);
    try {
      const { dispatch, nav } = args;

      const { data } = await axios.post(
        assessmentServer + "/createAssessment",
        {
          ...args.data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.msg) message.success("Assessment created successfully");

      nav.replace("/MyAssessments/" + data?.data?.insertedId);
      return data;
    } catch (error) {
      message.error("Failed to create assessment");
    } finally {
      hide();
    }
  }
);
export const getOneAssessment = createAsyncThunk(
  "/getOneTests",
  async (args) => {
    try {
      const token = getLstorage("token");
      const { id } = args;

      const { data } = await axios.get(
        assessmentServer + "/getOneAssessment/" + id,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const updateAssessment = createAsyncThunk(
  "/updateAssessment",
  async (args) => {
    const hide = message.loading("Please wait while updating assessment", 0);
    try {
      const token = getLstorage("token");
      const { id, updates } = args;

      const { data } = await axios.post(
        assessmentServer + "/updateAssessment?assessmentId=" + id,
        {
          ...updates,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.msg) message.success("Assessment updated successfully");
      return data.data;
    } catch (error) {
      message.error("Failed to update assessment");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const sendInvitiesAssessment = createAsyncThunk(
  "/sendInvitiesAssessment",
  async (args) => {
    const hide = message.loading("Please wait while sending invitations", 0);
    try {
      const token = getLstorage("token");
      const { id, updates } = args;

      const { data } = await axios.post(
        assessmentServer + "/sendInvitations/" + id,
        {
          ...updates,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.msg) message.success("Invitations sent successfully");
      return data;
    } catch (error) {
      message.error("Failed to send invitations");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const { updateTestValues } = TestsSlice.actions;
export default TestsSlice.reducer;
