import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getLstorage } from "@/utils/universalUtils/windowMW";

const restUrl = process.env.NEXT_PUBLIC_REST_URL;

export const getDashboardStats = createAsyncThunk(
  "dashboardStats/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const token = getLstorage("token");
      const { data } = await axios.get(
        `${restUrl}/api/dashboard/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.err || err.message
      );
    }
  }
);

const dashboardStatsSlice = createSlice({
  name: "dashboardStats",
  initialState: {
    stats: {
      studentsCount: 0,
      departmentsCount: 0,
      totalPlacements: 0,
      activeDrives: 0,
      recentPlacements: [],
    },
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stats = payload;
      })
      .addCase(getDashboardStats.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default dashboardStatsSlice.reducer;
