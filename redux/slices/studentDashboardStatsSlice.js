import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getLstorage } from "@/universalUtils/windowMW";

const restUrl = process.env.NEXT_PUBLIC_STUDENT_URL;

export const getStudentDashboardStats = createAsyncThunk(
  "studentDashboardStats/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const token = getLstorage("token");
      const { data } = await axios.get(
        `${restUrl}/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.err || err.message
      );
    }
  }
);

const studentDashboardStatsSlice = createSlice({
  name: "studentDashboardStats",
  initialState: {
    stats: {
      coursesCount: 0,
      internshipsCount: 0,
      notificationsCount: 0,
      recentNotifications: [],
    },
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStudentDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentDashboardStats.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stats = payload;
      })
      .addCase(getStudentDashboardStats.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default studentDashboardStatsSlice.reducer;
