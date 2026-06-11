import { imgUrls } from "@/universalUtils/images";
import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const coursesSlice = createSlice({
  name: "Courses",
  initialState: {
    value: [
      {
        slug: "rb-cs",
        title: "Custom Section",
        icon: imgUrls.custonSetionIcon,
        active: false,
      },
      {
        slug: "rb-course",
        title: "Courses",
        icon: imgUrls.coursesIcon,
        active: false,
      },
      {
        slug: "rb-eca",
        title: "Extra Curricular Activities",
        icon: imgUrls.ecaIcon,
        active: false,
      },
      {
        slug: "rb-intern",
        title: "Internships",
        icon: imgUrls.internIcon,
        active: false,
      },
      {
        slug: "rb-hobbies",
        title: "Hobbies",
        icon: imgUrls.hobbiesIcon,
        active: false,
      },
      {
        slug: "rb-lang",
        title: "Languages",
        icon: imgUrls.langIcon,
        active: false,
      },
      {
        slug: "rb-ref",
        title: "References",
        icon: imgUrls.refIcon,
        active: false,
      },
    ],
  },
  reducers: {
    addSection: (state, action) => {
      state.value = state.value.map((e) => {
        if (e.slug == action.payload) e.active = true;
        return e;
      });
    },
    deleteSection: (state, action) => {
      state.value = state.value = state.value.map((e) => {
        if (e.slug == action.payload) e.active = false;
        return e;
      });
    },
  },
});

export const { addSection, deleteSection } = coursesSlice.actions;

export default coursesSlice;
