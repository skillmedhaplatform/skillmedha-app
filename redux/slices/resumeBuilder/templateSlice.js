import { createSlice } from "@reduxjs/toolkit";

const templateSlice = createSlice({
    name: "Template",
    initialState: {
        value: "template1"
    },
    reducers: {
        selectTemplate: (state, action) => {
            state.value = action.payload
        }
    }
})

export const { selectTemplate } = templateSlice.actions;
export default templateSlice;