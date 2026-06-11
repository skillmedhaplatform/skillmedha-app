import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const educationSlice = createSlice({
  name: "Education",
  initialState: {
    value: [
      {
        type: "",
        board: "",
        school: "",
        hallticket: "",
        startDate: "",
        endDate: "",
        yearofPass: "",
        gradingSystem: "",
        grade: "",
        city: "",
        description: "",
        _id: uuidv4().split("-").join(""),
      },
    ],
    title: "Education History",
    selectedDegree: {},
  },
  reducers: {
    updateTitle: (state, action) => {
      state.title = action.payload;
    },
    addItem: (state, action) => {
      state.value.push({
        school: "Add Education",
        degree: "",
        branch: "",
        specification: "",
        specialization: "",
        start: "",
        end: "",
        city: "",
        desc: "",
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
    setDegree: (state, action) => {
      state.selectedDegree = action.payload;
    },
    updateFromEduDB: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const {
  addItem,
  modifyItem,
  deleteItem,
  updateTitle,
  setDegree,
  updateFromEduDB,
} = educationSlice.actions;

export default educationSlice;
