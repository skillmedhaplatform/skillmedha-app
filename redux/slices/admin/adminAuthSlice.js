// redux/slices/authSlice.js
import { restUrl } from "@/config/urls";
import { getLstorage, setLstorage } from "@/utils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

//
// Login thunk
//

const ADMIN_AUTH_URL = restUrl + "/cms/auth"
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${ADMIN_AUTH_URL}/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.cryptoToken || data?.token) {
        setLstorage("token", data.cryptoToken);
        setLstorage("jwtToken", data.token);

        try {
          const cookieResponse = await fetch("/api/auth/set-cookie", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: data.cryptoToken }),
          });
          
          if (!cookieResponse.ok) {
             console.warn("Cookie set failed with status:", cookieResponse.status);
          }
        } catch (cookieError) {
          console.error("Failed to set authentication cookie (non-fatal):", cookieError);
        }
        if (data.user?.permissions || data.permissions) {
          try {
            await fetch("/api/auth/set-permissions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                permissions: data.user?.permissions || data.permissions,
              }),
            });
          } catch (permError) {
            console.error("Failed to set permissions cookie:", permError);
            // Don't fail login if permissions cookie fails
          }
        }

        // just return backend data as-is (no shaping)
        return data;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

//
// Logout thunk
//
export const logoutUser = createAsyncThunk(
  "auth/logoutStudent",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      const errorMessage = error.message || "Logout failed";
      return rejectWithValue(errorMessage);
    }
  }
);

//
// CREATE USER thunk (register)
//
export const createUser = createAsyncThunk(
  "auth/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${ADMIN_AUTH_URL}/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      if (data.token && data.user) {
        return data.user;
      } else {
        throw new Error(data.message || "Account creation failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Account creation failed";
      return rejectWithValue(errorMessage);
    }
  }
);

//
// get all admin users
//
export const getAllAdminUsers = createAsyncThunk(
  "auth/getAllAdminUsers",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.get(`${ADMIN_AUTH_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      // backend: { success, users: [...] }
      if (data.success && Array.isArray(data.users)) {
        dispatch(getCurrentUser());
        return data.users;
      }
      throw new Error(data.err || data.message || "Failed to fetch users");
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch users";
      return rejectWithValue(errorMessage);
    }
  }
);

//
// GET CURRENT USER thunk
//
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${ADMIN_AUTH_URL}/getadminuser`, {
        // or `${ADMIN_AUTH_URL}/current-user` based on your route
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      if (!data.success || !data.user) {
        throw new Error(
          data.err || data.message || "Failed to fetch current user"
        );
      }

      try {
        await axios.post("/api/auth/set-permissions", {
          permissions: data.user.permissions,
        });
      } catch (permError) {
        console.error("Failed to set permissions cookie:", permError);
      }

      // no mapping – return raw data from backend
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch current user";
      return rejectWithValue(errorMessage);
    }
  }
);

//
// UPDATE ADMIN USER thunk
//
export const updateAdminUser = createAsyncThunk(
  "auth/updateAdminUser",
  async ({ userId, updateData }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.put(
        `${ADMIN_AUTH_URL}/users/${userId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      return data;

      throw new Error(data.err || data.message || "Failed to update user");
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update user";
      return rejectWithValue(errorMessage);
    }
  }
);

//
// DELETE ADMIN USER thunk
//
export const deleteAdminUser = createAsyncThunk(
  "auth/deleteAdminUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`${ADMIN_AUTH_URL}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });

      // assuming backend returns: { success, msg, user }
      if (data.success) {
        return data;
      }

      throw new Error(data.err || data.message || "Failed to delete user");
    } catch (error) {
      const errorMessage =
        error.response?.data?.err ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete user";
      return rejectWithValue(errorMessage);
    }
  }
);

