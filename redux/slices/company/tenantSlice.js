import { restUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import axios from "axios";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const tenantSlice = createSlice({
  name: "Teanat Slice",
  initialState: {
    tenants: {
      value: [],
      error: null,
      status: "pending",
    },
    assignedAssessment: {
      value: {},
      error: null,
      status: "pending",
    },
  },
  reducers:{},
  extraReducers:builder => {
    builder.addCase(getAllTenants.fulfilled,(state,action) => {
        state.tenants.value = action.payload
    })
    builder.addCase(handleAssignAssessment.fulfilled,(state,action) => {
        state.assignedAssessment.value = action.payload
    })
  }
});

export const getAllTenants = createAsyncThunk(
  "/getAllTenants",
  async (args) => {
    const token = getLstorage("token");
    let url = restUrl + "/getAllTenants";
    if (args?.type) url += "?type=" + args?.type;
    const { data } = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return data;
  }
);

export const handleAssignAssessment = createAsyncThunk("/assignAssessMent", async(args) => {
    const token = getLstorage("token");
    const {data }= await axios.post(restUrl+"/assignAssessmentToTenant", args,{
        headers: {
            Authorization: "Bearer "+token
        }
    })
    return data;
})

export default tenantSlice;
