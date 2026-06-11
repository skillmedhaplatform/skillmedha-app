import {
  getRandomStudent,
  SingleStudentGqlQuery,
} from "@/app/testportal/graphQl/studentQuery";
import { getLstorage, setSstorage } from "@/app/testportal/utils/storageMiddleware";
import { gqlUrl, awsUrl, studentUrl } from "@/app/testportal/utils/urls";
import axios from "axios";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const studentSlice = createSlice({
  name: "Student",
  initialState: {
    studentVals: {},
    blockedStudents: {
      value: null,
      status: "pending",
      error: null,
    },
    publicStudent: {},
    testResults: {},
  },
  reducers: {
    saveTestResults: (state, action) => {
      state.testResults[action?.payload?.testId] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getStudent.fulfilled, (state, { payload }) => {
      state.studentVals = payload;
    });
    builder.addCase(getBlockedStudents.pending, (state, action) => {
      state.blockedStudents.status = "pending";
      state.blockedStudents.value = null;
      state.blockedStudents.error = null;
    });
    builder.addCase(getBlockedStudents.fulfilled, (state, action) => {
      state.blockedStudents.status = "fulfilled";
      state.blockedStudents.value = action.payload;
      state.blockedStudents.error = null;
    });
    builder.addCase(getBlockedStudents.rejected, (state, action) => {
      state.blockedStudents.status = "rejected";
      state.blockedStudents.value = null;
      state.blockedStudents.error = action.error;
    });
    builder.addCase(getPublicStudent.fulfilled, (state, { payload }) => {
      state.studentVals = { ...payload, ranStu: true };
    });
  },
});
// export const getStudent = createAsyncThunk("/getOne", async (args) => {
//   try {
//     const { data } = await axios.post(gqlUrl, {
//       query: SingleStudentGqlQuery,
//       variables: { id: args.id },
//     });

//     return data.data.student;
//   } catch (error) {
//     console.log(error);
//   }
// });

export const getStudent = createAsyncThunk("/getStudentCredss", async () => {
  try {
    const { data } = await axios.get(studentUrl + "/getStudentCreds", {
      headers: {
        Authorization: `Bearer ${getLstorage("token")}`,
      },
    });

    // setSstorage("studentId", data?.data?._id);

    return data;
  } catch (error) {
    console.log(error);
  }
});
export const getBlockedStudents = createAsyncThunk(
  "/getBlockedStudents",
  async (args) => {
    try {
      const data = await axios.post(
        awsUrl + "/assessments/blockedStudents/" + args?.testId,
        { studentId: args?.studentId },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        },
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  },
);

export const getPublicStudent = createAsyncThunk(
  "/getPublicStudent",
  async (args) => {
    try {
      const {
        data: {
          data: { randomStudent },
        },
      } = await axios.post(gqlUrl, {
        query: getRandomStudent,
        variables: { id: args.id },
      });
      return randomStudent;
    } catch (error) {
      console.log(error);
    }
  },
);

export const { saveTestResults } = studentSlice.actions;
export default studentSlice.reducer;
