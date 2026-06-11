import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
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
  },
});

const token = getLstorage("token");

export const getAllAssessments = createAsyncThunk(
  "/getAllAssessments",
  async (args) => {
    try {
      const { data } = await axios.get(
        restUrl +
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

export const createAssessment = createAsyncThunk(
  "/createAssessment",
  async (args) => {
    const hide = message.loading("Please wait while creating assessment", 0);
    try {
      const { dispatch, nav } = args;

      const { data } = await axios.post(
        restUrl + "/createAssessment",
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
      console.log(456);

      message.error("Failed to create assessment");
      console.log(error);
    } finally {
      hide();
    }
  }
);
export const getOneAssessment = createAsyncThunk(
  "/getOneTests",
  async (args) => {
    try {
      const { id } = args;

      const { data } = await axios.get(
        restUrl + "/getOneAssessment/" + id,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      const { id, updates } = args;

      const { data } = await axios.post(
        restUrl + "/updateAssessment?assessmentId=" + id,
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
      const { id, updates } = args;

      const { data } = await axios.post(
        restUrl + "/sendInvitations/" + id,
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
