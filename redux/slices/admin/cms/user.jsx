import { gqlUrl, internshipUrl, restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";

const userSlice = createSlice({
  name: "Users",
  initialState: {
    singleUser: {},
    orgs: [],
    status: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getOneUser.fulfilled, (state, { payload }) => {
      state.singleUser = payload;
    });
    builder.addCase(getAllOrgs.fulfilled, (state, { payload }) => {
      state.orgs = payload;
    });
    builder.addCase(assignCourseToOrgs.fulfilled, (state, { payload }) => {
      state.status = payload;
    });
  },
});

export const getOneUser = createAsyncThunk("/getOneUser", async (args) => {
  try {
    const token = getLstorage("token");

    const { data } = await axios.get(restUrl + "/getUser", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data.data;
  } catch (error) {
    console.log(error);
  }
});

export const getAllOrgs = createAsyncThunk(
  "/getAllOrganisations",
  async (args) => {
    try {
      const { data } = await axios.get(restUrl + "/getAllOrganisations", {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const assignCourseToOrgs = createAsyncThunk(
  "/assignCourseToOrgs",
  async (args) => {
    const hide = message.loading(
      "Please wait while assigning courses to organisations",
      0
    );
    try {
      const { data } = await axios.post(
        internshipUrl + "/assignCourseToOrgs",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("jwtToken")}`,
          },
        }
      );
      message.success("Courses assigned to given organisations successfully");
      return data;
    } catch (error) {
      hide();
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const assignInternshipToOrgs = createAsyncThunk(
  "/assignInternshipToOrgs",
  async (args) => {
    const hide = message.loading(
      "Please wait while assigning Internships to organisations",
      0
    );
    try {
      const { data } = await axios.post(
        internshipUrl + "/assignInternshipToOrgs",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("jwtToken")}`,
          },
        }
      );
      message.success(
        "Internships assigned to given organisations successfully"
      );
      return data;
    } catch (error) {
      hide();
      console.log(error);
    } finally {
      hide();
    }
  }
);
export const {} = userSlice.actions;
export default userSlice.reducer;
