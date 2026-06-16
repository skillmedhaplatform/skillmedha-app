// src/store/skillmedhaSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { GetToken } from "@/utils/universalUtils/token";
import { aiUrl, restUrl, studentUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { message } from "antd";
import { GetOneJob } from "./placementsSlice";

/* ------------------------------------------------------------------ */
/* 1. AXIOS INSTANCE WITH INTERCEPTOR (OPTIONAL BUT RECOMMENDED)     */
/* ------------------------------------------------------------------ */

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: studentUrl || "",
  timeout: 10000,
});

// Request interceptor to add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = GetToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed");
    }
    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------ */
/* 2. ASYNC THUNKS                                                    */
/* ------------------------------------------------------------------ */

export const fetchPartnerColleges = createAsyncThunk(
  "skillmedha/partnerColleges/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = GetToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const {
        page = 1,
        limit = 10,
        search,
        status,
        location,
        sortBy,
        sortOrder,
      } = params;

      const queryParams = {
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
        ...(location && { location }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      };

      const response = await apiClient.get("/partnerColleges", {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch colleges";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch students with pagination support
 * Updated to return structured data for scroll pagination
 */
export const fetchAllStudents = createAsyncThunk(
  "skillmedha/students/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = GetToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const {
        page = 1,
        limit = 10, // Changed default to 10 for better pagination
        search,
        department,
        yearOfPassing,
        status,
        minGpa,
        maxGpa,
        sortBy = "firstName",
        sortOrder = "asc",
        college,
        hasInternship,
        hasResume,
        degree,
        grade,
        skill,
      } = params;

      const queryParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(department && { department }),
        ...(yearOfPassing && { yearOfPassing }),
        ...(status && { status }),
        ...(minGpa && { minGpa }),
        ...(maxGpa && { maxGpa }),
        ...(hasInternship && { hasInternship }),
        ...(hasResume && { hasResume }),
        ...(degree && { degree }),
        ...(grade && { grade }),
        ...(skill && { skill }),
        ...(college && { collegeId: college }),
      };

      const response = await apiClient.get("/getAllStudentsFromAllClgs", {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Structure the response for pagination
      const responseData = response.data;

      return {
        students: responseData.data || [],
        pagination: responseData.pagination || {},
        hasMore: responseData.pagination
          ? responseData.pagination.currentPage <
            responseData.pagination.totalPages
          : false,
        currentPage: responseData.pagination?.currentPage || page,
        totalCount: responseData.pagination?.totalCount || 0,
        collegeBreakdown: responseData.collegeBreakdown,
        appliedFilters: responseData.appliedFilters,
        isNewFilter: params.isNewFilter || false, // Track if this is a new filter request
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch students";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllAppliedStudents = createAsyncThunk(
  "/getAllAppliedStudents",
  async (args) => {
    try {
      const { data } = await axios.post(
        restUrl + "/getAllAppliedStudents",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data.data;
    } catch (err) {
      console.log(err);
    }
  }
);

export const getAllAppliedStudentsWithAssesmentResults = createAsyncThunk(
  "/getAllAppliedStudentsWithAssesmentResults",
  async (args) => {
    try {
      const { data } = await axios.post(
        restUrl + "/getAllAppliedStudentsWithAssessmentResults",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data.data;
    } catch (err) {
      console.log(err);
    }
  }
);

export const updateStudentAndJobStatus = createAsyncThunk(
  "/updateStudentAndJobStatus",
  async (args) => {
    const hide = message.loading("Please wait while updating status", 0);
    try {
      const { data } = await axios.post(
        restUrl + "/updateStudentAndJobStatus",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      if (data?.data) {
        message.success("Status updated successfully");
      }
      return data.data;
    } catch (err) {
      message.error("Error while updating status");
      console.log(err);
    } finally {
      hide();
    }
  }
);

export const addAssessmentToStudent = createAsyncThunk(
  "/addAssessmentToStudent",
  async (args) => {
    const hide = message.loading(
      "Please wait while assigning this assessment to student",
      0
    );
    try {
      const { data } = await axios.post(
        restUrl + "/addAssessmentToStudent",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      if (data?.message) {
        message.success("Assessment assigned successfully");
      }
      return data.data;
    } catch (err) {
      message.error("Error while assigning assessment");
      console.log(err);
    } finally {
      hide();
    }
  }
);

export const getScheduledInterviewsForJob = createAsyncThunk(
  "/getScheduledInterviewsForJob",
  async (args) => {
    try {
      const { data } = await axios.get(
        restUrl + "/getScheduledInterviewsForJob/" + args.jobId,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data?.students;
    } catch (err) {
      console.log(err);
    }
  }
);

export const availableSkills = createAsyncThunk(
  "/fetchskills",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = GetToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(restUrl + "/cms/skills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data?.skills;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch skills";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createJobAssessment = createAsyncThunk(
  "/createJobAssessment",
  async (args, { dispatch, rejectWithValue }) => {
    const { jobId, ...payload } = args;
    const hide = message.loading(
      "Please wait, creating assessment for this job",
      0
    );
    try {
      const { data } = await axios.post(
        `${restUrl}/createJobAssessment/${jobId}`,
        payload,
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      const created = data?.data;
      message.success("Assessment added successfully");
      await dispatch(GetOneJob({ jobid: jobId }));
      return created;
    } catch (error) {
      message.error("Failed to add assessment");
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Create failed"
      );
    } finally {
      hide();
    }
  }
);

export const updateJobAssessment = createAsyncThunk(
  "/updateJobAssessment",
  async (args, { dispatch, rejectWithValue }) => {
    const { jobId, aId, ...payload } = args;
    const hide = message.loading("Please wait, updating assessment", 0);
    try {
      const { data } = await axios.post(
        `${restUrl}/updateJobAssessment/${aId}`,
        payload,
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      message.success("Assessment updated successfully");
      await dispatch(getOneJobAssessment({ id: aId }));
      return data?.data;
    } catch (error) {
      message.error("Failed to update assessment");
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Update failed"
      );
    } finally {
      hide();
    }
  }
);
export const getOneJobAssessment = createAsyncThunk(
  "/getOneJobAssessment",
  async (args) => {
    try {
      const { id } = args;

      const { data } = await axios.get(restUrl + "/getOneJobAssessment/" + id, {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getAllAssessments = createAsyncThunk(
  "/getAllAssessments",
  async (args) => {
    try {
      const { page, limit = 20 } = args;

      const { data } = await axios.get(
        restUrl + "/getAllJobAssessment?page=" + page + "&limit=" + limit,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const generateAiQuestion = createAsyncThunk(
  "/generateAiQuestion",
  async (args) => {
    const payload = {
      noOfQuestion: args?.noOfQuestion,
      questionType: args?.questionType,
      textPara: args?.textPara,
    };
    try {
      const { data } = await axios.post(
        aiUrl + "/generateQuestionsfromText",
        payload,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

/* ------------------------------------------------------------------ */
/* 3. SLICE DEFINITION                                                */
/* ------------------------------------------------------------------ */

const skillmedhaSlice = createSlice({
  name: "skillmedha",
  initialState: {
    partnerColleges: {
      value: [],
      pagination: null,
      filters: null,
      status: "idle",
      error: null,
    },
    students: {
      value: [],
      allStudents: [], // New: Combined array for scroll pagination
      pagination: null,
      collegeBreakdown: null,
      appliedFilters: null,
      status: "idle",
      error: null,
      hasMore: true, // New: Track if more data is available
      currentPage: 1, // New: Track current page
      totalCount: 0, // New: Total number of students
    },
    skills: {
      value: [],
      status: "idle",
      error: null,
    },
    singleJobAssessment: {},
    scheduledInterviewsForJob: [],
    allAssessments: {
      totalCount: 0,
      value: [],
    },
    appliedStudents: [],
    appliedStudentsWithAssesmentResults: [],
    aiQuestions: {},
  },
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.partnerColleges.error = null;
      state.students.error = null;
      state.skills.error = null;
    },
    resetSingleJobAssessment: (state) => {
      state.singleJobAssessment = {};
    },

    // Reset partner colleges
    resetPartnerColleges: (state) => {
      state.partnerColleges = {
        value: [],
        pagination: null,
        filters: null,
        status: "idle",
        error: null,
      };
    },

    // Reset students
    resetStudents: (state) => {
      state.students = {
        value: [],
        allStudents: [],
        pagination: null,
        collegeBreakdown: null,
        appliedFilters: null,
        status: "idle",
        error: null,
        hasMore: true,
        currentPage: 1,
        totalCount: 0,
      };
    },

    // New: Reset pagination data while keeping other state
    resetStudentsPagination: (state) => {
      state.students.allStudents = [];
      state.students.currentPage = 1;
      state.students.hasMore = true;
    },
    resetAllAppliedStudents: (state) => {
      state.appliedStudents = [];
      state.appliedStudentsWithAssesmentResults = [];
    },
  },
  extraReducers: (builder) => {
    /* ---------------- Partner Colleges ---------------- */
    builder
      .addCase(fetchPartnerColleges.pending, (state) => {
        state.partnerColleges.status = "loading";
        state.partnerColleges.error = null;
      })
      .addCase(fetchPartnerColleges.fulfilled, (state, action) => {
        state.partnerColleges.status = "succeeded";
        state.partnerColleges.value = action.payload.data || [];
        state.partnerColleges.pagination = action.payload.pagination;
        state.partnerColleges.filters = action.payload.filters;
      })
      .addCase(fetchPartnerColleges.rejected, (state, action) => {
        state.partnerColleges.status = "failed";
        state.partnerColleges.error = action.payload || action.error.message;
        state.partnerColleges.value = [];
      })

      /* ---------------- Students ----------------------- */
      .addCase(fetchAllStudents.pending, (state) => {
        state.students.status = "loading";
        state.students.error = null;
      })
      .addCase(updateStudentAndJobStatus.fulfilled, (state) => {
        state.students.status = "success";
        state.students.error = null;
      })

      .addCase(getScheduledInterviewsForJob.fulfilled, (state, { payload }) => {
        state.scheduledInterviewsForJob = payload;
      })
      .addCase(getAllAppliedStudents.fulfilled, (state, { payload }) => {
        state.appliedStudents = payload;
      })
      .addCase(
        getAllAppliedStudentsWithAssesmentResults.fulfilled,
        (state, { payload }) => {
          state.appliedStudentsWithAssesmentResults = payload;
        }
      )
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.students.status = "succeeded";
        const {
          students,
          pagination,
          hasMore,
          currentPage,
          totalCount,
          collegeBreakdown,
          appliedFilters,
          isNewFilter,
        } = action.payload;

        // Update current page data
        state.students.value = students;
        state.students.pagination = pagination;
        state.students.collegeBreakdown = collegeBreakdown;
        state.students.appliedFilters = appliedFilters;
        state.students.hasMore = hasMore;
        state.students.currentPage = currentPage;
        state.students.totalCount = totalCount;

        // Handle scroll pagination
        if (isNewFilter || currentPage === 1) {
          // Reset for new filter or first page
          state.students.allStudents = students;
        } else {
          // Append for pagination
          state.students.allStudents = [
            ...state.students.allStudents,
            ...students,
          ];
        }
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.students.status = "failed";
        state.students.error = action.payload || action.error.message;
        state.students.value = [];
      })

      /* ---------------- Skills ----------------------- */
      .addCase(availableSkills.pending, (state) => {
        state.skills.status = "loading";
        state.skills.error = null;
      })
      .addCase(availableSkills.fulfilled, (state, action) => {
        state.skills.status = "succeeded";
        state.skills.value = action.payload || [];
      })
      .addCase(getOneJobAssessment.pending, (state) => {
        state.singleJobAssessment = {};
      })
      .addCase(getOneJobAssessment.fulfilled, (state, action) => {
        state.skills.status = "succeeded";
        state.singleJobAssessment = action.payload || {};
      })
      .addCase(createJobAssessment.fulfilled, (state, action) => {
        state.skills.status = "succeeded";
      })
      .addCase(getAllAssessments.fulfilled, (state, action) => {
        state.allAssessments.value = action.payload?.data;
        state.allAssessments.totalCount =
          action.payload?.pagination?.totalCount || 0;
      })
      .addCase(updateJobAssessment.fulfilled, (state, action) => {
        state.skills.status = "succeeded";
      })
      .addCase(availableSkills.rejected, (state, action) => {
        state.skills.status = "failed";
        state.skills.error = action.payload || action.error.message;
        state.skills.value = [];
      })
      .addCase(generateAiQuestion.pending, (state, action) => {
        state.aiQuestions = {};
      })
      .addCase(generateAiQuestion.fulfilled, (state, action) => {
        state.aiQuestions = action?.payload;
      });
  },
});

/* ------------------------------------------------------------------ */
/* 4. EXPORTS                                                         */
/* ------------------------------------------------------------------ */

export const {
  clearErrors,
  resetPartnerColleges,
  resetStudents,
  resetStudentsPagination,
  resetAllAppliedStudents,
  resetSingleJobAssessment,
} = skillmedhaSlice.actions;

export const skillmedhaReducer = skillmedhaSlice.reducer;
