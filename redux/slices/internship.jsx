import { internShipUrl, restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { message } from "antd";

const InternshipSlice = createSlice({
  name: "Internship",
  initialState: {
    allInternships: [],
    allCourses: [],
    singleInternship: {},
    currentMeeting: {},
    InternshipsDashBoard: [],
    CoursesDashBoard: [],
    lastAccessedSection: null,
    lastAccessedTopic: null,
    // Server-computed progress (populated by getOneInternsip)
    completedTopicIds: [],      // array of topicId strings that are done
    serverTotalProgress: 0,     // overall % (0-100)
    serverCompletedCount: 0,    // how many topics finished
    serverTotalCount: 0,        // how many topics exist
    allCoursesOnly: [],
    allInternshipsOnly: [],

  },
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(getAllInternships.fulfilled, (state, { payload }) => {
      state.allInternships = payload;
    });
    builder.addCase(
      getAllInternShipsDashBoard.fulfilled,
      (state, { payload }) => {
        state.InternshipsDashBoard = payload;
      }
    );
    builder.addCase(getAllCoursesDashBoard.fulfilled, (state, { payload }) => {
      state.CoursesDashBoard = payload;
    });
    builder.addCase(getAllCourses.fulfilled, (state, { payload }) => {
      state.allCourses = payload;
    });
    builder.addCase(getOneInternsip.fulfilled, (state, { payload }) => {
      state.singleInternship = payload?.data || payload;

      // ── Last-accessed position ────────────────────────────────────────
      if (payload?.lastAccessed) {
        state.lastAccessedSection = payload.lastAccessed.sectionIndex ?? null;
        state.lastAccessedTopic = payload.lastAccessed.topicIndex ?? null;
      }

      // ── Server-computed progress ──────────────────────────────────────
      // These come from the server so the frontend never has to re-derive
      // which topics are completed after a fresh page load.
      state.completedTopicIds = payload?.completedTopicIds ?? [];
      state.serverTotalProgress = payload?.totalProgress ?? 0;
      state.serverCompletedCount = payload?.completedCount ?? 0;
      state.serverTotalCount = payload?.totalCount ?? 0;
    });
    builder.addCase(currentMeeting.fulfilled, (state, { payload }) => {
      state.currentMeeting = payload;
    });
    builder.addCase(updateLastAccessed.fulfilled, (state, { payload }) => {
      if (payload) {
        state.lastAccessedSection = payload.sectionIndex;
        state.lastAccessedTopic = payload.topicIndex;
      }
    });
    builder.addCase(getAllCoursesOnly.fulfilled, (state, { payload }) => {
  state.allCoursesOnly = payload?.data || [];  // ← extract the array
});
builder.addCase(getAllInternshipsOnly.fulfilled, (state, { payload }) => {
  state.allInternshipsOnly = payload?.data || [];
});
  },
});



export const getAllInternships = createAsyncThunk(
  "/getAllInternships",
  async (args) => {
    try {
      const { data } = await axios.post(
        internShipUrl + "/getAllInternshipsCombo",
        {
          pageNo: args?.page || 1,
          searchTerm: args?.searchTerm || "",
          category: args?.category || "",
          difficulty: args?.difficulty || "",
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getAllInternShipsDashBoard = createAsyncThunk(
  "/getAllInternShipsDashBoard",
  async (args) => {
    try {
      const { data } = await axios.post(
        internShipUrl + "/getAllInternShips",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data?.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getAllCoursesDashBoard = createAsyncThunk(
  "/getAllCoursesDashBoard",
  async (args) => {
    try {
      const { data } = await axios.post(
        internShipUrl + "/getAllCourses",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data?.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getAllCourses = createAsyncThunk(
  "/getAllCourses",
  async (args, thunkAPI) => {
    try {
      const { data } = await axios.post(
        internShipUrl + "/getAllCoursesCombo",
        {
          pageNo: args?.page || 1,
          searchTerm: args?.searchTerm || "",
          category: args?.category || "",
          difficulty: args?.difficulty || "",
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.error("Error in getAllCourses:", error);
      const errMsg = error.response?.data?.error || error.response?.data?.err || error.response?.data?.message || error.message || "Failed to fetch courses";
      message.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const getOneInternsip = createAsyncThunk(
  "/getOneInternship",
  async (args, thunkAPI) => {
    try {
      const userIdParam = args.userId ? `?userId=${args.userId}` : '';
      const url = internShipUrl + `/getOneInternshipAuth/${args.id}${userIdParam}`;

      const { data } = await axios.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data;  // Return entire response with { data, lastAccessed }
    } catch (error) {
      console.error("Error in getOneInternship:", error);
      const errMsg = error.response?.data?.error || error.response?.data?.err || error.response?.data?.message || error.message || "Failed to fetch internship details";
      message.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);
export const currentMeeting = createAsyncThunk(
  "/currentMeeting",
  async (args) => {
    try {
      const { data } = await axios.post(
        restUrl + `/getMeetingDetails`,
        {
          id: args.id,
          orgId: args.orgId,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const updateVideoProgress = createAsyncThunk(
  "/updateVideoProgress",
  async (args) => {
    try {
      const { data } = await axios.post(
        internShipUrl + `/updateVideoProgress`,
        {
          userId: args.userId,
          meetingId: args.meetingId,
          topicId: args.topicId,
          progress: args.progress,
          totalDuration: args.totalDuration,
          orgId: args.orgId,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const updateLastAccessed = createAsyncThunk(
  "/updateLastAccessed",
  async (args) => {
    try {
      const { data } = await axios.post(
        internShipUrl + `/updateLastAccessed`,
        {
          userId: args.userId,
          itemId: args.itemId,
          itemType: args.itemType,
          sectionIndex: args.sectionIndex,
          topicIndex: args.topicIndex,
          orgId: args.orgId,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const updateTotalProgress = createAsyncThunk(
  "/updateTotalProgress",
  async (args) => {
    try {
      const { data } = await axios.post(
        internShipUrl + `/updateTotalProgress`,
        {
          userId: args.userId,
          itemId: args.itemId,
          itemType: args.itemType,
          completedCount: args.completedCount,
          totalCount: args.totalCount,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const getAllCoursesOnly = createAsyncThunk(
  "/getAllCoursesOnly",
  async (args) => {
    try {
      const { data } = await axios.post(
        internShipUrl + "/getAllCourses",
        { ...args },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const getAllInternshipsOnly = createAsyncThunk(
  "/getAllInternshipsOnly",
  async (args) => {
    try {
      const { data } = await axios.post(
        internShipUrl + "/getAllInternShips",
        { ...args },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const { } = InternshipSlice.actions;
export default InternshipSlice.reducer;