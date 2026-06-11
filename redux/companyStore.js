import { configureStore } from "@reduxjs/toolkit";
import SideBarSlice from "./slices/company/sidebar";
import StepFormSlice from "./slices/company/stepform";
import ChipSlice from "./slices/company/chipSlice";
import TestsSlice from "./slices/company/test";
import filterReducer from "./slices/company/searchFunctions";
import questionSlice from "./slices/company/questionSlice";
import internshipSlice from "./slices/company/internship";
import userSlice from "./slices/company/user";
import ZoomSlice from "./slices/company/zoomSlice";
import tenantSlice from "./slices/company/tenantSlice";
import placementsSlice from "./slices/company/placementsSlice";
import { skillmedhaReducer } from "./slices/company/skillMedhaData";
import SkillSlice from "./slices/company/skillsSlice";

export const companyStore = configureStore({
  reducer: {
    sideBar: SideBarSlice,
    steps: StepFormSlice,
    chipSlice: ChipSlice,
    tests: TestsSlice,
    filter: filterReducer,
    question: questionSlice,
    internship: internshipSlice,
    user: userSlice,
    zoom: ZoomSlice,
    tenantStore: tenantSlice.reducer,
    placement: placementsSlice,
    skillmedha: skillmedhaReducer,
    skill: SkillSlice,
  },
});