//
// Slice
//
const AuthSlice = createSlice({
  name: "Auth",
  initialState: {
    // `user.value` will now store full `data` object from backend
    user: {
      value: null,
      loading: false,
      error: null,
    },
    createUserState: {
      value: null,
      loading: false,
      error: null,
      success: false,
    },
    adminUsers: {
      list: [],
      loading: false,
      error: null,
    },
    isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
      state.user.value = null;
      state.isAuthenticated = false;
      state.user.error = null;
    },
    resetCreateUserState: (state) => {
      state.createUserState.value = null;
      state.createUserState.loading = false;
      state.createUserState.error = null;
      state.createUserState.success = false;
    },
  },
  extraReducers: (builder) => {
    //
    // loginUser
    //
    builder.addCase(loginUser.pending, (state) => {
      state.user.loading = true;
      state.user.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, { payload }) => {
      // payload is full `data` from login endpoint
      state.user.value = payload;
      state.user.loading = false;
      state.user.error = null;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.user.loading = false;
      state.user.error = action.payload || action.error.message;
      state.isAuthenticated = false;
    });

    //
    // logoutUser
    //
    builder.addCase(logoutUser.pending, (state) => {
      state.user.loading = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user.value = null;
      state.user.loading = false;
      state.user.error = null;
      state.isAuthenticated = false;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.user.loading = false;
      state.user.error = action.payload || action.error.message;
    });

    //
    // createUser (uses createUserState only)
    //
    builder.addCase(createUser.pending, (state) => {
      state.createUserState.loading = true;
      state.createUserState.error = null;
      state.createUserState.success = false;
    });
    builder.addCase(createUser.fulfilled, (state, { payload }) => {
      state.createUserState.loading = false;
      state.createUserState.value = payload;
      state.createUserState.error = null;
      state.createUserState.success = true;
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.createUserState.loading = false;
      state.createUserState.error = action.payload || action.error.message;
      state.createUserState.success = false;
    });

    //
    // getAllAdminUsers
    //
    builder.addCase(getAllAdminUsers.pending, (state) => {
      state.adminUsers.loading = true;
      state.adminUsers.error = null;
    });
    builder.addCase(getAllAdminUsers.fulfilled, (state, { payload }) => {
      state.adminUsers.loading = false;
      state.adminUsers.list = payload;
      state.adminUsers.error = null;
    });
    builder.addCase(getAllAdminUsers.rejected, (state, action) => {
      state.adminUsers.loading = false;
      state.adminUsers.error = action.payload || action.error.message;
    });

    //
    // getCurrentUser
    //
    builder.addCase(getCurrentUser.pending, (state) => {
      state.user.loading = true;
      state.user.error = null;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, { payload }) => {
      // payload is full `data` from /me endpoint
      state.user.loading = false;
      state.user.value = payload;
      state.user.error = null;
      state.isAuthenticated = true;
    });
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.user.loading = false;
      state.user.error = action.payload || action.error.message;
      state.isAuthenticated = false;
      state.user.value = null;
    });

    //
    // updateAdminUser
    //
    builder.addCase(updateAdminUser.pending, (state) => {
      state.adminUsers.loading = true;
      state.adminUsers.error = null;
    });

    builder.addCase(updateAdminUser.fulfilled, (state, { payload }) => {
      state.adminUsers.loading = false;
      state.adminUsers.error = null;
    });

    builder.addCase(updateAdminUser.rejected, (state, action) => {
      state.adminUsers.loading = false;
      state.adminUsers.error = action.payload || action.error.message;
    });

    builder.addCase(deleteAdminUser.pending, (state) => {
      state.adminUsers.loading = true;
      state.adminUsers.error = null;
    });

    builder.addCase(deleteAdminUser.fulfilled, (state, { payload }) => {
      state.adminUsers.loading = false;
      state.adminUsers.error = null;
    });

    builder.addCase(deleteAdminUser.rejected, (state, action) => {
      state.adminUsers.loading = false;
      state.adminUsers.error = action.payload || action.error.message;
    });
  },
});

export const { logout, resetCreateUserState } = AuthSlice.actions;
export default AuthSlice.reducer;
