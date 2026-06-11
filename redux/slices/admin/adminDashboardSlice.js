// src/redux/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axios";

// Force rebuild for Turbopack
// ==================== ASYNC THUNKS ====================

// Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/stats");
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch all organizations
export const fetchOrganizations = createAsyncThunk(
  "dashboard/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/organizations");
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch organization by ID
export const fetchOrganizationById = createAsyncThunk(
  "dashboard/fetchOrganizationById",
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/organizations/${orgId}`);
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch departments by org
export const fetchDepartmentsByOrg = createAsyncThunk(
  "dashboard/fetchDepartments",
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/organizations/${orgId}/departments`
      );
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch students by department
export const fetchStudentsByDepartment = createAsyncThunk(
  "dashboard/fetchStudents",
  async (
    { orgId, departmentId, page = 1, limit = 10, search = "" },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        `/organizations/${orgId}/departments/${departmentId}/students`,
        { params: { page, limit, search } }
      );
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const fetchGrowthStats = createAsyncThunk(
  "dashboard/fetchGrowthStats",
  async (period = "6months", { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/growth?period=${period}`);
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchAiUsageGrowth = createAsyncThunk(
  "dashboard/fetchAiUsageGrowth",
  async (period = "6months", { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/ai-usage-growth?period=${period}`
      );
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ==================== KEY ANALYTICS THUNKS ====================

export const fetchCourseAnalytics = createAsyncThunk(
  "dashboard/fetchCourseAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/analytics/courses");
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchJobActivity = createAsyncThunk(
  "dashboard/fetchJobActivity",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/analytics/jobs");
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchPlacementAnalytics = createAsyncThunk(
  "dashboard/fetchPlacementAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/analytics/placements");
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  "dashboard/fetchRevenueAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/analytics/revenue");
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


// ==================== SLICE ====================

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    // Dashboard Stats
    stats: {
      totalOrganizations: 0,
      totalColleges: 0,
      totalCompanies: 0,
      activeOrganizations: 0,
      totalStudents: 0,
      totalTPOs: 0,
      totalHRs: 0, // NEW
      totalDepartments: 0,
      totalJobs: 0,
      totalAssignedJobs: 0,
      totalCourses: 0, // NEW
      totalInternships: 0, // NEW
      aiUsage: {
        totalTokens: 0,
        totalRequests: 0,
        byType: {},
      },
    },
    aiUsageGrowth: {
      period: "6months",
      dataPoints: [],
      changeRates: {
        monthOverMonth: {},
        overall: {},
      },
    },
    growthData: {
      period: "6months",
      dataPoints: [],
    },

    // New Analytics Data
    analytics: {
      courses: {
        totalEnrollments: 0,
        mostPopular: [],
        leastPopular: [],
        courseStats: []
      },
      jobs: {
        applications: 0,
        placements: 0,
        averageApplicationsPerStudent: 0
      },
      placements: {
        studentsPlaced: 0,
        placementRate: "0%",
        totalStudents: 0
      },
      revenue: {
        totalRevenue: 0,
        revenueByCourse: []
      }
    },

    // In loading add:
    growth: false,
    // Organizations
    organizations: [],
    selectedOrg: null,

    // Departments
    departments: [],
    selectedDepartment: null,

    // Students
    students: {
      list: [],
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      departmentData: null,
    },

    // Loading states
    loading: {
      stats: false,
      organizations: false,
      orgDetails: false,
      departments: false,
      students: false,
      aiUsage: false,
      analytics: false, // General loading for analytics
    },

    // Error
    error: null,
  },

  reducers: {
    // Organization actions
    setSelectedOrg: (state, action) => {
      state.selectedOrg = action.payload;
    },
    clearSelectedOrg: (state) => {
      state.selectedOrg = null;
      state.departments = [];
      state.selectedDepartment = null;
      state.students = {
        list: [],
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        departmentData: null,
      };
    },

    // Department actions
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    clearDepartments: (state) => {
      state.departments = [];
      state.selectedDepartment = null;
    },

    // Student actions
    clearStudents: (state) => {
      state.students = {
        list: [],
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        departmentData: null,
      };
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ===== Dashboard Stats =====
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload;
      });

    // ===== Fetch Organizations =====
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading.organizations = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading.organizations = false;
        state.organizations = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading.organizations = false;
        state.error = action.payload;
      });

    // ===== Fetch Organization By ID =====
    builder
      .addCase(fetchOrganizationById.pending, (state) => {
        state.loading.orgDetails = true;
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.loading.orgDetails = false;
        state.selectedOrg = action.payload;
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.loading.orgDetails = false;
        state.error = action.payload;
      });

    // ===== Fetch Departments =====
    builder
      .addCase(fetchDepartmentsByOrg.pending, (state) => {
        state.loading.departments = true;
      })
      .addCase(fetchDepartmentsByOrg.fulfilled, (state, action) => {
        state.loading.departments = false;
        state.departments = action.payload.departments || [];
      })
      .addCase(fetchDepartmentsByOrg.rejected, (state, action) => {
        state.loading.departments = false;
        state.error = action.payload;
      });

    // ===== Fetch Students =====
    builder
      .addCase(fetchStudentsByDepartment.pending, (state) => {
        state.loading.students = true;
      })
      .addCase(fetchStudentsByDepartment.fulfilled, (state, action) => {
        state.loading.students = false;
        state.students = {
          list: action.payload.students || [],
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          departmentData: action.payload.departmentData,
        };
      })
      .addCase(fetchStudentsByDepartment.rejected, (state, action) => {
        state.loading.students = false;
        state.error = action.payload;
      });
    builder
      .addCase(fetchGrowthStats.pending, (state) => {
        state.loading.growth = true;
        state.error = null;
      })
      .addCase(fetchGrowthStats.fulfilled, (state, action) => {
        state.loading.growth = false;
        state.growthData = action.payload;
      })
      .addCase(fetchGrowthStats.rejected, (state, action) => {
        state.loading.growth = false;
        state.error = action.payload;
      });
    builder
      .addCase(fetchAiUsageGrowth.pending, (state) => {
        state.loading.aiUsage = true;
        state.error = null;
      })
      .addCase(fetchAiUsageGrowth.fulfilled, (state, action) => {
        state.loading.aiUsage = false;
        state.aiUsageGrowth = action.payload;
      })
      .addCase(fetchAiUsageGrowth.rejected, (state, action) => {
        state.loading.aiUsage = false;
        state.error = action.payload;
      });

    // ===== Analytics Reducers =====
    
    // Courses
    builder.addCase(fetchCourseAnalytics.fulfilled, (state, action) => {
      state.analytics.courses = action.payload;
    });

    // Jobs
    builder.addCase(fetchJobActivity.fulfilled, (state, action) => {
      state.analytics.jobs = action.payload;
    });

    // Placements
    builder.addCase(fetchPlacementAnalytics.fulfilled, (state, action) => {
      state.analytics.placements = action.payload;
    });

    // Revenue
    builder.addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
      state.analytics.revenue = action.payload;
    });
  },
});

// Export actions
export const {
  setSelectedOrg,
  clearSelectedOrg,
  setSelectedDepartment,
  clearDepartments,
  clearStudents,
  clearError,
} = dashboardSlice.actions;

// Export reducer
export default dashboardSlice.reducer;
