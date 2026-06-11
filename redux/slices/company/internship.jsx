const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
import { internshipUrl, restUrl } from "@/utils/universalUtils/urls";
import { getLstorage, setSstorage } from "@/utils/universalUtils/windowMW";
import { message } from "antd";
import axios from "axios";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";

const InternshipSlice = createSlice({
  name: "InternshipData",
  initialState: {
    allInternShips: {
      data: [],
      cursor: "",
      hasNext: false,
    },
    allCourses: {
      data: [],
      cursor: "",
      hasNext: false,
    },
    allSections: [],
    allTopics: [],
    singleInternship: {},
    singleSection: {},
    singleTopic: {},
    status: "",
    s3Urls: {
      resources: "",
      sourceCode: "",
      recordedVideo: "",
    },
  },
  reducers: {
    resetCourseVals : (state , {payload}) => {
      state.allCourses = {
        data: [],
        cursor: "",
        hasNext: false,
      }
    },
    resetInternshipVals : (state , {payload}) => {
      state.allInternShips = {
        data: [],
        cursor: "",
        hasNext: false,
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getAllInternShips.fulfilled, (state, { payload }) => {
      const { data, hasNext, cursor } = payload;

      state.allInternShips.data = Array.isArray(data) ? data : [];
      state.allInternShips.hasNext = hasNext ?? false;
      state.allInternShips.cursor = cursor ?? null;
    });
   
    builder.addCase(getAllCourses.fulfilled, (state, { payload }) => {
      
      const { data, hasNext, cursor } = payload;

      state.allCourses.data = Array.isArray(data) ? data : [];
      state.allCourses.hasNext = hasNext ?? false;
      state.allCourses.cursor = cursor ?? null;
    });

    builder.addCase(getOneInternship.fulfilled, (state, { payload }) => {
      state.singleInternship = payload;
    });
    builder.addCase(getOneSection.fulfilled, (state, { payload }) => {
      state.singleSection = payload;
    });
    builder.addCase(getInternshipSections.fulfilled, (state, { payload }) => {
      state.allSections = payload;
    });
    builder.addCase(getTopicsFromSection.fulfilled, (state, { payload }) => {
      state.allTopics = payload;
    });
    builder.addCase(getOneTopic.fulfilled, (state, { payload }) => {
      state.singleTopic = payload;
    });
  },
});

export const {resetInternshipVals ,resetCourseVals } = InternshipSlice.actions;

const token = getLstorage("token");




export const getAllInternShips = createAsyncThunk(
  "/getAllInternShips",
  async (args) => {
    try {
      const { data } = await axios.post(
        internshipUrl + "/getAllInternShips",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getAllCourses = createAsyncThunk(
  "/getAllCourses",
  async (args) => {
    try {
      const { data } = await axios.post(
        internshipUrl + "/getAllCourses",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const createInternship = createAsyncThunk(
  "/createInternship",
  async (args) => {
    const hide = message.loading("Please wait while creating internship", 0);
    try {
      const { data } = await axios.post(
        internshipUrl + "/createInternship",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.msg) {
        message.success("Internship created successfully");
        setSstorage("internshipId", data.data.insertedId);
      }
      return data;
    } catch (error) {
      message.error("Failed to create internship");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const createCourse = createAsyncThunk(
  "/createCourse",
  async (args) => {
    const hide = message.loading("Please wait while creating course", 0);
    try {
      const { data } = await axios.post(
        internshipUrl + "/createCourse",
        {
          ...args,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.msg) {
        message.success("Course created successfully");
        setSstorage("Course", data.data.insertedId);
      }
      return data;
    } catch (error) {
      message.error("Failed to create course");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const getOneInternship = createAsyncThunk(
  "/getOneInternship",
  async (args) => {
    try {
      const { data } = await axios.get(
        internshipUrl + `/getOneInternship/${args.id}`
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const updateInternship = createAsyncThunk(
  "/updateInternship",
  async (args) => {
    const hide = message.loading("Please wait while updating internship", 0);
    try {
      const { id, dispatch } = args;
      const { data } = await axios.post(
        internshipUrl + "/updateInternship/" + id,
        {
          ...args.data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.msg) {
        message.success("Internship updated Successfully");
        dispatch(
          getAllInternShips({
            limit: 20,
            cursor: null,
          })
        );
      }
      return data;
    } catch (error) {
      message.error("failed to update internship");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const getInternshipSections = createAsyncThunk(
  "/getInternshipSections",
  async (args) => {
    try {
      const { data } = await axios.get(
        internshipUrl + `/getInternshipSections/${args.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const createSection = createAsyncThunk(
  "/createSection",
  async (args) => {
    const hide = message.loading("Please wait while creating section", 0);
    try {
      const { data } = await axios.post(
        internshipUrl + `/createSection/${args.id}`,
        {
          ...args.data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.msg) message.success("Section created successfully");
      return data;
    } catch (error) {
      message.error("Failed to create section");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const updateSection = createAsyncThunk(
  "/updateSection",
  async (args) => {
    const hide = message.loading("Please wait while creating section", 0);
    try {
      const { data } = await axios.post(
        internshipUrl + `/updateSection/${args.id}/sections/${args.sid}`,
        {
          ...args.data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.msg) message.success("Section created successfully");
      return data;
    } catch (error) {
      message.error("Failed to create section");
      console.log(error);
    } finally {
      hide();
    }
  }
);

export const getOneSection = createAsyncThunk(
  "/getOneSection",
  async (args) => {
    try {
      const { data } = await axios.get(
        internshipUrl + `/getOneSection/${args.id}`
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const createTopic = createAsyncThunk("/createTopic", async (args) => {
  const hide = message.loading("Please wait while uploading topic", 0);
  try {
    const { id, sid } = args;

    const { data } = await axios.post(
      internshipUrl + `/createTopic/${id}/sections/${sid}`,
      {
        ...args.data,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (data?.msg) message.success("Topic created successfully");

    return data;
  } catch (error) {
    message.error("Failed to create topic");
    console.log(error);
  } finally {
    hide();
  }
});

export const getOneTopic = createAsyncThunk("/getOneTopic", async (args) => {
  try {
    const { data } = await axios.get(internshipUrl + `/getOneTopic/${args.id}`);

    return data.data;
  } catch (error) {
    console.log(error);
  }
});



export const getTopicsFromSection = createAsyncThunk(
  "/getTopicsFromSection",
  async (args) => {
    try {
      const { id, sid } = args;
      const { data } = await axios.get(
        internshipUrl + `/getTopicsFromSection/${id}/section/${sid}`
      );

      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const uploadToS3 = createAsyncThunk("/uploadToS3", async (args) => {
  try {
    const { type, bucketName } = args;

    const { data } = await axios.post(
      restUrl + `/uploadToS3?bucketName=${bucketName}`,
      {
        ...args.data,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log(error);
  }
});

export const updateTopic = createAsyncThunk("/updateTopic", async (args) => {
  const hide = message.loading("Please wait while updating topic", 0);
  try {
    const { id ,sid , tid} = args;

    const { data } = await axios.post(internshipUrl + `/updateTopic/${id}/sections/${sid}/topic/${tid}`, {
      ...args.data,
    });

    if (data?.msg) message.success("Topic updated successfully");

    return data
  } catch (error) {
    message.error("Failed to update topic");
    console.log(error);
  } finally {
    hide();
  }
});

export default InternshipSlice.reducer;
