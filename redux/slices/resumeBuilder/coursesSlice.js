import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const coursesSlice = createSlice({
  name: "Courses",
  initialState: {
    value: [{
        course: "Add Course",
        institution: "",
        start: "",
        end: "",
        id: uuidv4().split("-").join(""),
      }],
      title: "Courses"
  },
  reducers: {
    updateTitle : (state,action) => {
      state.title = action.payload
  },
    addItem: (state, action) => {
      state.value.push({
        course: "Add Course",
        institution: "",
        start: "",
        end: "",
        id: uuidv4().split("-").join(""),
      });
    },
    modifyItem: (state, action) => {
      const { key, value, id } = action.payload;
      const tempArr = state.value.map((e) => {
        if (e.id == id) {
          return {
            ...e,
            [key]: value,
          };
        }
        return e;
      });
      state.value = tempArr;
    },
    deleteItem: (state, action) => {
      state.value = state.value.filter((e) => e.id != action.payload);
    },
  },
});

export const { addItem, modifyItem, deleteItem,updateTitle } = coursesSlice.actions;

export default coursesSlice;
