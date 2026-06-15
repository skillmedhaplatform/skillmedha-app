import { configureStore } from "@reduxjs/toolkit";
import getAllStudentsReducer from "@/redux/slices/tpo/getAllStudentsSlice";
import getSingleStudentdata from "@/redux/slices/tpo/getAllDetailsSlice";
import resubmissionReducer from "@/redux/slices/tpo/resubmissionSlice";
import placementsSlice from "@/redux/slices/tpo/placementsSlice";
import departmentSlice from "@/redux/slices/tpo/departmentSlice";
import UserSlice from "@/redux/slices/tpo/userSlice";
import noticeSlice from "@/redux/slices/tpo/noticewboardSlice";
import dashboardSlice from "@/redux/slices/tpo/dashboardSlice";
import dashboardStatsReducer from "@/redux/slices/tpo/dashboardStatsSlice";
import SideBarSlice from "@/redux/slices/sidebar";

export const tpoStore = configureStore({
  reducer: {
    students: getAllStudentsReducer,
    singleStudentDetails: getSingleStudentdata,
    resubMission: resubmissionReducer,
    placement: placementsSlice,
    department: departmentSlice,
    user: UserSlice,
    notice: noticeSlice,
    dashboard: dashboardSlice,
    dashboardStats: dashboardStatsReducer,
    sideBar: SideBarSlice,
  },
});
