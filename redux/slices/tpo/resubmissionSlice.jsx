import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  approvals: {
    basicDetails: {},
    educationalDetails: {},
    internshipWorkEx: {},
    skillsSubsLanguages: {},
    positionOfResponsibilities: {},
    projects: {},
    accomplishMents: {},
    volunteering: {},
    extraCircularActivities: {}
  },
  resubmissions: {
    basicDetails: {},
    educationalDetails: {},
    internshipWorkEx: {},
    skillsSubsLanguages: {},
    positionOfResponsibilities: {},
    projects: {},
    accomplishMents: {},
    volunteering: {},
    extraCircularActivities: {}
  }
};

const resubmissionSlice = createSlice({
  name: 'resubmission',
  initialState,
  reducers: {
    setResubmissionFlag: (state, action) => {
      const { type, section, value } = action.payload;
      if (state.resubmissions[type]) {
        state.resubmissions[type][section] = value;
      } else {
        console.warn(`Unknown resubmission type: ${type}`);
      }
    },
    setApprovalFlag: (state, action) => {
      const { type, section, value } = action.payload;
      if (state.approvals[type]) {
        state.approvals[type][section] = value;
      } else {
        console.warn(`Unknown approval type: ${type}`);
      }
    },
    clearResubmissions: (state) => {
      Object.keys(state.resubmissions).forEach(key => {
        state.resubmissions[key] = {};
      });
      Object.keys(state.approvals).forEach(key => {
        state.approvals[key] = {};
      });
    }
  }
});

export const { setResubmissionFlag, setApprovalFlag, clearResubmissions } = resubmissionSlice.actions;
export default resubmissionSlice.reducer;
