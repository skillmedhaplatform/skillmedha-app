import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const saveRazorpayCredentials = createAsyncThunk(
  "razorpay/saveCredentials",
  async ({ keyId, keySecret }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        restUrl + "/cms/credentials",

        { keyId, keySecret },

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getLstorage("jwtToken"),
          },
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const fetchRazorpayCredentials = createAsyncThunk(
  "razorpay/fetchCredentials",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(restUrl + "/cms/credentials", {
        headers: {
          Authorization: "Bearer " + getLstorage("jwtToken"),
        },
      });

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const razorpaySlice = createSlice({
  name: "razorpay",
  initialState: {
    credentials: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save credentials
      .addCase(saveRazorpayCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveRazorpayCredentials.fulfilled, (state, action) => {
        state.loading = false;
        state.credentials = action.payload;
      })
      .addCase(saveRazorpayCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch credentials
      .addCase(fetchRazorpayCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRazorpayCredentials.fulfilled, (state, action) => {
        state.loading = false;
        state.credentials = action.payload;
      })
      .addCase(fetchRazorpayCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = razorpaySlice.actions;
export default razorpaySlice.reducer;
