import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import axios from "axios";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const ResumeUploadSlice = createSlice({
  name: "ResumeUpload",
  initialState: {
    status: "",
  },
  reducers: {
    // changeCollapse: (state,{payload}) => {
    //     state.collapse = payload;
    // }
  },
  extraReducers: (builder) => {
    builder.addCase(uploadResume.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
  },
});

export const uploadResume = createAsyncThunk("/uploadResume", async (args) => {
  try {
    const { studentId } = args;

    const { data } = await axios.post(
      restUrl + "/createResume",
      {
        ...args.data,
      },
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log(error);
  }
});

// export const {changeCollapse} = ResumeUploadSlice.actions;

export default ResumeUploadSlice.reducer;
