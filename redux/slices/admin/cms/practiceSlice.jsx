import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- API Configuration ---
// The base URL for all API requests
// const API_BASE_URL =
//   "https://prostores-suspended-latino-sauce.trycloudflare.com";
const API_BASE_URL = restUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper function to get auth headers
// const getAuthHeaders = () => ({
//   Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2ODc0YjllM2YwM2RjYzhlZTZhMzJlMjEiLCJlbWFpbCI6InByYXNhbm5hQGdtYWlsLmNvbSIsInVzZXJOYW1lIjoicHJhc2FubmEiLCJyb2xlIjoiIiwib3JnSWQiOiJLU3F1YXJlIiwiaWF0IjoxNzYzNzg5MTgzLCJleHAiOjE3NjYzODExODN9.w3XcLIZeT02-6VL0vVHV9q-FvZFzr3jzatC_1XqMI-A`,
// });
const getAuthHeaders = () => ({
  Authorization: `Bearer ${getLstorage("jwtToken")}`,
});

// --- Initial State ---
const initialState = {
  subjects: [],
  topics: [],
  subtopics: [],
  questions: [],
  // status can be 'idle' | 'loading' | 'succeeded' | 'failed'
  status: "idle",
  error: null,
};

// =================================================================
// --- ASYNC THUNKS for API Calls ---
// =================================================================

