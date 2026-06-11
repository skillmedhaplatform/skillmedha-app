import {
  getSingleCourseQuery,
  coursesQuery,
} from "@/graphql_quries/assessments";
import { assessment_gql_url } from "@/config/urls";
import { getSstorage, getLstorage } from "@/universalUtils/windowMW";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const courseSlice = createSlice({
  name: "Course",
  initialState: {
    value: [],
    course: {},
    status: "",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCourses.fulfilled, (state, action) => {
      state.value = action.payload;
      state.status = "fulfilled";
    });
    builder.addCase(getSingleCourse.fulfilled, (state, action) => {
      state.course = action.payload;
    });
  },
});


export const getCourses = createAsyncThunk("/getCourses", async (action) => {
  const response = await axios.post(
    assessment_gql_url,
    {
      query: coursesQuery,
    },
    {
      headers: {
        Authorization: `Bearer ${getLstorage("token")}`,
      },
    }
  );

  return response.data.data.courses;
});

export const getSingleCourse = createAsyncThunk(
  "/getSingleCourse",
  async (args) => {
    const { data } = await axios.post(
      assessment_gql_url,
      {
        query: getSingleCourseQuery,
        variables: { courseId: args._id },
      },
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      }
    );

    return data.data.course;
  }
);

export default courseSlice;
