import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import _ from "lodash";

const TestsSlice = createSlice({
  name: "Tests",
  initialState: {
    value: [],
    singleTestStatus: {
      status: "",
      error: null,
    },
  },
  reducers: {
    updateTestValues: (state, action) => {
      state.test = { ...state.test, ...action.payload };
    },
  },
});

export const createTests = createAsyncThunk("/createTests", async (data) => {
  try {} catch (error) {}
});

export const getOneTests = createAsyncThunk("/getOneTests", async (data) => {
  try {} catch (error) {}
});

export const updateTest = createAsyncThunk("/updateTest", async (data) => {
  try {} catch (error) {}
});

export const { updateTestValues } = TestsSlice.actions;
export default TestsSlice.reducer;
