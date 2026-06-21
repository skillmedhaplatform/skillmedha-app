import { internShipUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { message } from "antd";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalAmount: 0,
    loading: false,
    error: null,
    pendingIds: [],
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.error = null;
      state.pendingIds = [];
    },
  },
  extraReducers: (builder) => {
    // getCart
    builder.addCase(getCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCart.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.items = payload?.items ?? [];
      state.totalAmount = payload?.totalAmount ?? 0;
    });
    builder.addCase(getCart.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // addToCart
    builder.addCase(addToCart.pending, (state, { meta }) => {
      state.error = null;
      state.pendingIds.push(meta.arg);
    });
    builder.addCase(addToCart.fulfilled, (state, { payload, meta }) => {
      state.pendingIds = state.pendingIds.filter((id) => id !== meta.arg);
      state.items = payload?.items ?? [];
      state.totalAmount = payload?.totalAmount ?? 0;
    });
    builder.addCase(addToCart.rejected, (state, { payload, meta }) => {
      state.pendingIds = state.pendingIds.filter((id) => id !== meta.arg);
      state.error = payload;
    });

    // removeFromCart
    builder.addCase(removeFromCart.pending, (state, { meta }) => {
      state.error = null;
      state.pendingIds.push(meta.arg);
    });
    builder.addCase(removeFromCart.fulfilled, (state, { payload, meta }) => {
      state.pendingIds = state.pendingIds.filter((id) => id !== meta.arg);
      state.items = payload?.items ?? [];
      state.totalAmount = payload?.totalAmount ?? 0;
    });
    builder.addCase(removeFromCart.rejected, (state, { payload, meta }) => {
      state.pendingIds = state.pendingIds.filter((id) => id !== meta.arg);
      state.error = payload;
    });

    // clearCart
    builder.addCase(clearCart.fulfilled, (state, { payload }) => {
      state.items = payload?.items ?? [];
      state.totalAmount = payload?.totalAmount ?? 0;
    });
  },
});

// ── Thunks ────────────────────────────────────────────────────────────────────

export const getCart = createAsyncThunk("/getCart", async (_, thunkAPI) => {
  try {
    const { data } = await axios.get(internShipUrl + "/cart", {
      headers: { Authorization: `Bearer ${getLstorage("token")}` },
    });
    return data; // { items, totalAmount }
  } catch (error) {
    const errMsg =
      error.response?.data?.error ||
      error.response?.data?.err ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch cart";
    message.error(errMsg);
    return thunkAPI.rejectWithValue(errMsg);
  }
});

export const addToCart = createAsyncThunk(
  "/addToCart",
  async (courseId, thunkAPI) => {
    try {
      const { data } = await axios.post(
        internShipUrl + "/cart",
        { courseId },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      return data; // { items, totalAmount }
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to add to cart";
      message.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "/removeFromCart",
  async (courseId, thunkAPI) => {
    try {
      const { data } = await axios.delete(
        internShipUrl + `/cart/${courseId}`,
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      return data; // { items, totalAmount }
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to remove from cart";
      message.error(errMsg);
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

export const clearCart = createAsyncThunk("/clearCart", async (_, thunkAPI) => {
  try {
    const { data } = await axios.delete(internShipUrl + "/cart", {
      headers: { Authorization: `Bearer ${getLstorage("token")}` },
    });
    return data; // { items: [], totalAmount: 0 }
  } catch (error) {
    const errMsg =
      error.response?.data?.error ||
      error.response?.data?.err ||
      error.response?.data?.message ||
      error.message ||
      "Failed to clear cart";
    message.error(errMsg);
    return thunkAPI.rejectWithValue(errMsg);
  }
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;