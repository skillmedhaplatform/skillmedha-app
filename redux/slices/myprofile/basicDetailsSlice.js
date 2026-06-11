import { getLstorage } from "@/universalUtils/windowMW";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const basicDetailsSlice = createSlice({
  name: "Basic Details",
  initialState: {
    value: {
      about: [
        {
          label: "First Name :",
          value: "",
          type: "text",
          placeholder: "Enter your first name",
          key: "firstName",
        },
        {
          label: "Middle Name :",
          value: "",
          type: "text",
          placeholder: "Enter your middle name",
          key: "middleName",
        },
        {
          label: "Last Name (Surname) :",
          value: "",
          type: "text",
          placeholder: "Enter your Last name",
          key: "lastName",
        },
        {
          label: "Date of Birth :",
          value: "",
          type: "date",
          placeholder: "Select your date of birth",
          key: "DOB",
        },
        {
          label: "Gender :",
          value: "",
          type: "select",
          placeholder: "Enter your gender",
          key: "gender",
          data: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "transgender", label: "Transgender" },
            { value: "nm", label: "Prefer Not to Say" },
          ],
        },
        {
          label: "Phone :",
          value: "",
          type: "phone",
          placeholder: "+91 1234567890",
          key: "phone",
        },
        {
          label: "Alternate Phone :",
          value: "",
          type: "alternatePhone",
          placeholder: "+91 1234567890",
          key: "alternatePhone",
        },
        {
          label: "Email :",
          value: "",
          type: "email",
          placeholder: "Enter email",
          key: "email",
        },
        {
          label: "Current/Latest College :",
          value: "",
          type: "select&add",
          placeholder: "Enter your college name",
          key: "collegeName",
        },
      ],
      professionalSummary: "",
      address: {
        permanentAddress: [
          {
            label: "Door No :",
            value: "",
            type: "text",
            placeholder: "1-2-3",
            key: "doorNo",
          },
          {
            label: "Street :",
            value: "",
            type: "text",
            placeholder: "Street Name",
            key: "streetName",
          },
          {
            label: "Landmark :",
            value: "",
            type: "text",
            placeholder: "Near Temple",
            key: "landMark",
          },
          {
            label: "Area :",
            value: "",
            type: "text",
            placeholder: "Area Name",
            key: "areaName",
          },
          {
            label: "Pincode :",
            value: "",
            type: "number",
            placeholder: "123456",
            key: "pincode",
          },
          {
            label: "City :",
            value: "",
            type: "text",
            placeholder: "City Name",
            key: "cityName",
          },
          {
            label: "District :",
            value: "",
            type: "text",
            placeholder: "district Name",
            key: "districtName",
          },
          {
            label: "State :",
            value: "",
            type: "text",
            placeholder: "State Name",
            key: "stateName",
          },
        ],
        currentAddress: [
          {
            label: "Door No :",
            value: "",
            type: "text",
            placeholder: "1-2-3",
            key: "doorNo",
          },
          {
            label: "Street :",
            value: "",
            type: "text",
            placeholder: "Street Name",
            key: "streetName",
          },
          {
            label: "Landmark :",
            value: "",
            type: "text",
            placeholder: " Near Temple",
            key: "landMark",
          },
          {
            label: "Area :",
            value: "",
            type: "text",
            placeholder: "Area Name",
            key: "areaName",
          },
          {
            label: "Pincode :",
            value: "",
            type: "number",
            placeholder: "123456",
            key: "pincode",
          },
          {
            label: "City :",
            value: "",
            type: "text",
            placeholder: "City Name",
            key: "cityName",
          },
          {
            label: "District :",
            value: "",
            type: "text",
            placeholder: "district Name",
            key: "districtName",
          },
          {
            label: "State :",
            value: "",
            type: "text",
            placeholder: "State Name",
            key: "stateName",
          },
        ],
      },

      placementEnrollment: [
        {
          startDate: "Apr 2020",
          endDate: "Jun 2020",
          companyName: "Innovatech Pvt Ltd",
          status: "Enrolment Closed",
          action: "View Details",
        },
        {
          startDate: "Jul 2020",
          endDate: "Sep 2020",
          companyName: "GlobalSoft",
          status: "Dropped",
          action: "View Details",
        },
        {
          startDate: "Nov 2019",
          endDate: "Dec 2019",
          companyName: "Company Name 2",
          status: "Enrolment Closed",
          action: "View Details",
        },
        {
          startDate: "Jan 2020",
          endDate: "Mar 2020",
          companyName: "Tech Solutions Inc.",
          status: "Completed",
          action: "View Details",
        },
        {
          startDate: "Oct 2020",
          endDate: "Dec 2020",
          companyName: "FutureCorp",
          status: "Enrolment Closed",
          action: "View Details",
        },
      ],
      socialMedia: [
        { platform: "", value: "", id: uuidv4().split("-").join("") },
      ],
    },
  },
  reducers: {
    addInfo: (state, action) => {
      const { key } = action.payload;
      if (key == "additionalInfo") {
        state.value.additionalInfo.push({
          platform: "",
          value: "",
          id: uuidv4().split("-").join(""),
        });
      } else if (key == "socialMedia") {
        state.value.socialMedia.push({
          platform: "",
          value: "",
          id: uuidv4().split("-").join(""),
        });
      }
    },
    deleteInfo: (state, action) => {
      const { key, id } = action.payload;
      if (key == "additionalInfo") {
        state.value.additionalInfo = state.value.additionalInfo.filter(
          (e) => e.id != id
        );
      } else if (key == "socialMedia") {
        state.value.socialMedia = state.value.socialMedia.filter(
          (e) => e.id != id
        );
      }
    },
    updateInfo: (state, action) => {
      const { key, id, index, value, field } = action.payload;

      if (key === "about") {
        state.value.about[index].value = value;
      } else if (key === "additionalInfo") {
        state.value.additionalInfo = state.value.additionalInfo.map((e) =>
          e.id === id ? { ...e, [field]: value } : e
        );
      } else if (key === "socialMedia") {
        state.value.socialMedia = state.value.socialMedia.map((e) =>
          e.id === id ? { ...e, [field]: value } : e
        );
      } else if (key === "professionalSummary") {
        state.value.professionalSummary = value;
      } else if (key === "address") {
        if (field === "currentAddress" || field === "permanentAddress") {
          if (Array.isArray(value)) {
            state.value.address[field] = value;
          } else if (typeof index === "number") {
            state.value.address[field][index].value = value;
          } else {
            state.value.address[field] = value;
          }
        } else {
          state.value.address[field] = value;
        }
      }
    },
    setIntialData: (state, action) => {
      state.value = action.payload;
    },
    resetInfo: (state) => {
      state.value = JSON.parse(JSON.stringify(initialState.value));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndSetPincodeDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAndSetPincodeDetails.fulfilled, (state, action) => {
        const { field, updatedAddress } = action.payload;
        state.status = "succeeded";
        state.value.address[field] = updatedAddress;
      })
      .addCase(fetchAndSetPincodeDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

const token = getLstorage("token");

export const fetchAndSetPincodeDetails = createAsyncThunk(
  "basicDetails/fetchAndSetPincodeDetails",
  async ({ pincode }, { getState }) => {
    const response = await axios.get(`/api/pincode?pincode=${pincode}`);
    const postOffices = response.data?.PostOffice;

    if (!Array.isArray(postOffices) || postOffices.length === 0) {
      throw new Error("Invalid pincode");
    }

    const firstEntry = postOffices[0];

    const mappedValues = {
      cityName: firstEntry.Name,
      districtName: firstEntry.District,
      stateName: firstEntry.State,
    };

    return mappedValues;
  }
);

export const { addInfo, deleteInfo, updateInfo, setIntialData, resetInfo } =
  basicDetailsSlice.actions;

export default basicDetailsSlice;
