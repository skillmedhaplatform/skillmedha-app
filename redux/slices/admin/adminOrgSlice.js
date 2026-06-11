import { gqlUrl, internshipUrl, restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";

const OrgSlice = createSlice({
  name: "Organisation",
  initialState: {
    orgs: {
      value: [],
      loading: false,
      error: null,
    },
    departments: {
      value: [],
      loading: false,
      error: null,
    },
    tpos: {
      value: [],
      loading: false,
      error: null,
    },
    students: {
      value: {},
      loading: false,
      error: null,
    },
    states: {
      value: [],
      loading: false,
      error: null,
    },
    orgStats: {
      value: null,
      loading: false,
      error: null,
    },
    updateFeatures: {
      loading: false,
      error: null,
      success: false,
    },
    jobs: {
      value: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalJobs: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    },
    users: {
      value: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    },
    deleteOrg: {
      status: "",
      data: {},
    },
  },
  reducers: {
    resetJobs: (state) => {
      state.jobs.value = [];
      state.jobs.pagination = {
        currentPage: 1,
        totalPages: 0,
        totalJobs: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      };
      state.jobs.error = null;
    },
    resetUsers: (state) => {
      state.users.value = [];
      state.users.pagination = {
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      };
      state.users.error = null;
    },
  },
  extraReducers: (builder) => {
    // getAllOrgs
    builder.addCase(getAllOrgs.pending, (state) => {
      state.orgs.loading = true;
      state.orgs.error = null;
    });
    builder.addCase(getAllOrgs.fulfilled, (state, { payload }) => {
      state.orgs.value = payload;
      state.orgs.loading = false;
      state.orgs.error = null;
    });
    builder.addCase(getAllOrgs.rejected, (state, action) => {
      state.orgs.loading = false;
      state.orgs.error = action.error.message;
    });

    // getAllDepartmentsFromOrgs
    builder.addCase(getAllDepartmentsFromOrgs.pending, (state) => {
      state.departments.loading = true;
      state.departments.error = null;
    });
    builder.addCase(
      getAllDepartmentsFromOrgs.fulfilled,
      (state, { payload }) => {
        state.departments.value = payload;
        state.departments.loading = false;
        state.departments.error = null;
      }
    );
    builder.addCase(getAllDepartmentsFromOrgs.rejected, (state, action) => {
      state.departments.loading = false;
      state.departments.error = action.error.message;
      message.error(action.error.message || "Failed to fetch departments");
    });

    // getAllTposInOrg
    builder.addCase(getAllTposInOrg.pending, (state) => {
      state.tpos.loading = true;
      state.tpos.error = null;
    });
    builder.addCase(getAllTposInOrg.fulfilled, (state, { payload }) => {
      state.tpos.value = payload;
      state.tpos.loading = false;
      state.tpos.error = null;
    });
    builder.addCase(getAllTposInOrg.rejected, (state, action) => {
      state.tpos.loading = false;
      state.tpos.error = action.payload || action.error.message;
    });

    // getStudentsInDepartment
    builder.addCase(getStudentsInDepartment.pending, (state) => {
      state.students.loading = true;
      state.students.error = null;
    });
    builder.addCase(getStudentsInDepartment.fulfilled, (state, { payload }) => {
      state.students.value = payload;
      state.students.loading = false;
      state.students.error = null;
    });
    builder.addCase(getStudentsInDepartment.rejected, (state, action) => {
      state.students.loading = false;
      state.students.error = action.payload || action.error.message;
    });

    // getJobsByOrg
    builder.addCase(getJobsByOrg.pending, (state) => {
      state.jobs.loading = true;
      state.jobs.error = null;
    });
    builder.addCase(getJobsByOrg.fulfilled, (state, action) => {
      state.jobs.loading = false;
      state.jobs.value = action.payload.jobs;
      state.jobs.pagination = action.payload.pagination;
      state.jobs.error = null;
    });
    builder.addCase(getJobsByOrg.rejected, (state, action) => {
      state.jobs.loading = false;
      state.jobs.error = action.payload || action.error.message;
    });

    // getUsersByOrg
    builder.addCase(getUsersByOrg.pending, (state) => {
      state.users.loading = true;
      state.users.error = null;
    });
    builder.addCase(getUsersByOrg.fulfilled, (state, action) => {
      state.users.loading = false;
      state.users.value = action.payload.users;
      state.users.pagination = action.payload.pagination;
      state.users.error = null;
    });
    builder.addCase(getUsersByOrg.rejected, (state, action) => {
      state.users.loading = false;
      state.users.error = action.payload || action.error.message;
    });

    // getOrganisationStats
    builder.addCase(getOrganisationStats.pending, (state) => {
      state.orgStats.loading = true;
      state.orgStats.error = null;
    });
    builder.addCase(getOrganisationStats.fulfilled, (state, { payload }) => {
      state.orgStats.value = payload;
      state.orgStats.loading = false;
      state.orgStats.error = null;
    });
    builder.addCase(getOrganisationStats.rejected, (state, action) => {
      state.orgStats.loading = false;
      state.orgStats.error = action.payload || action.error.message;
    });
    // getOrganisationStats
    builder.addCase(updateOrganisationFeatures.pending, (state) => {
      state.updateFeatures.loading = true;
      state.updateFeatures.error = null;
    });
    builder.addCase(
      updateOrganisationFeatures.fulfilled,
      (state, { payload }) => {
        state.updateFeatures.value = payload;
        state.updateFeatures.loading = false;
        state.updateFeatures.error = null;
      }
    );
    builder.addCase(fetchStatesWithDistricts.rejected, (state, action) => {
      state.updateFeatures.loading = false;
      state.updateFeatures.error = action.payload || action.error.message;
    });
    // states data
    builder.addCase(fetchStatesWithDistricts.pending, (state) => {
      state.states.loading = true;
      state.states.error = null;
    });
    builder.addCase(
      fetchStatesWithDistricts.fulfilled,
      (state, { payload }) => {
        state.states.value = payload;
        state.states.loading = false;
        state.states.error = null;
      }
    );
    builder.addCase(updateOrganisationFeatures.rejected, (state, action) => {
      state.states.loading = false;
      state.states.error = action.payload || action.error.message;
    });
    builder.addCase(deleteOrginasition.pending, (state, action) => {
      state.deleteOrg.status = "pending";
      state.deleteOrg.data = {};
    });
    builder.addCase(deleteOrginasition.fulfilled, (state, action) => {
      state.deleteOrg.status = "fulfilled";
      state.deleteOrg.data = action.payload;
    });
    builder.addCase(deleteOrginasition.rejected, (state, action) => {
      state.deleteOrg.status = "rejected";
      state.deleteOrg.data = {};
    });
  },
});

// Existing thunks...
export const getAllOrgs = createAsyncThunk(
  "/getAllOrganisations",
  async (args) => {
    try {
      const url = args?.type
        ? `${restUrl}/getAllOrganisations?type=${args.type}`
        : `${restUrl}/getAllOrganisations`;

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      return data.data?.filter((e) => e.active);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export const registerOrg = createAsyncThunk(
  "organisation/registerOrg",
  async (orgData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${restUrl}/registerOrg`, orgData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      if (data.msg) {
        message.success(data.msg);
        return data;
      } else {
        throw new Error(
          data.err || data.message || "Failed to register organization"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to register organization";
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllDepartmentsFromOrgs = createAsyncThunk(
  "organisation/getAllDepartmentsFromOrgs",
  async (orgIds, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${restUrl}/getAllDepartmentsFromOrgs`,
        { orgIds },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("jwtToken")}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.message ||
        "Error fetching departments";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "auth/updateOrganization",
  async ({ orgId, updateData, type }, { rejectWithValue, dispatch }) => {
    try {
      console.log(orgId);

      const { data } = await axios.post(
        `${restUrl}/updateOrganization/${orgId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("jwtToken")}`,
          },
        }
      );

      if (data.msg) {
        dispatch(getAllOrgs({ type }));
        return data;
      } else {
        throw new Error(
          data.err || data.message || "Failed to update organization"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update organization";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllTposInOrg = createAsyncThunk(
  "organisation/getAllTposInOrg",
  async (args, { rejectWithValue }) => {
    try {
      const url = args?.orgId
        ? `${restUrl}/getTposInOrganisation?orgId=${args.orgId}`
        : `${restUrl}/getTposInOrganisation`;

      const { data } = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      return data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.err || error.message || "Error fetching TPOs";
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStudentsInDepartment = createAsyncThunk(
  "organisation/getStudentsInDepartment",
  async (
    { orgId, departmentId, page = 1, limit = 10, search = "" },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.get(
        `${restUrl}/getStudentsDepartmentAndOrg/${orgId}/${departmentId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("token")}`,
          },
          params: {
            page,
            limit,
            search, // Send search param to API
          },
        }
      );

      return {
        students: data?.data?.students || [],
        totalCount: data?.data?.totalCount || 0,
        search: data?.data?.search || null,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.err || error.message || "Error fetching students";
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getJobsByOrg = createAsyncThunk(
  "organisation/getJobsByOrg",
  async ({ orgId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const url = `${restUrl}/organizations/${orgId}/jobs/paginated?${params.toString()}`;

      const { data } = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      return {
        jobs: data.jobs,
        pagination: data.pagination,
        orgId: data.orgId,
        orgName: data.orgName,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.err ||
        error.message ||
        "Error fetching jobs";
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getUsersByOrg = createAsyncThunk(
  "organisation/getUsersByOrg",
  async ({ orgId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const url = `${restUrl}/organizations/${orgId}/users/paginated?${params.toString()}`;

      const { data } = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      return {
        users: data.users,
        pagination: data.pagination,
        orgId: data.orgId,
        orgName: data.orgName,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.err ||
        error.message ||
        "Error fetching users";
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const CreateOrgUser = createAsyncThunk(
  "organisation/createOrgUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${restUrl}/regiterMainDBUser`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.err || error.message || "Error creating user";
      return rejectWithValue(errorMessage);
    }
  }
);

export const DeleteTPO = createAsyncThunk(
  "organisation/DeleteTPO",
  async (args, { rejectWithValue, dispatch }) => {
    try {
      console.log(args);

      const { data } = await axios.delete(
        `${restUrl}/deleteTpo/${args?.tpoId}?orgId=${args?.orgId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("jwtToken")}`,
          },
        }
      );
      dispatch(getAllTposInOrg({ orgId: args?.orgId }));
      return data.data;
    } catch (error) {
      console.log(error);

      const errorMessage =
        error.response?.data?.err || error.message || "Error creating user";
      return rejectWithValue(errorMessage);
    }
  }
);

// Add this async thunk
export const updateOrganisationAILimit = createAsyncThunk(
  "org/updateAILimit",
  async ({ orgId, aiTokenLimit }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${restUrl}/updateOrganisationAILimit/${orgId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("jwtToken")}`, // Your auth token
          },
          body: JSON.stringify({ aiTokenLimit }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.err || "Failed to update AI token limit");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOrganisationStats = createAsyncThunk(
  "organisation/getOrganisationStats",
  async (orgId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${restUrl}/getOrganisationStats/${orgId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("jwtToken")}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.message ||
        "Error fetching organization statistics";
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateOrganisationFeatures = createAsyncThunk(
  "organisation/updateOrganisationFeatures",
  async ({ orgId, features }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${restUrl}/updateOrganisationFeatures/${orgId}?orgId=KSquare`,
        { features },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      message.success("Organization features updated successfully");
      return data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.message ||
        "Error updating organization features";
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchStatesWithDistricts = createAsyncThunk(
  "location/fetchStatesWithDistricts",
  async () => {
    const response = await axios.get(
      "https://res.cloudinary.com/dv51fpmi8/raw/upload/v1763720143/states_oeqwgr.json"
    );
    return response.data;
  }
);

export const deleteOrginasition = createAsyncThunk(
  "/deleteOrg",
  async ({ orgId, type }, { dispatch }) => {
    const { data } = await axios.delete(
      `${restUrl}/deleteOrginaztion/${orgId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("jwtToken")}`,
        },
      }
    );
    if (data.msg) {
      dispatch(getAllOrgs({ type }));
    }
    return data;
  }
);
export const { resetJobs, resetUsers } = OrgSlice.actions;
export default OrgSlice.reducer;
