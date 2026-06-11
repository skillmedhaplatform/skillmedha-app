import {
  getRandomStudent,
  SingleStudentGqlQuery,
} from "@/modules/testportal_admin/graphql_quries/studentQuery";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import {
  gqlUrl,
  restUrl,
  studentUrl,
} from "@/utils/universalUtils/urls";
import axios from "@/modules/testportal_admin/utils/axiosInstance";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const studentsSlice = createSlice({
  name: "Student",
  initialState: {
    studentVals: {},
    blockedStudents: {
      value: null,
      status: "pending",
      error: null,
    },
    publicStudent: {},
    departments: {
      value: [],
      status: "",
      error: "",
    },
    batches: {
      value: [],
      status: "",
      error: "",
    },
    getAllStudentsAgg: {
      value: [],
      status: "",
      error: "",
    },
  },
  reducers: {},
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
      state.studentVals = payload;
    });
    builder.addCase(getDepartments.pending, (state, action) => {
      state.departments.status = "pending";
      state.departments.value = [];
    });
    builder.addCase(getDepartments.fulfilled, (state, action) => {
      state.departments.status = "fulfilled";
      state.departments.value = action.payload;
    });
    builder.addCase(getBatches.pending, (state, action) => {
      state.batches.status = "pending";
      state.batches.value = [];
    });
    builder.addCase(getBatches.fulfilled, (state, action) => {
      state.batches.status = "fulfilled";
      state.batches.value = action.payload;
    });
    builder.addCase(getAllStudentsAgg.pending, (state, action) => {
      state.getAllStudentsAgg.status = "pending";
      state.getAllStudentsAgg.value = [];
    });
    builder.addCase(getAllStudentsAgg.fulfilled, (state, action) => {
      state.getAllStudentsAgg.status = "fulfilled";
      state.getAllStudentsAgg.value = action.payload;
    });
  },
});
export const getStudent = createAsyncThunk("/getOne", async (args) => {
  try {
    const { data } = await axios.post(gqlUrl, {
      query: SingleStudentGqlQuery,
      variables: { id: args.id },
    });

    return data.data.student;
  } catch (error) {
    console.log(error);
  }
});
export const getBlockedStudents = createAsyncThunk(
  "/getBlockedStudents",
  async (args) => {
    try {
      const data = await axios.post(
        studentUrl + "/blockedStudents/" + args?.testId,
        { studentId: args?.studentId }
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }
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
  }
);
export const getDepartments = createAsyncThunk("/GetDepartments", async () => {
  const { data } = await axios.get(restUrl + "/getalldepartments");
  return data?.data;
});

export const getBatches = createAsyncThunk("/getBatches", async (args) => {
  let url = studentUrl + "/batches";
  if (args.department) {
    url += `?department=${args.department}`;
  }
  const { data } = await axios.get(url);
  return data;
});

export const getAllStudentsAgg = createAsyncThunk(
  "/getAllStudentsAgg",
  async () => {
    let url = studentUrl + "/getAllStudentsAgg?";
    // if (args.department) {
    //   url += `department=${args.department}`;
    // }
    // if (args.batch) {
    //   url += `batch=${args.batch}`;
    // }
    const { data } = await axios.get(url);
    return data;
  }
);
export default studentsSlice.reducer;
