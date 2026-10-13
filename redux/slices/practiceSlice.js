import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- API Configuration ---
const API_BASE_URL = restUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper function to get auth headers
const getAuthHeaders = () => ({
  Authorization: `Bearer ${getLstorage("token")}`,
});

// --- Initial State ---
const initialState = {
  subjects: [],
  topics: [],
  subtopics: [],
  pracQuestions: {},
  studentPracResults: [],
  categoryProgress: {},
  // Practice sets & bundles the admin published, each with this student's access
  catalog: { sets: [], bundles: [] },
  catalogStatus: "idle",
  catalogError: null,
  // status can be 'idle' | 'loading' | 'succeeded' | 'failed'
  status: "idle",
  error: null,
};

// =================================================================
// --- ASYNC THUNKS for Student Practice ---
// =================================================================

// --- Fetch Subjects ---
export const fetchSubjects = createAsyncThunk(
  "studentPractice/fetchSubjects",
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
  "studentPractice/fetchSubjectsByType",
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


// --- Fetch Topics ---
export const fetchTopicsBySubject = createAsyncThunk(
  "studentPractice/fetchTopicsBySubject",
  async ({ subjectId }, { rejectWithValue }) => {
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

// --- Fetch Subtopics ---
export const fetchSubtopicsByTopic = createAsyncThunk(
  "studentPractice/fetchSubtopicsByTopic",
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
export const fetchPracQuestions = createAsyncThunk(
  "studentPractice/fetchPracQuestions",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/startPractice`,
        { ...payload },
        {
          headers: getAuthHeaders(),
        }
      );
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Practice Sets catalog (sets + bundles with this student's access) ---
export const fetchPracticeCatalog = createAsyncThunk(
  "studentPracticeCatalog/fetchPracticeCatalog",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/practice-catalog", {
        headers: getAuthHeaders(),
      });
      return response.data?.data || { sets: [], bundles: [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.err || error.message);
    }
  }
);

// --- Start a practice set: the server picks the questions and time limit ---
// Response matches /startPractice so the existing test player can run it.
export const startPracticeSet = createAsyncThunk(
  "studentPractice/startPracticeSet",
  async (practiceSetId, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/practice-sets/${practiceSetId}/start`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.err || error.message,
        code: error.response?.data?.code || null,
      });
    }
  }
);

export const savePracResults = createAsyncThunk(
  "studentPractice/savePracResults",
  async ({ pracId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/savePracResults/${pracId}`,
        { ...payload },
        { headers: getAuthHeaders() }
      );
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getStudentPracResults = createAsyncThunk(
  "studentPractice/getStudentPracResults",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/getStudentPracResults/${userId}`, {
        headers: getAuthHeaders(),
      });
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =================================================================
// --- STUDENT PRACTICE SLICE ---
// =================================================================

const StudentPracticeSlice = createSlice({
  name: "studentPractice",
  initialState,
  reducers: {
    setCategoryProgress: (state, action) => {
      const { category, progress } = action.payload;
      state.categoryProgress[category] = progress;
    },
    // Clear topics and subtopics when selecting a new subject
    clearTopicsAndSubtopics: (state) => {
      state.topics = [];
      state.subtopics = [];
    },
    // Clear only subtopics when selecting a new topic
    clearSubtopics: (state) => {
      state.subtopics = [];
    },
    // Reset error state
    clearError: (state) => {
      state.error = null;
    },
    // Reset status
    resetStatus: (state) => {
      state.status = "idle";
    },
    // Reset all data
    resetPracticeData: (state) => {
      state.subjects = [];
      state.topics = [];
      state.subtopics = [];
      state.status = "idle";
      state.error = null;
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

      // --- Topics Reducers ---
      .addCase(fetchTopicsBySubject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.topics = action.payload.data;
        // Clear subtopics when new topics are loaded
        state.subtopics = [];
      })

      // --- Subtopics Reducers ---
      .addCase(fetchSubtopicsByTopic.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.subtopics = action.payload.data;
      })
      .addCase(fetchPracQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.pracQuestions = action.payload.data;
      })
      .addCase(getStudentPracResults.fulfilled, (state, action) => {
        state.studentPracResults = action.payload.data?.data || [];
      })
      .addCase(startPracticeSet.pending, (state) => {
        state.pracQuestions = {};
      })
      .addCase(startPracticeSet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.pracQuestions = action.payload;
      })
      .addCase(fetchPracticeCatalog.pending, (state) => {
        state.catalogStatus = "loading";
        state.catalogError = null;
      })
      .addCase(fetchPracticeCatalog.fulfilled, (state, action) => {
        state.catalogStatus = "succeeded";
        state.catalog = action.payload;
      })
      .addCase(fetchPracticeCatalog.rejected, (state, action) => {
        state.catalogStatus = "failed";
        state.catalogError = action.payload || "Failed to load practice sets";
      });

    // --- Generic Loading/Error States ---
    builder
      .addMatcher(
        (action) =>
          action.type.startsWith("studentPractice/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("studentPractice/") &&
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

export const {
  setCategoryProgress,
  clearTopicsAndSubtopics,
  clearSubtopics,
  clearError,
  resetStatus,
  resetPracticeData,
} = StudentPracticeSlice.actions;

export default StudentPracticeSlice.reducer;
