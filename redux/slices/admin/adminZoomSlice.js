import { internshipUrl, restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";
import { findLast } from "lodash";

const ZoomSlice = createSlice({
  name: "stepForm",
  initialState: {
    allMeetings: [],
    singleMeeting: {},
    status: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllMeetings.fulfilled, (state, { payload }) => {
      state.allMeetings = payload;
    });
    builder.addCase(searchMeetingByTopic.fulfilled, (state, { payload }) => {
      state.allMeetings = payload;
    });
    builder.addCase(createZoomMeeting.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
    builder.addCase(updateMeeting.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
    builder.addCase(getOneMeeting.fulfilled, (state, { payload }) => {
      state.singleMeeting = payload;
    });
  },
});

const token = getLstorage("token");

export const searchMeetingByTopic = createAsyncThunk(
  "/searchMeetingByTopic",
  async (args) => {
    try {
      const { type, text, limit, cursor } = args;

      const { data } = await axios.get(
        internshipUrl +
          `/searchTopics?limit=${limit}&cursor=${cursor}&query=${text}&type=${type}`,
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

export const createZoomMeeting = createAsyncThunk(
  "/createZoomMeeting",
  async (payload) => {
    const hide = message.loading("Please wait while creating meeting", 0);

    const { dispatch } = payload;
    try {
      const { data } = await axios.post(
        restUrl + "/createMeeting",
        {
          ...payload.data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(getAllMeetings());
      if (data?.meeting) message.success("Meeting created successfully");
      return data.meeting;
    } catch (error) {
      message.error(error?.response?.data?.msg || "Failed to create meeting");
      console.log(error?.response?.data?.msg);
    } finally {
      hide();
    }
  }
);

export const getAllMeetings = createAsyncThunk(
  "/getAllMeetings",
  async (payload) => {
    try {
      const { type, cursor, limit } = payload;
      const { data } = await axios.get(
        restUrl +
          `/getAllMeetings?type=${type}&cursor=${cursor}&limit=${limit}`,
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

export const getOneMeeting = createAsyncThunk(
  "/getOneMeeting",
  async (args) => {
    try {
      const { id } = args;

      const { data } = await axios.post(
        restUrl + "/getMeetingDetails",
        {
          id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      message.error("Class Ended");
      console.log(error);
    }
  }
);

export const updateMeeting = createAsyncThunk(
  "/updateMeeting",
  async (args) => {
    const hide = message.loading("Please wait while updating meeting", 0);
    try {
      const { id } = args;

      const { data } = await axios.post(
        restUrl + "/updateMeeting/" + id,
        {
          isCompleted: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.data?.msg) message.success("Meeting upated successfully");
      return data.data;
    } catch (error) {
      message.error("Failed to update meeting");
      console.log(error);
    } finally {
      hide();
    }
  }
);
export const {} = ZoomSlice.actions;

export default ZoomSlice.reducer;
