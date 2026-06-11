import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const customSection = createSlice({
  name: "Custom Section",
  initialState: {
    value: [
      {
        jobTitle: "Add Custom Section",
        SubTitle: "",
        start: "",
        end: "",
        city: "",
        desc: "",
        id: uuidv4().split("-").join(""),
      },
    ],
    title: "Add Title",
    desc: "Add Description",
  },
  reducers: {
    updateTitle : (state,action) => {
        state.title = action.payload
    },
    updateDesc : (state,action) => {
        state.desc = action.payload
    },
    addItem: (state, action) => {
      state.value.push({
       
        jobTitle: "Add Employment",
        employer: "",
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
  },
});

export const { addItem, modifyItem, deleteItem,updateTitle,updateDesc } = customSection.actions;

export default customSection;
