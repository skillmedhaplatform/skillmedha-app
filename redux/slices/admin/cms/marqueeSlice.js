import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";

const API_BASE_URL = restUrl;


const getAuthHeaders = () => ({
  Authorization: `Bearer ${getLstorage("jwtToken")}`,
});

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchMarqueeNotices = createAsyncThunk(
  "marquee/fetchNotices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/marquee", {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMarqueeNotice = createAsyncThunk(
  "marquee/createNotice",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/marquee", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMarqueeNotice = createAsyncThunk(
  "marquee/deleteNotice",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/marquee/${id}`, {
        headers: getAuthHeaders(),
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMarqueeNotice = createAsyncThunk(
  "marquee/updateNotice",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/marquee/${id}`, updates, {
        headers: getAuthHeaders(),
      });
      return { id, updates };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMarqueeSettings = createAsyncThunk(
  "marquee/updateSettings",
  async (globalEnabled, { rejectWithValue }) => {
    try {
      const response = await api.put(
        "/marquee/settings",
        { globalEnabled },
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const marqueeSlice = createSlice({
  name: "marquee",
  initialState: {
    notices: [],
    globalEnabled: true,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMarqueeNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarqueeNotices.fulfilled, (state, action) => {
        state.loading = false;
        state.notices = action.payload.data;
        state.globalEnabled = action.payload.globalEnabled;
      })
      .addCase(fetchMarqueeNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createMarqueeNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMarqueeNotice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
            state.notices.unshift(action.payload.data);
        }
      })
      .addCase(createMarqueeNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateMarqueeNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMarqueeNotice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notices.findIndex(n => n._id === action.payload.id);
        if (index !== -1) {
          state.notices[index] = { ...state.notices[index], ...action.payload.updates };
        }
      })
      .addCase(updateMarqueeNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteMarqueeNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMarqueeNotice.fulfilled, (state, action) => {
        state.loading = false;
        state.notices = state.notices.filter((n) => n._id !== action.payload);
      })
      .addCase(deleteMarqueeNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMarqueeSettings.fulfilled, (state, action) => {
        state.globalEnabled = action.payload.globalEnabled;
      });
  },
});

export default marqueeSlice.reducer;
