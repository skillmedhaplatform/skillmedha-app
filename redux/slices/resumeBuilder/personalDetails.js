import { createSlice } from "@reduxjs/toolkit";

const personalDetails = createSlice({
    name: "Personal Details",
    initialState: {
        value: {}
    },
    reducers: {
        update: (state, action) => {
            const {key,value} = action.payload;
            state.value = {
                ...state.value,
                [key]:value
            }
            // state.value[key]=value
        },
        updateFromPdDB : (state,action) =>{
            state.value = action.payload
        }
    }
});

export const { update,updateFromPdDB } = personalDetails.actions;

export default personalDetails;