import { studentUrl } from "@/utils/universalUtils/urls";
import { message } from "antd";
import axios from "axios";
import { getStudentsInDepartments } from "./getAllStudentsSlice";
import { GetToken } from "@/utils/universalUtils/token";
import { getLstorage } from "@/utils/universalUtils/windowMW";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const getAllDetailsSlice = createSlice({
  name: "getDetails",
  initialState: {
    singleStudent: {
      value: {},
      loading: false,
      error: null,
    },
    currentStudent: {
      id: "",
      userName: "",
    },
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
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
const token = GetToken();

export const getAllDetails = createAsyncThunk("getAllDetails", async (args) => {
  try {
    const { data } = await axios.get(`${studentUrl}/getSingleStudent/${args}`, {
      headers: {
        Authorization: `Bearer ${getLstorage("token") || token}`,
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
});
export const CreateStudentAccount = createAsyncThunk(
  "/createStudentAccount",
  async (args) => {
    const { dispatch, payload } = args;
    const hide = message.loading("Please wait while creating account", 0);
    try {
      const { data } = await axios.post(
        studentUrl + "/createStudentAccount",
        payload,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );

      if (data.msg) {
        message.success("Account created successfully!");
        dispatch(getStudentsInDepartments({ id: payload?.department }));
      }
      return data;
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create account";

      message.error(error?.response?.data?.err);
      console.log(error);
    } finally {
      hide();
    }
  }
);
export default getAllDetailsSlice.reducer;