// --- Subject Thunks ---
export const fetchSubjects = createAsyncThunk(
  "content/fetchSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/subjects", {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSubjectsByType = createAsyncThunk(
  "content/fetchSubjectsByType",
  async (type, { rejectWithValue }) => {
    try {
      const response = await api.get(`/subjects/type/${type}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSubject = createAsyncThunk(
  "content/createSubject",
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await api.post("/subjects", subjectData, {
        headers: getAuthHeaders(),
      });
      // The backend returns a result object, we need to return something to add to state
      // Let's assume the created subject is in response.data.data.ops[0]
      return {
        ...subjectData,
        _id: response.data.data.insertedId,
        createdAt: new Date().getTime(),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSubject = createAsyncThunk(
  "content/updateSubject",
  async ({ subjectId, data }, { rejectWithValue }) => {
    try {
      await api.put(`/subjects/${subjectId}`, data, {
        headers: getAuthHeaders(),
      });
      return { subjectId, data }; // Return the data to update the state
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSubject = createAsyncThunk(
  "content/deleteSubject",
  async (subjectId, { rejectWithValue }) => {
    try {
      await api.delete(`/subjects/${subjectId}`, {
        headers: getAuthHeaders(),
      });
      return subjectId; // Return the ID to remove it from the state
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Topic Thunks ---
export const fetchTopicsBySubject = createAsyncThunk(
  "content/fetchTopicsBySubject",
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/topics/subject/${subjectId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTopic = createAsyncThunk(
  "content/createTopic",
  async (topicData, { rejectWithValue }) => {
    try {
      const response = await api.post("/topics", topicData, {
        headers: getAuthHeaders(),
      });
      return {
        ...topicData,
        _id: response.data.data.insertedId,
        createdAt: new Date().getTime(),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTopic = createAsyncThunk(
  "content/updateTopic",
  async ({ topicId, data }, { rejectWithValue }) => {
    try {
      await api.put(`/topics/${topicId}`, data, {
        headers: getAuthHeaders(),
      });
      return { topicId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTopic = createAsyncThunk(
  "content/deleteTopic",
  async (topicId, { rejectWithValue }) => {
    try {
      await api.delete(`/topics/${topicId}`, {
        headers: getAuthHeaders(),
      });
      return topicId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Subtopic Thunks ---
export const fetchSubtopicsByTopic = createAsyncThunk(
  "content/fetchSubtopicsByTopic",
  async (topicId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/subtopics/topic/${topicId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSubtopic = createAsyncThunk(
  "content/createSubtopic",
  async (subtopicData, { rejectWithValue }) => {
    try {
      const response = await api.post("/subtopics", subtopicData, {
        headers: getAuthHeaders(),
      });
      return {
        ...subtopicData,
        _id: response.data.data.insertedId,
        createdAt: new Date().getTime(),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSubtopic = createAsyncThunk(
  "content/updateSubtopic",
  async ({ subtopicId, data }, { rejectWithValue }) => {
    try {
      await api.put(`/subtopics/${subtopicId}`, data, {
        headers: getAuthHeaders(),
      });
      return { subtopicId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSubtopic = createAsyncThunk(
  "content/deleteSubtopic",
  async (subtopicId, { rejectWithValue }) => {
    try {
      await api.delete(`/subtopics/${subtopicId}`, {
        headers: getAuthHeaders(),
      });
      return subtopicId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Question Thunks ---
export const fetchQuestions = createAsyncThunk(
  "content/fetchQuestions",
  async (
    { subjectId = null, topicId = null, subtopicId = null },
    { rejectWithValue }
  ) => {
    const urlendpoint = () => {
      if (subjectId) {
        return "?subjectId=" + subjectId;
      } else if (topicId) {
        return "?topicId=" + topicId;
      } else {
        return "?subTopicId=" + subtopicId;
      }
    };
    try {
      const response = await api.get(`/getpracquestions${urlendpoint()}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createQuestion = createAsyncThunk(
  "content/createQuestion",
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await api.post("/pracquestions", questionData, {
        headers: getAuthHeaders(),
      });
      return {
        ...questionData,
        _id: response.data.data.insertedId,
        createdAt: new Date().getTime(),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateQuestion = createAsyncThunk(
  "content/updateQuestion",
  async ({ questionId, data }, { rejectWithValue }) => {
    try {
      await api.put(`/pracquestions/${questionId}`, data, {
        headers: getAuthHeaders(),
      });
      return { questionId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const deleteQuestion = createAsyncThunk(
  "content/deleteQuestion",
  async (questionId, { rejectWithValue }) => {
    try {
      await api.delete(`/pracquestions/${questionId}`, {
        headers: getAuthHeaders(),
      });
      return questionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUploadPracQuestions = createAsyncThunk(
  "content/bulkUploadQuestions",
  async ({ formData, params }, { rejectWithValue }) => {
    try {
      // Construct query string
      const queryString = new URLSearchParams(params).toString();
      const url = `/bulkUploadPracQuestions?${queryString}`;

      const response = await api.post(url, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =================================================================
// --- THE SLICE ---
// =================================================================

const PracticeSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    // Reducer to clear topics, subtopics, etc. when navigating away
    clearScopedContent: (state) => {
      state.topics = [];
      state.subtopics = [];
      state.questions = [];
    },
    // Reset error state
    clearError: (state) => {
      state.error = null;
    },
    // Reset status
    resetStatus: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Subjects Reducers ---
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.subjects = action.payload.data;
      })
      .addCase(fetchSubjectsByType.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.subjects = action.payload.data;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.subjects.push(action.payload);
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const index = state.subjects.findIndex(
          (s) => s._id === action.payload.subjectId
        );
        if (index !== -1) {
          state.subjects[index] = {
            ...state.subjects[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.subjects = state.subjects.filter((s) => s._id !== action.payload);
      })

      // --- Topics Reducers ---
      .addCase(fetchTopicsBySubject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.topics = action.payload.data;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.topics.push(action.payload);
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const index = state.topics.findIndex(
          (t) => t._id === action.payload.topicId
        );
        if (index !== -1) {
          state.topics[index] = {
            ...state.topics[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.topics = state.topics.filter((t) => t._id !== action.payload);
      })

      // --- Subtopics Reducers ---
      .addCase(fetchSubtopicsByTopic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.subtopics = action.payload.data;
      })
      .addCase(createSubtopic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.subtopics.push(action.payload);
      })
      .addCase(updateSubtopic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const index = state.subtopics.findIndex(
          (st) => st._id === action.payload.subtopicId
        );
        if (index !== -1) {
          state.subtopics[index] = {
            ...state.subtopics[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(deleteSubtopic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.subtopics = state.subtopics.filter(
          (st) => st._id !== action.payload
        );
      })

      // --- Questions Reducers ---
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.questions = action.payload.data;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.questions.push(action.payload);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const index = state.questions.findIndex(
          (q) => q._id === action.payload.questionId
        );
        if (index !== -1) {
          state.questions[index] = {
            ...state.questions[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.questions = state.questions.filter(
          (q) => q._id !== action.payload
        );
      })
      .addCase(bulkUploadPracQuestions.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      });

    // --- Generic Loading/Error States ---
    builder
      .addMatcher(
        (action) =>
          action.type.startsWith("content/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("content/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error =
            action.payload?.err ||
            action.payload?.message ||
            "Something went wrong";
        }
      );
  },
});

export const { clearScopedContent, clearError, resetStatus } =
  PracticeSlice.actions;

export default PracticeSlice.reducer;
