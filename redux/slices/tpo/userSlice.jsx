import { restUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";

const UserSlice = createSlice({
  name: "User Slice",
  initialState: {
    UserDetails: {
      value: {},
      status: "idle",
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetOneUser.pending, (state) => {
        state.UserDetails.status = "pending";
        state.UserDetails.error = null;
      })
      .addCase(GetOneUser.fulfilled, (state, { payload }) => {
        state.UserDetails.status = "fulfilled";
        state.UserDetails.value = payload;
      })
      .addCase(GetOneUser.rejected, (state, { error }) => {
        state.UserDetails.status = "rejected";
        state.UserDetails.error = error.message;
      });
  },
});

export const GetOneUser = createAsyncThunk("/getOneUser", async (args) => {
  try {
    const token = getLstorage("token");
    const { data } = await axios.get(`${restUrl}/getTpo`, {
      headers: {
        Authorization: `Bearer ${getLstorage("token") || token}`,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

export const UpdateUser = createAsyncThunk("/UpdateUser", async (args) => {
  const { payload, dispatch } = args;
  const token = getLstorage("token");
  const hide = message.loading("Updating user details...", 0);

  try {
    const { data } = await axios.post(`${restUrl}/updateTpo`, payload, {
      headers: {
        Authorization: `Bearer ${getLstorage("token") || token}`,
      },
    });

    hide();
    if (data?.msg) {
      dispatch(GetOneUser());
      message.success(data.msg || "User updated successfully");
    } else {
      message.warning("Update completed, but no message returned.");
    }

    return data;
  } catch (error) {
    hide();
    message.error("Failed to update user. Please try again.");
    console.error("UpdateUser Error:", error);
    throw error;
  }
});
export const {} = UserSlice.actions;
export default UserSlice.reducer;
