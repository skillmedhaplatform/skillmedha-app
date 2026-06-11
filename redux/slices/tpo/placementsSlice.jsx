import { GetToken } from "@/utils/universalUtils/token";
import { restUrl } from "@/utils/universalUtils/urls";
import {
  getLstorage,
  setLstorage,
  setSstorage,
} from "@/utils/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";

const PlacementsSlice = createSlice({
  name: "PlacementsSlice",
  initialState: {
    AllPlacements: {
      value: {},
      status: "idle",
      error: null,
    },
    OnePlacement: {
      value: {},
      status: "idle",
      error: null,
    },
    AllJobs: {
      value: {},
      status: "idle",
      error: null,
    },
    OneJob: {
      value: {},
      status: "idle",
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllPlacements.pending, (state) => {
        state.AllPlacements.status = "loading";
        state.AllPlacements.error = null;
      })
      .addCase(GetAllPlacements.fulfilled, (state, { payload }) => {
        state.AllPlacements.status = "succeeded";
        state.AllPlacements.value = payload;
      })
      .addCase(GetAllPlacements.rejected, (state, { error }) => {
        state.AllPlacements.status = "failed";
        state.AllPlacements.error = error.message;
      })
      .addCase(GetOnePlacement.pending, (state) => {
        state.OnePlacement.status = "loading";
        state.OnePlacement.error = null;
      })
      .addCase(GetOnePlacement.fulfilled, (state, { payload }) => {
        state.OnePlacement.status = "succeeded";
        state.OnePlacement.value = payload;
      })
      .addCase(GetOnePlacement.rejected, (state, { error }) => {
        state.OnePlacement.status = "failed";
        state.OnePlacement.error = error.message;
      })
      .addCase(GetAllJobs.pending, (state) => {
        state.AllJobs.status = "loading";
        state.AllJobs.error = null;
      })
      .addCase(GetAllJobs.fulfilled, (state, { payload }) => {
        state.AllJobs.status = "succeeded";
        state.AllJobs.value = payload;
      })
      .addCase(GetAllJobs.rejected, (state, { error }) => {
        state.AllJobs.status = "failed";
        state.AllJobs.error = error.message;
      })
      .addCase(GetOneJob.pending, (state) => {
        state.OneJob.status = "loading";
        state.OneJob.error = null;
      })
      .addCase(GetOneJob.fulfilled, (state, { payload }) => {
        state.OneJob.status = "succeeded";
        state.OneJob.value = payload;
      })
      .addCase(GetOneJob.rejected, (state, { error }) => {
        state.OneJob.status = "failed";
        state.OneJob.error = error.message;
      });
  },
});
// const baseurl =
//   "https://bernard-headphones-windsor-architect.trycloudflare.com";
const baseurl = restUrl;
const token = GetToken();

export const GetAllPlacements = createAsyncThunk(
  "/GetAllPlacements",
  async () => {
    try {
      const { data } = await axios.get(`${baseurl}/getAllJobProfiles`, {
        headers: {
          Authorization: `Bearer ${getLstorage("token") || token}`,
        },
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const CreateOnePlacement = createAsyncThunk(
  "/createJobProfile",
  async (args) => {
    try {
      const hideloading = message.loading("Creating Placement Drive");

      const { dispatch, payload } = args;
      const { data } = await axios.post(
        `${baseurl}/createJobProfile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      if (data) {
        hideloading();
        message.success("Created Placement Drive");
        dispatch(GetAllPlacements());
      }
      return data;
    } catch (error) {
      hideLoading();
      message.error("Failed to Create Placement Drive");
      console.log(error);
    }
  }
);

export const deleteJobProfile = createAsyncThunk(
  "/deleteJobProfile",
  async (args, { dispatch, rejectWithValue }) => {
    const hideloading = message.loading("Deleting Placement Drive", 0);
    try {
      const { profileId } = args;
      const { data } = await axios.post(
        `${baseurl}/deleteJobProfile/${profileId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );

      hideloading();
      message.success("Deleted Placement Drive");
      dispatch(GetAllPlacements());
      return data;
    } catch (error) {
      hideloading();
      message.error("Failed to delete Placement Drive");
      console.log(error);
      return rejectWithValue(
        error.response ? error.response.data : { message: "Unknown error" }
      );
    }
  }
);

export const GetOnePlacement = createAsyncThunk(
  "/getOneJobProfile",
  async (args) => {
    try {
      const { id } = args;
      const { data } = await axios.get(`${baseurl}/getOneJobProfile/${id}`, {
        headers: {
          Authorization: `Bearer ${getLstorage("token") || token}`,
        },
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const GetAllJobs = createAsyncThunk(
  "/getAllJobsBasedOnplacements",
  async (args) => {
    try {
      const { limit = 10, cursor = null, profileId } = args;
      const { data } = await axios.get(
        `${baseurl}/getAllJobsBasedOnplacements?limit=${limit}&cursor=${cursor}&profileId=${profileId}`,
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
export const GetOneJob = createAsyncThunk("/getOneJob", async (args) => {
  try {
    const { jobid } = args;
    const { data } = await axios.post(
      `${baseurl}/getOneJob/${jobid}`,
      {},
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
});

export const CreateJob = createAsyncThunk("/createAJob", async (args) => {
  try {
    const hideLoading = message.loading("Creating Job ...");
    const { dispatch, placementId, payload } = args;
    const { data } = await axios.post(
      `${baseurl}/createAJob/${placementId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token") || token}`,
        },
      }
    );
    if (data?.msg) {
      hideLoading();
      message.success("Job Created");
      setSstorage("jobid", data?.insertedId);
      await dispatch(GetOneJob({ jobid: data?.insertedId }));
    }
    return data;
  } catch (error) {
    hideLoading();
    message.error("Error Creating Job ");
    console.log(error);
  }
});
export const UpdateJob = createAsyncThunk("/updateAJob", async (args) => {
  try {
    const hideLoading = message.loading("Updatingting Job ...");
    const { dispatch, jobid, payload } = args;
    const { _id, ...sanitizedPayload } = payload;
    const { data } = await axios.post(
      `${baseurl}/updateAJob/${jobid}`,
      sanitizedPayload,
      {
        headers: {
          Authorization: `Bearer ${getLstorage("token") || token}`,
        },
      }
    );
    if (data?.msg) {
      hideLoading();
      message.success("Job Updated");
      await dispatch(GetOneJob({ jobid }));
    }
    return data;
  } catch (error) {
    hideLoading();
    message.error("Error Updating Job ");
    console.log(error);
  }
});

export const {} = PlacementsSlice.actions;
export default PlacementsSlice.reducer;
