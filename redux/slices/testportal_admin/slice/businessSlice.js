import { getBusinessQuery } from "@/modules/testportal_admin/graphql_quries/business";
import { gqlUrl } from "@/utils/universalUtils/urls";
import axios from "@/modules/testportal_admin/utils/axiosInstance";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const BusinessSlice = createSlice({
  name: "Business",
  initialState: {
    value: {
      data: {
        integrations: [{}],
      },
      status: "pending",
      error: "null",
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBusiness.pending, (state, action) => {
      state.value.data = {};
      state.value.status = "pending";
      state.value.error = null;
    });
    builder.addCase(fetchBusiness.fulfilled, (state, action) => {
      state.value.data = action.payload;
      state.value.status = "fulfilled";
      state.value.error = null;
    });
    builder.addCase(fetchBusiness.rejected, (state, action) => {
      state.value.data = {};
      state.value.status = "rejected";
      state.value.error = action.error;
    });
  },
});

export const fetchBusiness = createAsyncThunk("business/fetch", async (arg) => {
  const { data } = await axios.post(gqlUrl,
    {
      variables: { businessId: arg.businessId },
      query: getBusinessQuery,
    }
  );
  return data.data.business;
});

export default BusinessSlice.reducer;
