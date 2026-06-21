import { internShipUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { message } from "antd";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
    pendingIds: [],
  },
  reducers: {
    resetWishlist: (state) => {
      state.items = [];
      state.error = null;
      state.pendingIds = [];
    },
  },
  extraReducers: (builder) => {
    // getWishlist
    builder.addCase(getWishlist.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getWishlist.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.items = payload?.items ?? [];
    });
    builder.addCase(getWishlist.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // addToWishlist
    builder.addCase(addToWishlist.pending, (state, { meta }) => {
      state.error = null;
      state.pendingIds.push(meta.arg);
    });
    builder.addCase(addToWishlist.fulfilled, (state, { payload, meta }) => {
      state.pendingIds = state.pendingIds.filter((id) => id !== meta.arg);
      state.items = payload?.items ?? [];
    });
    builder.addCase(addToWishlist.rejected, (state, { payload, meta }) => {
      state.pendingIds = state.pendingIds.filter((id) => id !== meta.arg);
      state.error = payload;
    });

    // removeFromWishlist
    builder.addCase(removeFromWishlist.pending, (state, { meta }) => {
      state.error = null;
      state.pendingIds.push(meta.arg);
    });
    builder.addCase(removeFromWishlist.fulfilled, (state, { payload, meta }) => {
      state.pendingIds = state.pendingIds.filter((id) => id !== meta.arg);
      state.items = payload?.items ?? [];
    });
    builder.addCase(removeFromWishlist.rejected, (state, { payload, meta }) => {
      state.pendingIds = state.pendingIds.filter((id) => id !== meta.arg);
      state.error = payload;
    });
  },
});

// ── Thunks ────────────────────────────────────────────────────────────────────

export const getWishlist = createAsyncThunk(
  "/getWishlist",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(internShipUrl + "/wishlist", {
        headers: { Authorization: `Bearer ${getLstorage("token")}` },
      });
      return data; // { items }
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch wishlist";
      message.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "/addToWishlist",
  async (courseId, thunkAPI) => {
    try {
      const { data } = await axios.post(
        internShipUrl + "/wishlist",
        { courseId },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      return data; // { items }
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to add to wishlist";
      message.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "/removeFromWishlist",
  async (courseId, thunkAPI) => {
    try {
      const { data } = await axios.delete(
        internShipUrl + `/wishlist/${courseId}`,
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      return data; // { items }
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to remove from wishlist";
      message.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;