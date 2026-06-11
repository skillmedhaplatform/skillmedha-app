import { SingleStudentGqlQuery } from "@/graphql_quries/studentQuery";
import {
  studentUrl,
} from "@/config/urls";
import {
  setLstorage,
  getSstorage,
  getLstorage,
} from "@/universalUtils/windowMW";
import { message } from "antd";
import axios from "axios";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const studentSlice = createSlice({
  name: "Student",
  initialState: {
    testResults: {
      value: {},
      loginCreds: {},
      studentVals: {},
    },
    testStatus: "",
  },
  reducers: {
    saveTestResults: (state, action) => {
      state.testResults.value[action.payload.testId] = action.payload;
    },
    updateTestStatus: (state, action) => {
      state.testStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginStudent.fulfilled, (state, { payload }) => {
      state.loginCreds = payload;
    });
  },
});
const headerVal = getSstorage("head");

export const loginStudent = createAsyncThunk("/loginStudent", async (args) => {
  try {
    const { data } = await axios.post(studentUrl + "/studentLogin", args, {
      headers: {
        user: headerVal,
      },
    });
    if (data?.token) {
      setLstorage("sId", data?.userID);
      setLstorage("token", data?.token);
    }
    return data;
  } catch (error) {
    console.log(error);
  }
});

export const { saveTestResults, updateTestStatus } = studentSlice.actions;

export default studentSlice.reducer;
