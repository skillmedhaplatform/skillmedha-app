import { GetToken } from "@/utils/universalUtils/token";
import { restUrl, studentUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";

const DashboardSlice = createSlice({
  name: "DashboardSlice",
  initialState: {
    AllStudents: {
      value: {},
      status: "",
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllStudents.pending, (state) => {
        state.AllStudents.status = "loading";
        state.AllStudents.error = null;
      })
      .addCase(getAllStudents.fulfilled, (state, { payload }) => {
        state.AllStudents.status = "succeeded";
        state.AllStudents.value = payload;
      })
      .addCase(getAllStudents.rejected, (state, { error }) => {
        state.AllStudents.status = "failed";
        state.AllStudents.error = error.message;
      });
  },
});

export const getAllStudents = createAsyncThunk(
  "/getAllStudents",
  async (args, { dispatch }) => {
    // const hideloading = message.loading("Fetching Students...", 0);
    try {
      const { data } = await axios.get(`${studentUrl}/getAllStudentsAgg`, {
        headers: {
          Authorization: `Bearer ${getLstorage("token") || args?.token}`,
        },
      });
      //   message.success("Students fetched successfully!");
      return data;
    } catch (error) {
      message.error("Failed to fetch students.");
      throw error;
    } finally {
      //   hideloading();
    }
  }
);

export default DashboardSlice.reducer;
