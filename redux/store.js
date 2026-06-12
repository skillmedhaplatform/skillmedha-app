import { configureStore } from "@reduxjs/toolkit";
import { skillmedhaReducer as companySkillMedhaData } from "./slices/company/skillMedhaData";
import SideBarSlice from "./slices/sidebar";
import StepFormSlice from "./slices/stepform";
import ChipSlice from "./slices/chipSlice";
import TestsSlice from "./slices/test";
import filterReducer from "./slices/searchFunctions";
import questionSlice from "./slices/questionSlice";
import practiceSlice from "./slices/practiceSlice";
import studentSlice from "./slices/student";
import codeEditorSlice from "./slices/codeEditor";
import testportalSlice from "./slices/testportal";
import basicDetailsSlice from "./slices/myprofile/basicDetailsSlice";
import educationDetailsSlice from "./slices/myprofile/educationDetailsSlice";
import InternshipSlice from "./slices/internship";
import jonOpeningSlice from "./slices/jobopenings";

// Admin Portal Slices
import adminAuthReducer from "./slices/admin/adminAuthSlice";
import adminDashboardReducer from "./slices/admin/adminDashboardSlice";
import adminOrgReducer from "./slices/admin/adminOrgSlice";
import adminRazorpayReducer from "./slices/admin/adminRazorpaySlice";
import adminZoomReducer from "./slices/admin/adminZoomSlice";
import adminPracticeReducer from "./slices/admin/cms/practiceSlice";
import adminInternshipReducer from "./slices/admin/cms/internship";
import marqueeReducer from "./slices/admin/cms/marqueeSlice";
import adminUserReducer from "./slices/admin/cms/user";
import adminSkillReducer from "./slices/admin/cms/skillsSlice";
import adminTestsReducer from "./slices/admin/cms/test";
import adminStepsReducer from "./slices/admin/cms/stepform";
import adminCmsZoomReducer from "./slices/admin/cms/zoomSlice";
//oldresumebuilder
import coursesSlice from "./slices/resumeBuilder/coursesSlice";
import educationSlice from "./slices/resumeBuilder/educationSlice";
import employmentSlice from "./slices/resumeBuilder/employmentSlice";
import extraCurricSlice from "./slices/resumeBuilder/extracurricSlice";
import internshipSlice from "./slices/resumeBuilder/internshipSlice";
import languageSlice from "./slices/resumeBuilder/languagesSlice";
import oldlinksSlice from "./slices/resumeBuilder/linksSlice";
import personalDetailsSlice from "./slices/resumeBuilder/personalDetails";
import referenceSlice from "./slices/resumeBuilder/referenceSlice";
import templateSlice from "./slices/resumeBuilder/templateSlice";
import activeSection from "./slices/resumeBuilder/activeSections";
import customSection from "./slices/resumeBuilder/customSection";
import hobbiesSlice from "./slices/resumeBuilder/hobbies";
import courseSlice from "./slices/assessmentsSlice/courseSlice";
import testSlice from "./slices/assessmentsSlice/testSlice";
import UserFormSlice from "./slices/assessmentsSlice/userForm";
import jobassessmentsSlice from "./slices/jobassessmentsSlice";
import studentDashboardStatsReducer from "@/redux/slices/studentDashboardStatsSlice";

export const store = configureStore({
  reducer: {
    student: studentSlice,
    sideBar: SideBarSlice,
    steps: StepFormSlice,
    chipSlice: ChipSlice,
    legacyTests: TestsSlice,
    filter: filterReducer,
    question: questionSlice,
    codeEditor: codeEditorSlice,
    portal: testportalSlice,
    basicDetails: basicDetailsSlice.reducer,
    educationDetails: educationDetailsSlice,
    internship: InternshipSlice,
    jonOpenings: jonOpeningSlice,

    // Admin Portal
    adminAuth: adminAuthReducer,
    adminDashboard: adminDashboardReducer,
    adminOrg: adminOrgReducer,
    adminRazorpay: adminRazorpayReducer,
    adminZoom: adminZoomReducer,
    adminPractice: adminPracticeReducer,
    adminInternship: adminInternshipReducer,
    marquee: marqueeReducer,
    user: adminUserReducer,
    skill: adminSkillReducer,
    adminTests: adminTestsReducer,
    adminSteps: adminStepsReducer,
    adminCmsZoom: adminCmsZoomReducer,

    // Company Portal
    companyJobs: require("./slices/company/jobs").default,
    companyPlacements: require("./slices/company/placementsSlice").default,
    companySkillMedhaData: companySkillMedhaData,
    companyTenant: require("./slices/company/tenantSlice").default.reducer,
    companySkillLibrary: require("./slices/company/skilllibrarySlice/test").default,
    //oldbuilder
    personalDetailsResumeBuilder: personalDetailsSlice.reducer,
    templateResumeBuilder: templateSlice.reducer,
    employmentResumeBuilder: employmentSlice.reducer,
    educationResumeBuilder: educationSlice.reducer,
    internshipResumeBuilder: internshipSlice.reducer,
    coursesResumeBuilder: coursesSlice.reducer,
    referenceResumeBuilder: referenceSlice.reducer,
    linksResumeBuilder: oldlinksSlice.reducer,
    languagesResumeBuilder: languageSlice.reducer,
    extracurricsResumeBuilder: extraCurricSlice.reducer,
    activeSectionResumeBuilder: activeSection.reducer,
    customSectionResumeBuilder: customSection.reducer,
    hobbiesResumeBuilder: hobbiesSlice.reducer,
    // assesments
    courses: courseSlice.reducer,
    tests: testSlice,
    // sideBar: SideBarSlice,
    userForm: UserFormSlice,
    jobassessments: jobassessmentsSlice,
    practice: practiceSlice,
    studentDashboardStats: studentDashboardStatsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128,
      },
    }),
});
