import { GetToken } from "@/utils/universalUtils/token";
import { restUrl, studentUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { message } from "antd";
import axios from "axios";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const DepartmentSlice = createSlice({
  name: "departmentSlice",
  initialState: {
    AddDepartment: {
      value: {},
      status: "",
      error: null,
    },
    getAllDepartments: {
      value: {},
      status: "",
      error: null,
    },
    getAllStudentsWithoutDepart: {
      value: {},
      status: "",
      error: null,
    },
    getAllBathes: {
      value: {},
      status: "",
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createDepartment.pending, (state) => {
        state.AddDepartment.status = "loading";
        state.AddDepartment.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, { payload }) => {
        state.AddDepartment.status = "succeeded";
        state.AddDepartment.value = payload;
      })
      .addCase(createDepartment.rejected, (state, { error }) => {
        state.AddDepartment.status = "failed";
        state.AddDepartment.error = error.message;
      })
      .addCase(getAllDepartments.pending, (state) => {
        (state.getAllDepartments.status = "loading"),
          (state.getAllDepartments.error = null);
      })
      .addCase(getAllDepartments.fulfilled, (state, { payload }) => {
        (state.getAllDepartments.status = "sucess"),
          (state.getAllDepartments.value = payload);
      })
      .addCase(getAllDepartments.rejected, (state, { error }) => {
        (state.getAllDepartments.status = "failed"),
          (state.getAllDepartments.error = error.message);
      })
      .addCase(getAllBatches.pending, (state) => {
        (state.getAllBathes.status = "loading"),
          (state.getAllBathes.error = null);
      })
      .addCase(getAllBatches.fulfilled, (state, { payload }) => {
        (state.getAllBathes.status = "sucess"),
          (state.getAllBathes.value = payload);
      })
      .addCase(getAllBatches.rejected, (state, { error }) => {
        (state.getAllBathes.status = "failed"),
          (state.getAllBathes.error = error.message);
      });
  },
});
const token = GetToken();

export const createDepartment = createAsyncThunk(
  "/createDepartment",
  async (args) => {
    const { dispatch } = args;
    const hideloading = message.loading("Creating Department.", 0);
    try {
      const { data } = await axios.post(
        `${restUrl}/createDepartment`,
        {
          ...args.data,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      if (data) {
        dispatch(getAllDepartments());
        message.success("Department Created Successfully");
      }
      return data;
    } catch (error) {
      message.error("Failed to Create Department.");
      throw error;
    } finally {
      hideloading();
    }
  }
);
export const UpdateDepartment = createAsyncThunk(
  "/UpdateDepartment",
  async (args) => {
    const { dispatch, payload, DepartmentId } = args;
    const hideloading = message.loading("Updating Department.", 0);
    try {
      const { data } = await axios.post(
        `${restUrl}/updateDepartment/${DepartmentId}`,
        { ...payload },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      if (data) {
        dispatch(getAllDepartments());
        message.success("Department Updated Successfully");
      }
      return data;
    } catch (error) {
      message.error("Failed to Update Department.");
      throw error;
    } finally {
      hideloading();
    }
  }
);
export const DeleteDepartment = createAsyncThunk(
  "/DeleteDepartment",
  async (args) => {
    const { dispatch, DepartmentId } = args;
    const hideloading = message.loading("Deleting Department.", 0);
    try {
      const { data } = await axios.get(
        `${restUrl}/deleteDepartment/${DepartmentId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      if (data) {
        dispatch(getAllDepartments());
        message.success("Department Deleted Successfully");
      }
      return data;
    } catch (error) {
      message.error("Failed to Delete Department.");
      throw error;
    } finally {
      hideloading();
    }
  }
);

export const getAllDepartments = createAsyncThunk(
  "/getAllDepartments",
  async () => {
    try {
      const { data } = await axios.get(`${restUrl}/getAllDepartments`, {
        headers: {
          Authorization: `Bearer ${getLstorage("token") || token}`,
        },
      });
      return data;
    } catch (error) {
      message.error("Failed to Load Departments.");
      throw error;
    }
  }
);

export const getAllBatches = createAsyncThunk(
  "/getAllBAtches",
  async (args) => {
    try {
      const { data } = await axios.get(
        `${studentUrl}/batches?department=${args?.departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export default DepartmentSlice.reducer;
