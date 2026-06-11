import { allStudentsQuery, singleStudent } from "@/modules/testportal_admin/graphql_quries/students";
import {
  gqlUrl,
  restUrl,
  studentUrl,
  testUrl as testsUrl,
} from "@/utils/universalUtils/urls";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import _ from "lodash";
import { getTests } from "./test";

const studentSlice = createSlice({
  name: "Students",
  initialState: {
    allStudents: [],
    student: {},
    status: "",
    error: "",
    blockedStudent: {
      value: {},
      status: "",
      error: "",
    },
    unblockedStudent: {
      value: {},
      status: "",
      error: "",
    },
    serchedStudent: {
      value: [],
      status: "",
      error: "",
    },
    UserDetails: {
      value: {},
      status: "idle",
      error: null,
    },
  },
  reducers: {
    clearSearchStudent: (state, action) => {
      state.serchedStudent.value = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllStudents.pending, (state) => {
      state.status = "pending";
    });
    builder.addCase(getAllStudents.fulfilled, (state, { payload }) => {
      state.allStudents = payload;
      state.status = "fulfilled";
    });
    builder.addCase(getStudent.fulfilled, (state, { payload }) => {
      state.student = payload;
    });
    builder.addCase(createStudent.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
    builder.addCase(BlockStudent.pending, (state, action) => {
      state.blockedStudent.status = "pending";
      state.blockedStudent.value = null;
    });
    builder.addCase(BlockStudent.fulfilled, (state, action) => {
      state.blockedStudent.status = "fulfilled";
      state.blockedStudent.value = action.payload;
    });
    builder.addCase(BlockStudent.rejected, (state, action) => {
      state.blockedStudent.status = "rejected";
      state.blockedStudent.value = null;
      state.blockedStudent.error = action.error;
    });
    builder.addCase(UnBlockStudent.pending, (state, action) => {
      state.unblockedStudent.status = "pending";
      state.unblockedStudent.value = null;
    });
    builder.addCase(UnBlockStudent.fulfilled, (state, action) => {
      state.unblockedStudent.status = "fulfilled";
      state.unblockedStudent.value = action.payload;
    });
    builder.addCase(UnBlockStudent.rejected, (state, action) => {
      state.unblockedStudent.status = "rejected";
      state.unblockedStudent.value = null;
      state.unblockedStudent.error = action.error;
    });
    builder.addCase(searchStudent.pending, (state, action) => {
      state.serchedStudent.status = "pending";
    });
    builder.addCase(searchStudent.fulfilled, (state, action) => {
      state.serchedStudent.status = "fulfilled";
      state.serchedStudent.value = action.payload;
    });
  },
});

export const getAllStudents = createAsyncThunk("/allStudents", async (args) => {
  try {
    const { data } = await axios.post(gqlUrl, {
      query: allStudentsQuery,
    });

    return data?.data?.students || [];
  } catch (error) {
    console.log(error);
  }
});

export const getStudent = createAsyncThunk("/getStudent", async (args) => {
  try {
    const { data } = await axios.post(gqlUrl, {
      query: singleStudent,
      variables: {
        id: args,
      },
    });

    return data?.data?.student || {};
  } catch (error) {
    console.log(error);
  }
});

export const createStudent = createAsyncThunk(
  "/createStudent",
  async (args) => {
    const { dispatch } = args;
    try {
      const { data } = await axios.post(
        studentUrl + "/createStudentAccount",
        args,
      );

      if (data?.msg == "Account created successfully") {
        message.destroy();
        message.success("Student created successfully");
        dispatch(getAllStudents());
        return data?.msg;
      } else {
        message.error("Failed to create student account");
      }
    } catch (error) {
      console.log(error);
    }
  },
);

export const BlockStudent = createAsyncThunk("/BlockStudent", async (args) => {
  const load = message.loading(<strong>Test is Blocking </strong>);
  const { dispatch } = args;
  try {
    const { data } = await axios.post(
      testsUrl + "/blockedStudents/" + args?.testId,
      { studentId: args?.studentId },
    );

    if (data.msg) {
      dispatch(getTests({ cursor: null, limit: 100 })).then(() => {
        load();
        message.success(<strong>Test Blocked Successfully</strong>);
      });
    }
    return data;
  } catch (error) {
    console.log(error);
  }
});
export const UnBlockStudent = createAsyncThunk(
  "/unblockedStudents",
  async (args) => {
    const load = message.loading(<strong>Test is Unblocking </strong>);
    const { dispatch } = args;
    try {
      const { data } = await axios.post(
        testsUrl + "/unblockedStudents/" + args?.testId,
        { studentId: args?.studentId },
      );
      if (data.msg) {
        dispatch(getTests({ cursor: null, limit: 100 })).then(() => {
          load();
          message.success(<strong>Test Unblocked Successfully</strong>);
        });
      }
      return data;
    } catch (error) {
      console.log(error);
    }
  },
);

export const searchStudent = createAsyncThunk(
  "/searchStudents",
  async (args) => {
    try {
      const { data } = await axios.get(
        testsUrl + `/searchStudent?text=${args.text}`,
      );
      if (!data.length) {
        message.error(<strong> Student not found</strong>);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
);

export const { clearSearchStudent } = studentSlice.actions;
export default studentSlice.reducer;
