import { SingleStudentGqlQuery } from "@/graphql_quries/studentQuery";
import { singleStudent } from "@/graphql_quries/students";
import {
  assessment_gql_url,
  gqlUrl,
  restUrl,
  studentUrl,
} from "@/config/urls";
import {
  getLstorage,
  getSstorage,
  refreshWindow,
  setLstorage,
  setSstorage,
  clearLstorageVals,
  clearSstorageVals,
} from "@/universalUtils/windowMW";
import { message } from "antd";
import axios from "axios";
import { resetTests } from "./assessmentsSlice/testSlice";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const studentSlice = createSlice({
  name: "Student",
  initialState: {
    student: {},
    status: "",
    testResults: {
      value: {},
      loginCreds: {},
      studentVals: {},
    },
    testStatus: "",
  },
  reducers: {
    resetStudent: (state, { payload }) => {
      state.student = {};
    },
    saveTestResults: (state, action) => {
      state.testResults.value[action.payload.testId] = action.payload;
    },
    updateTestStatus: (state, action) => {
      state.testStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginStudent.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
    builder.addCase(getStudentDetails.fulfilled, (state, { payload }) => {
      state.student = payload;
    });
    builder.addCase(CreateStudentAccount.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
    builder.addCase(getStudentCreds.fulfilled, (state, { payload }) => {
      state.student = payload;
    });
    builder.addCase(getStudent.fulfilled, (state, { payload }) => {
      state.studentVals = payload;
    });
  },
});



export const loginStudent = createAsyncThunk(
  "/login",
  async (args, { dispatch, rejectWithValue }) => {
    const hide = message.loading("Logging you in…", 0);
    try {
      const { nav } = args;
      const { data } = await axios.post(gqlUrl + "/login", args.body);
      const { userID, token } = data;

      setLstorage("token", token);
      setLstorage("sId", userID);

      // Fetch the REAL verified value before setting the cookie.
      // This ensures middleware sees the correct ev value and blocks
      // unverified users BEFORE any page content renders (no flash/leak).
      const credsResult = await dispatch(getStudentCreds());
      const studentData = credsResult?.payload?.data || credsResult?.payload;
      const verified = studentData?.verified === true;
      const isSpecialOrg = studentData?.orgDetails?.orgId === process.env.NEXT_PUBLIC_SPECIAL_ORG_ID;
      const psychometricDone =
        Array.isArray(studentData?.psychometricTestResults) &&
        studentData.psychometricTestResults.length > 0;

      // Set both cookies with the real verified value and special org status
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, verified, isSpecialOrg, psychometricDone }),
      });

      message.destroy();
      message.success("Login successful!");

      // Clear previous student's cached tests before navigating
      dispatch(resetTests());

      if (isSpecialOrg) {
        nav.replace("/student/tests");
      } else {
        nav.replace("/dashboard");
      }
      return data;
    } catch (error) {
      message.destroy();
      const errMsg =
        error?.response?.data?.err ||
        "Login failed. Please check your credentials and try again.";
      message.error(errMsg);
      return rejectWithValue(errMsg);
    } finally {
      hide();
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "/forget",
  async (email, { rejectWithValue }) => {
    const hide = message.loading("verifying email");
    try {
      const { data } = await axios.post(`${gqlUrl}/forgotStudentPassword`, {
        ...email,
      });
      hide();
      message.success(
        "Password reset instructions have been sent to your email."
      );

      return data;
    } catch (error) {
      hide();
      message.error(
        "Failed to send password reset instructions. Please try again."
      );
      console.error("forgotPassword error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resendVerifyEmail = createAsyncThunk(
  "/resendVerifyEmail",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        studentUrl + "/resendVerifyEmail",
        {},
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const CreateStudentAccount = createAsyncThunk(
  "/createStudentAccount",
  async (args) => {
    const hide = message.loading("Please wait while creating account", 0);
    try {
      const { nav } = args;
      const { data } = await axios.post(
        studentUrl + "/registerStudent",
        args.data
      );

      if (data.msg) {
        message.success(
          "Account created successfully! A verification email has been sent to your address. Please check your inbox (and spam folder) to verify your account."
        );

        nav.replace("/login");
      }
      return data;
    } catch (error) {
      message.success("failed to create account");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const updateStudent = createAsyncThunk(
  "/updateStudent",
  async (args) => {
    const hide = message.loading("Please wait while updating details", 0);
    const { dispatch } = args;

    const { _id = "", email, ...payload } = args.aboutDetails;

    try {
      const { data } = await axios.post(
        studentUrl + "/updateStudent",
        { ...payload },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      if (data) {
        message.success("Student updated successfully");
        // dispatch(getStudentCreds());
      }
      return data;
    } catch (error) {
      message.error("Failed update details");
    } finally {
      hide();
    }
  }
);

export const getStudentCreds = createAsyncThunk(
  "/getStudentCredss",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(studentUrl + "/getStudentCreds", {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      setSstorage("studentId", data?.data?._id);
      return data;
    } catch (error) {
      console.log(error);

      // Clear local & session storage
      clearLstorageVals();
      clearSstorageVals();

      // Delete httpOnly cookies via the API route (JS cannot touch httpOnly cookies directly)
      await fetch("/api/auth/session", { method: "DELETE" });

      // Signal to the calling component to redirect via the Next.js router
      return rejectWithValue({ authError: true });
    }
  }
);

export const getStudentDetails = createAsyncThunk(
  "/getStudentDetails",
  async (args, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(gqlUrl, {
        query: singleStudent,
        variables: {
          singleStudentId: getLstorage("sId"),
        },
      });

      if (data.errors) {
        throw new Error(data.errors[0]?.message || "Failed to fetch student details");
      }

      return data.data.singleStudent;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message);
    }
  }
);

export const getStudent = createAsyncThunk("/getOne", async (args) => {
  try {
    const { data } = await axios.post(
      assessment_gql_url,
      {
        query: SingleStudentGqlQuery,
        variables: { id: args?.id || getSstorage("studentId") },
      },
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      }
    );

    return data.data.student;
  } catch (error) {
    console.log(error);
  }
});

export const saveStudentNotes = createAsyncThunk(
  "/saveStudentNotes",
  async (args, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        studentUrl + "/saveStudentNotes",
        args,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getStudentNotes = createAsyncThunk(
  "/getStudentNotes",
  async (args, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        studentUrl + "/getStudentNotes",
        {
          params: args,
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStudentNote = createAsyncThunk(
  "/updateStudentNote",
  async ({ noteId, notesdescription }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${studentUrl}/updateStudentNote/${noteId}`,
        { notesdescription },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteStudentNote = createAsyncThunk(
  "/deleteStudentNote",
  async (noteId, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `${studentUrl}/deleteStudentNote/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const { resetStudent, saveTestResults, updateTestStatus } =
  studentSlice.actions;

export default studentSlice.reducer;
