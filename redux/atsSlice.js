import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.NEXT_PUBLIC_STUDENT_URL || "http://localhost:5000";

const getSuggestionId = (s, idx) =>
  s?.id ?? s?._id ?? s?.suggestionId ?? `s-${idx}`;

const getToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );
};

/* ---------------- THUNKS ---------------- */

export const uploadResumeToS3 = createAsyncThunk(
  "ats/uploadResumeToS3",
  async ({ file, studentId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("studentId", studentId || "anonymous");
      // formData.append("orgId", 'jntua_68ad5fd98bd05951fc9126de');


      const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Upload failed");
      return result?.data ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteResumeFromS3 = createAsyncThunk(
  "ats/deleteResumeFromS3",
  async (fileKey, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete-resume`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Delete failed");
      return result?.data ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentResume = createAsyncThunk(
  "ats/fetchCurrentResume",
  async (studentId, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/api/resume/${studentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Failed to fetch current resume");
      return result?.data ?? null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const analyzeResume = createAsyncThunk(
  "ats/analyzeResume",
  async ({ blobName, jobDescription, studentId, resumeId, fileUrl }, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/ats/analyze-existing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          blobName,
          studentId: studentId || "anonymous",
          jobDescription: jobDescription || "",
          resumeId,
          fileUrl,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Analysis failed");
      return result?.data ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAnalysisById = createAsyncThunk(
  "ats/fetchAnalysisById",
  async (analysisId, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/ats/analysis/${analysisId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Failed to fetch analysis");
      return result?.data ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchATSHistory = createAsyncThunk(
  "ats/fetchATSHistory",
  async ({ studentId, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const token = getToken();
      const sid = studentId || "anonymous";

      const response = await fetch(
        `${API_BASE_URL}/ats/history/${sid}?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Failed to fetch history");

      const items =
        result?.data?.items ||
        result?.data?.history ||
        result?.data ||
        result?.items ||
        result?.history ||
        (Array.isArray(result) ? result : []);

      return Array.isArray(items) ? items : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateUpdatedResume = createAsyncThunk(
  "ats/generateUpdatedResume",
  async ({ analysisId, decisions }, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/ats/generate-updated-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ analysisId, decisions: decisions || {} }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Failed to generate updated resume");
      return result?.data ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitATSFeedback = createAsyncThunk(
  "ats/submitATSFeedback",
  async (payload, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/ats/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Failed to submit feedback");
      return result?.data ?? result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* ---------------- INITIAL STATE ---------------- */

const initialState = {
  activeTab: "upload",
  currentAnalysis: null,
  history: [],
  historyStatus: "idle",
  uploadStatus: "idle",
  analysisStatus: "idle",
  deleteStatus: "idle",
  feedbackStatus: "idle",
  downloadStatus: "idle",
  downloadUrl: "",
  jobDescription: "",
  selectedFile: null,
  uploadedFileKey: null,
  uploadedFileUrl: null,
  currentResume: null,
  currentResumeStatus: "idle",
  decisions: {},
  showFeedbackModal: false,
  error: null,
};

/* ---------------- SLICE ---------------- */

const atsSlice = createSlice({
  name: "ats",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setShowFeedbackModal: (state, action) => {
      state.showFeedbackModal = action.payload;
    },
    setJobDescription: (state, action) => {
      state.jobDescription = action.payload;
    },
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
    },
    setDecision: (state, action) => {
      const { suggestionId, decision } = action.payload || {};
      if (!suggestionId) return;
      state.decisions[suggestionId] = decision;
    },
    setSuggestionDecision: (state, action) => {
      const { suggestionId, decision } = action.payload || {};
      if (!suggestionId) return;
      state.decisions[suggestionId] = decision;
    },
    keepAllSuggestions: (state) => {
      Object.keys(state.decisions).forEach((id) => {
        state.decisions[id] = "keep";
      });
    },
    abortAllSuggestions: (state) => {
      Object.keys(state.decisions).forEach((id) => {
        state.decisions[id] = "abort";
      });
    },
    resetDecisions: (state) => {
      state.decisions = {};
    },
    resetUpload: (state) => {
      state.selectedFile = null;
      state.uploadedFileKey = null;
      state.uploadedFileUrl = null;
      state.uploadStatus = "idle";
      state.error = null;
    },
    resetAnalysis: (state) => {
      state.currentAnalysis = null;
      state.decisions = {};
      state.analysisStatus = "idle";
      state.downloadStatus = "idle";
      state.downloadUrl = "";
      state.jobDescription = "";
      state.activeTab = "upload";
      state.error = null;
    },
    resetFeedbackStatus: (state) => {
      state.feedbackStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      /* upload */
      .addCase(uploadResumeToS3.pending, (state) => {
        state.uploadStatus = "uploading";
        state.error = null;
      })
      .addCase(uploadResumeToS3.fulfilled, (state, action) => {
        state.uploadStatus = "uploaded";
        state.uploadedFileKey = action.payload?.blobName || null;
        state.uploadedFileUrl = action.payload?.sasUrl || action.payload?.fileUrl || null;
      })
      .addCase(uploadResumeToS3.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.error = action.payload;
      })

      /* delete */
      .addCase(deleteResumeFromS3.pending, (state) => {
        state.deleteStatus = "deleting";
        state.error = null;
      })
      .addCase(deleteResumeFromS3.fulfilled, (state) => {
        state.deleteStatus = "deleted";
        state.uploadedFileKey = null;
        state.uploadedFileUrl = null;
        state.currentResume = null;
      })
      .addCase(deleteResumeFromS3.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload;
      })

      /* current resume */
      .addCase(fetchCurrentResume.pending, (state) => {
        state.currentResumeStatus = "loading";
      })
      .addCase(fetchCurrentResume.fulfilled, (state, action) => {
        state.currentResumeStatus = "succeeded";
        state.currentResume = action.payload || null;
      })
      .addCase(fetchCurrentResume.rejected, (state, action) => {
        state.currentResumeStatus = "failed";
        state.error = action.payload;
      })

      /* analyze */
      .addCase(analyzeResume.pending, (state) => {
        state.analysisStatus = "analyzing";
        state.error = null;
      })
      .addCase(analyzeResume.fulfilled, (state, action) => {
        state.analysisStatus = "completed";
        state.currentAnalysis = action.payload || null;
        state.activeTab = "report";

        const suggestions = action.payload?.suggestions || [];
        const nextDecisions = {};
        suggestions.forEach((s, idx) => {
          nextDecisions[getSuggestionId(s, idx)] = null;
        });
        state.decisions = nextDecisions;
      })
      .addCase(analyzeResume.rejected, (state, action) => {
        state.analysisStatus = "failed";
        state.error = action.payload;
      })

      /* fetch by id */
      .addCase(fetchAnalysisById.pending, (state) => {
        state.analysisStatus = "analyzing";
        state.error = null;
      })
      .addCase(fetchAnalysisById.fulfilled, (state, action) => {
        state.analysisStatus = "completed";
        state.currentAnalysis = action.payload || null;
        state.activeTab = "report";

        const suggestions = action.payload?.suggestions || [];
        const nextDecisions = {};
        suggestions.forEach((s, idx) => {
          nextDecisions[getSuggestionId(s, idx)] = null;
        });
        state.decisions = nextDecisions;
      })
      .addCase(fetchAnalysisById.rejected, (state, action) => {
        state.analysisStatus = "failed";
        state.error = action.payload;
      })

      /* history */
      .addCase(fetchATSHistory.pending, (state) => {
        state.historyStatus = "loading";
        state.error = null;
      })
      .addCase(fetchATSHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchATSHistory.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.error = action.payload;
      })

      /* generate resume */
      .addCase(generateUpdatedResume.pending, (state) => {
        state.downloadStatus = "loading";
        state.error = null;
      })
      .addCase(generateUpdatedResume.fulfilled, (state, action) => {
        state.downloadStatus = "ready";
        state.downloadUrl =
          action.payload?.downloadUrl ||
          action.payload?.updatedResumeUrl ||
          action.payload?.fileUrl ||
          "";
      })
      .addCase(generateUpdatedResume.rejected, (state, action) => {
        state.downloadStatus = "error";
        state.error = action.payload;
      })

      /* feedback */
      .addCase(submitATSFeedback.pending, (state) => {
        state.feedbackStatus = "submitting";
        state.error = null;
      })
      .addCase(submitATSFeedback.fulfilled, (state) => {
        state.feedbackStatus = "submitted";
      })
      .addCase(submitATSFeedback.rejected, (state, action) => {
        state.feedbackStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setActiveTab,
  setShowFeedbackModal,
  setJobDescription,
  setSelectedFile,
  setDecision,
  setSuggestionDecision,
  keepAllSuggestions,
  abortAllSuggestions,
  resetDecisions,
  resetUpload,
  resetAnalysis,
  resetFeedbackStatus,
} = atsSlice.actions;

export default atsSlice.reducer;