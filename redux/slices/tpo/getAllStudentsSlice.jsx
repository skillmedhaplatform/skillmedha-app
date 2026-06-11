import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { restUrl, studentUrl } from "@/utils/universalUtils/urls";
import axios from "axios";
import { message } from "antd";
import { getAllDetails } from "./getAllDetailsSlice";
import { GetToken } from "@/utils/universalUtils/token";
import { getAllDepartments } from "./departmentSlice";

const getAllStudentsSlice = createSlice({
  name: "All Students",
  initialState: {
    allStudents: {
      value: {},
      loading: false,
      error: null,
    },
    status: "",
  },

  reducers: {
    removeAllStudents: (state, { payload }) => {
      state.allStudents.value = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllStudents.pending, (state) => {
        state.allStudents.loading = true;
        state.allStudents.error = null;
      })
      .addCase(getAllStudents.fulfilled, (state, action) => {
        state.allStudents.loading = false;
        state.allStudents.value = action.payload;
      })
      .addCase(getStudentsInDepartments.fulfilled, (state, action) => {
        state.allStudents.loading = false;
        state.allStudents.value = action.payload;
      })
      .addCase(getStudentsWithoutValidDepartment.fulfilled, (state, action) => {
        state.allStudents.loading = false;
        state.allStudents.value = action.payload;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.status = action.payload;
      })
      .addCase(getAllStudents.rejected, (state, action) => {
        state.allStudents.loading = false;
        state.allStudents.error = action.error;
      });
  },
});
const token = GetToken();
const getLstorage = (name) => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(name);
  }
};

export const getAllStudents = createAsyncThunk(
  `getAllStudents`,
  async (args) => {
    const { data } = await axios.get(
      studentUrl + `/getAllStudents?limit=${args.limit}&cursor=${args.cursor}`,
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token") || token}`,
        },
      }
    );
    return data;
  }
);

export const getStudentsInDepartments = createAsyncThunk(
  "/getStudentsInDepartmentss",
  async (args) => {
    try {
      const { id } = args;

      const { data } = await axios.get(
        restUrl + "/getStudentsInDepartments/" + id,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );

      return data?.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getStudentsWithoutValidDepartment = createAsyncThunk(
  "getStudentsWithoutValidDepartment",
  async (args) => {
    try {
      const { data } = await axios.get(
        restUrl + "/getStudentsWithoutValidDepartment",
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const updateStudent = createAsyncThunk(
  "/updateStudent",
  async (args, thunkAPI) => {
    const hide = message.loading("Please wait while updating details", 0);
    const { dispatch } = thunkAPI;
    const { _id, ...payload } = args.aboutDetails ?? {};
    const departId = args?.departmentId ?? "";

    try {
      const { data } = await axios.post(
        studentUrl + "/updateStudentWithId/" + _id,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );

      if (data) {
        message.success("Student updated successfully");
        dispatch(getAllDetails(_id));
        if (departId) {
          dispatch(getStudentsInDepartments({ id: departId }));
        }
      }
      return data;
    } catch (error) {
      message.error("Failed update details");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const DeleteStudentAccount = createAsyncThunk(
  "/deleteStudentAccount",
  async ({ globalId, dapartment, dispatch }) => {
    const hide = message.loading("Deleting student...", 0);
    try {
      const { data } = await axios.post(
        `${studentUrl}/deleteStudent/${globalId}`,
        { departmentId: dapartment },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );

      if (data.msg) {
        hide();
        message.success("Student deleted successfully!");
        dispatch(getStudentsInDepartments({ id: dapartment }));
      }
      return data;
    } catch (error) {
      hide();
      message.error("Failed to delete student");
      console.error(error);
    } finally {
      hide();
    }
  }
);
export const deleteAllStudents = createAsyncThunk(
  "/deleteAllStudents",
  async ({ departmentId, dispatch }, { rejectWithValue }) => {
    const hide = message.loading("Deleting all students...", 0);
    try {
      const { data } = await axios.post(
        `${studentUrl}/deleteAllStudent/${departmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );

      if (data.msg) {
        hide();
        message.success("All students deleted successfully!");
        dispatch(getStudentsInDepartments({ id: departmentId }));
        dispatch(getAllDepartments());
      }
      return data;
    } catch (error) {
      hide();
      message.error("Failed to delete all students");
      console.error(error);
      return rejectWithValue(
        error.response ? error.response.data : { message: "Unknown error" }
      );
    }
  }
);

// deleteAllStudents/departmentId
export const { removeAllStudents } = getAllStudentsSlice.actions;
export default getAllStudentsSlice.reducer;
