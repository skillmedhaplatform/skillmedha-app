import { createSlice } from "@reduxjs/toolkit";

const hobbiesSlice = createSlice({
  name: "Hobbies",
  initialState: {
    value: "e.g. Skydiving, Painting, Reading",
    title: "Hobbies"
  },
  reducers: {
    updateTitle : (state,action) => {
      state.title = action.payload
  },
    modifyItem: (state, action) => {
      state.value = action.payload
    },
  },
});

export const { addItem, modifyItem, deleteItem,updateTitle } = hobbiesSlice.actions;

export default hobbiesSlice;
