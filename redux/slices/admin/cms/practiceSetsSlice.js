import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({ baseURL: restUrl });

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getLstorage("jwtToken") || getLstorage("token")}`,
});

const errorMessage = (error) =>
  error.response?.data?.err || error.response?.data?.message || error.message;

// --- Plain helpers for the topic picker (local UI data, not stored in Redux) ---

export const getSubjectsByType = async (type) => {
  const { data } = await api.get(`/subjects/type/${type}`, { headers: getAuthHeaders() });
  return data?.data || [];
};

export const getTopicsBySubject = async (subjectId) => {
  const { data } = await api.get(`/topics/subject/${subjectId}`, { headers: getAuthHeaders() });
  return data?.data || [];
};

export const getSubtopicsByTopic = async (topicId) => {
  const { data } = await api.get(`/subtopics/topic/${topicId}`, { headers: getAuthHeaders() });
  return data?.data || [];
};

// selections: [{ subjectId, topicId?, subTopicId? }] — a whole subject, a topic or a subtopic.
export const getQuestionCount = async ({ selections, difficulty, category }) => {
  const { data } = await api.post(
    "/practice-sets/question-count",
    { selections, difficulty, category },
    { headers: getAuthHeaders() }
  );
  return data?.data?.count || 0;
};

// =================================================================
// --- Practice Set thunks ---
// =================================================================

export const fetchPracticeSets = createAsyncThunk(
  "adminPracticeSets/fetchPracticeSets",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/practice-sets", {
        params: filters,
        headers: getAuthHeaders(),
      });
      return data?.data || [];
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const fetchPracticeSet = createAsyncThunk(
  "adminPracticeSets/fetchPracticeSet",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/practice-sets/${id}`, { headers: getAuthHeaders() });
      return data?.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const createPracticeSet = createAsyncThunk(
  "adminPracticeSets/createPracticeSet",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/practice-sets", payload, { headers: getAuthHeaders() });
      return data?.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const updatePracticeSet = createAsyncThunk(
  "adminPracticeSets/updatePracticeSet",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      await api.put(`/practice-sets/${id}`, payload, { headers: getAuthHeaders() });
      return { id, payload };
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const deletePracticeSet = createAsyncThunk(
  "adminPracticeSets/deletePracticeSet",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/practice-sets/${id}`, { headers: getAuthHeaders() });
      return id;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

// =================================================================
// --- Bundle thunks ---
// =================================================================

export const fetchPracticeBundles = createAsyncThunk(
  "adminPracticeSets/fetchPracticeBundles",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/practice-bundles", {
        params: filters,
        headers: getAuthHeaders(),
      });
      return data?.data || [];
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const fetchPracticeBundle = createAsyncThunk(
  "adminPracticeSets/fetchPracticeBundle",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/practice-bundles/${id}`, { headers: getAuthHeaders() });
      return data?.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const createPracticeBundle = createAsyncThunk(
  "adminPracticeSets/createPracticeBundle",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/practice-bundles", payload, { headers: getAuthHeaders() });
      return data?.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const updatePracticeBundle = createAsyncThunk(
  "adminPracticeSets/updatePracticeBundle",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      await api.put(`/practice-bundles/${id}`, payload, { headers: getAuthHeaders() });
      return { id, payload };
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const deletePracticeBundle = createAsyncThunk(
  "adminPracticeSets/deletePracticeBundle",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/practice-bundles/${id}`, { headers: getAuthHeaders() });
      return id;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

// =================================================================
// --- Slice ---
// =================================================================

const initialState = {
  sets: [],
  bundles: [],
  // status can be 'idle' | 'loading' | 'succeeded' | 'failed'
  status: "idle",
  error: null,
};

const practiceSetsSlice = createSlice({
  name: "adminPracticeSets",
  initialState,
  reducers: {
    clearPracticeSetsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPracticeSets.fulfilled, (state, action) => {
        state.sets = action.payload;
      })
      .addCase(deletePracticeSet.fulfilled, (state, action) => {
        state.sets = state.sets.filter((s) => s._id !== action.payload);
      })
      .addCase(fetchPracticeBundles.fulfilled, (state, action) => {
        state.bundles = action.payload;
      })
      .addCase(deletePracticeBundle.fulfilled, (state, action) => {
        state.bundles = state.bundles.filter((b) => b._id !== action.payload);
      });

    builder
      .addMatcher(
        (action) =>
          action.type.startsWith("adminPracticeSets/") && action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("adminPracticeSets/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.status = "succeeded";
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("adminPracticeSets/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload || "Something went wrong";
        }
      );
  },
});

export const { clearPracticeSetsError } = practiceSetsSlice.actions;

export default practiceSetsSlice.reducer;
