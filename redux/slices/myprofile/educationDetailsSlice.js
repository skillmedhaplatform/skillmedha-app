import { getLstorage } from "@/universalUtils/windowMW";
import { restUrl } from "@/config/urls";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const EducationSlice = createSlice({
  name: "EducationDetails",
  initialState: {
    education: [],
    allUnivercities: {},
    allColleges: {},
  },
  reducers: {
    setEducation(state, action) {
      state.education = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllUniversities.fulfilled, (state, action) => {
      state.allUnivercities = action.payload;
    });
    builder.addCase(fetchAllColleges.fulfilled, (state, action) => {
      state.allColleges = action.payload;
    });
  },
});

const token = getLstorage("token");
export const fetchAllUniversities = createAsyncThunk(
  "/fetchAllunivercities",
  async () => {
    try {
      const { data } = await axios.get(
        restUrl + "/getAllUniversities",
        {
          headers: {
            Authorization: `Bearer ` + token,
          },
        }
      );
      const transformedData = data?.data?.map((uni) => ({
        label: uni.university_name,
        value: uni.university_name,
        code: uni.university_code,
      }));

      return transformedData;
    } catch (error) {
      console.log(error);
    }
  }
);

export const fetchAllColleges = createAsyncThunk(
  "/fetchAllColleges",
  async (args) => {
    try {
      const { data } = await axios.get(
        restUrl + "/getColleges/" + args,
        {
          headers: {
            Authorization: `Bearer ` + token,
          },
        }
      );

      return data?.data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const { setEducation } = EducationSlice.actions;
export default EducationSlice.reducer;
