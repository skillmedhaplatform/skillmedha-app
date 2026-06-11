import { GetToken } from "@/utils/universalUtils/token";
import { restUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import axios from "axios";
const NoticeBoardSlice = createSlice({
  name: "NoticeBoardSlice",
  initialState: {
    AllNotices: {
      value: {},
      status: "idle",
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetNoticeByStatus.pending, (state) => {
        state.AllNotices.status = "loading";
        state.AllNotices.error = null;
      })
      .addCase(GetNoticeByStatus.fulfilled, (state, { payload }) => {
        state.AllNotices.status = "succeeded";
        state.AllNotices.value = payload;
      })
      .addCase(GetNoticeByStatus.rejected, (state, { error }) => {
        state.AllNotices.status = "failed";
        state.AllNotices.error = error.message;
      });
  },
});
// const restUrl = "https://85e613029aef.ngrok-free.app";
// const restUrl = "http://localhost:2000";
const token = GetToken();

export const GetNoticeByStatus = createAsyncThunk(
  "GetNoticeByStatus",
  async (args) => {
    const { status, limit = 10, page = 1 } = args;
    try {
      const { data } = await axios.post(
        restUrl + `/getNoticeByStatus?status=${status}`,
        {
          limit,
          page,
        },
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

export const CreateNotice = createAsyncThunk("/CreateNotice", async (args) => {
  const { payload, dispatch } = args;
  try {
    const { data } = await axios.post(restUrl + `/createNoticeBoard`, payload, {
      headers: {
        Authorization: `Bearer ${getLstorage("token") || token}`,
      },
    });
    if (data?.msg) {
      dispatch(
        GetNoticeByStatus({ status: payload?.status, limit: 7, page: 1 })
      );
      message.success("Notice created successfully!");
    } else {
      message.error("Failed to create notice.");
    }
    return data;
  } catch (error) {
    console.log(error);
    message.error("An error occurred while creating the notice.");
  }
});

export const UpdateNotice = createAsyncThunk(
  "/UpdateNotice",
  async (args, thunkapi) => {
    const { updatedpayload, noticeId } = args;
    const { dispatch } = thunkapi;
    console.log(args);

    try {
      const { data } = await axios.post(
        restUrl + `/updateNoticeBoard/${noticeId}`,
        updatedpayload,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      if (data?.msg) {
        dispatch(
          GetNoticeByStatus({
            status: updatedpayload?.status,
            limit: 7,
            page: 1,
          })
        );
      }
      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const PublishNotice = createAsyncThunk(
  "/PublishNotice",
  async (args) => {
    const { NoticeId, status = "pending", dispatch } = args;
    try {
      const { data } = await axios.get(
        restUrl + `/setStatusActive/${NoticeId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token") || token}`,
          },
        }
      );
      if (data?.msg) {
        dispatch(GetNoticeByStatus({ status, limit: 7, page: 1 }));
        message.success("Notice published successfully!");
      } else {
        message.error("Failed to publish notice.");
      }
      return data;
    } catch (error) {
      console.log(error);
      message.error("An error occurred while publishing the notice.");
    }
  }
);
export const ExpireNotice = createAsyncThunk("/ExpireNotice", async (args) => {
  const { NoticeId, status = "active", dispatch } = args;
  try {
    const { data } = await axios.get(restUrl + `/setStatusExpire/${NoticeId}`, {
      headers: {
        Authorization: `Bearer ${getLstorage("token") || token}`,
      },
    });
    if (data?.msg) {
      dispatch(GetNoticeByStatus({ status, limit: 7, page: 1 }));
      message.success("Notice expired successfully!");
    } else {
      message.error("Failed to expire notice.");
    }
    return data;
  } catch (error) {
    console.log(error);
    message.error("An error occurred while expiring the notice.");
  }
});

export const {} = NoticeBoardSlice.actions;
export default NoticeBoardSlice.reducer;
