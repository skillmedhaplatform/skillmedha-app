import { restUrl, studentUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";

const userSlice = createSlice({
  name: "Users",
  initialState: {
    singleUser: {},
    singleStudent: {
      value: {},
      loading: false,
      error: null,
    },
    userDetails: {
      value: {},
      loading: false,
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOneUser.fulfilled, (state, { payload }) => {
        state.singleUser = payload;
      })
      .addCase(getAllDetails.pending, (state) => {
        state.singleStudent.loading = true;
        state.singleStudent.error = null;
      })
      .addCase(getAllDetails.fulfilled, (state, action) => {
        state.singleStudent.loading = false;
        state.singleStudent.value = action.payload;
      })
      .addCase(getAllDetails.rejected, (state, action) => {
        state.singleStudent.loading = false;
        state.singleStudent.error = action.error;
      });
  },
});

export const getOneUser = createAsyncThunk("/getOneUser", async (args) => {
  try {
    const token = getLstorage("token");

    const { data } = await axios.get(restUrl + "/getCompany", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { ...data.data, orgDetails: data?.orgDetails };
  } catch (error) {
    console.log(error);
  }
});

export const getAllDetails = createAsyncThunk("getAllDetails", async (args) => {
  try {
    const { data } = await axios.get(
      `${studentUrl}/getStudentByGlobalIdAndOrgId?globalId=${args?.globalId}&sourceOrgId=${args?.sourceOrgId}&includeJobs=true`
    );
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
});

export const UpdateUser = createAsyncThunk("/UpdateUser", async (args) => {
  const { payload, dispatch } = args;
  const token = getLstorage("token");
  const hide = message.loading("Updating user details...", 0);

  try {
    const { data } = await axios.post(`${restUrl}/updateCompany`, payload, {
      headers: {
        Authorization: `Bearer ${getLstorage("token") || token}`,
      },
    });

    hide();
    if (data?.msg) {
      dispatch(getOneUser());
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
export const { } = userSlice.actions;
export default userSlice.reducer;
