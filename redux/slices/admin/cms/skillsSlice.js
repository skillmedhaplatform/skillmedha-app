import { restUrl } from "@/config/urls";
import { getLstorage, setSstorage } from "@/utils/windowMW";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const restUrl = "http://localhost:2000";

export const addSkill = createAsyncThunk(
  "skills/addSkill",
  async (skillData, { rejectWithValue }) => {
    try {
      const response = await axios.post(restUrl + "/cms/skills", skillData, {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });
      setSstorage("localSkillId", response.data.skillId);
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to add skill"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const fetchSkills = createAsyncThunk(
  "skills/fetchSkills",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(restUrl + "/cms/skills", {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });
      return response.data.skills;
    } catch (error) {
      console.log(error);
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to fetch skills"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const getOneSKill = createAsyncThunk(
  "skills/fetchSkill",
  async (args, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        restUrl + `/cms/getOneSkill/${args?.skillId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to fetch skill"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const getSKillQuestions = createAsyncThunk(
  "skills/fetchSkillQuestions",
  async (args, { rejectWithValue }) => {
    try {
      const params = {
        type: "skill",
        refId: args?.skillId,
        ...(args?.page && { page: args.page }),
        ...(args?.limit && { limit: args.limit }),
      };

      const response = await axios.get(restUrl + `/cms/questions`, {
        params,
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to fetch skill questions"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const addQuestions = createAsyncThunk(
  "skills/addQuestions",
  async (questionsData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        restUrl + "/cms/addquestions",
        questionsData,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to add questions"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const getSingleQuestion = createAsyncThunk(
  "skills/getSingleQuestion",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        restUrl + `/cms/getSingleQuestion/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to fetch question"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const updateQuestions = createAsyncThunk(
  "skills/updateQuestions",
  async (questionData, { rejectWithValue }) => {
    try {
      const { id, ...data } = questionData;
      const response = await axios.put(restUrl + `/cms/questions/${id}`, data, {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to update question"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "skills/deleteQuestion",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(restUrl + `/cms/questions/${id}`, {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
        },
      });
      return { id, ...response.data };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to delete question"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const updateSkill = createAsyncThunk(
  "skills/updateSkill",
  async ({ skillId, skillData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        restUrl + `/cms/skills/${skillId}`,
        skillData,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to update skill"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

export const deleteSkill = createAsyncThunk(
  "/deleteSkill",
  async ({ skillId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.delete(restUrl + `/cms/skills/${skillId}`, {
        headers: {
          Authorization: `Bearer ${getLstorage("token")}`,
          "Content-Type": "application/json",
        },
      });
      dispatch(fetchSkills());
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.err || "Failed to delete skill"
        );
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  }
);

const SkillSlice = createSlice({
  name: "skills",
  initialState: {
    skills: {
      value: {},
      status: "idle",
      error: "",
    },
    addSkill: {
      value: {},
      status: "idle",
      error: "",
    },
    skillQuestions: {
      value: {},
      status: "idle",
      error: "",
    },
    skill: {
      value: {},
      status: "idle",
      error: "",
    },
    addQuestions: {
      value: {},
      status: "idle",
      error: "",
    },
    singleQuestion: {
      value: {},
      status: "idle",
      error: "",
    },
    updateQuestions: {
      value: {},
      status: "idle",
      error: "",
    },
    deleteQuestion: {
      value: {},
      status: "idle",
      error: "",
    },
    updateSkill: {
      value: {},
      status: "idle",
      error: "",
    },
  },
  reducers: {
    clearAddSkillState: (state) => {
      state.addSkill.status = "idle";
      state.addSkill.error = "";
      state.addSkill.value = {};
    },
    clearAddQuestionsState: (state) => {
      state.addQuestions.status = "idle";
      state.addQuestions.error = "";
      state.addQuestions.value = {};
    },
    clearUpdateQuestionsState: (state) => {
      state.updateQuestions.status = "idle";
      state.updateQuestions.error = "";
      state.updateQuestions.value = {};
    },
    clearSingleQuestionState: (state) => {
      state.singleQuestion.status = "idle";
      state.singleQuestion.error = "";
      state.singleQuestion.value = {};
    },
    clearDeleteQuestionState: (state) => {
      state.deleteQuestion.status = "idle";
      state.deleteQuestion.error = "";
      state.deleteQuestion.value = {};
    },
    clearError: (state) => {
      state.skills.error = "";
      state.addSkill.error = "";
      state.skill.error = "";
      state.skillQuestions.error = "";
      state.addQuestions.error = "";
      state.singleQuestion.error = "";
      state.updateQuestions.error = "";
      state.deleteQuestion.error = "";
    },
    clearUpdateSkillState: (state) => {
      state.updateSkill.status = "idle";
      state.updateSkill.error = "";
      state.updateSkill.value = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Skill Cases
      .addCase(addSkill.pending, (state) => {
        state.addSkill.status = "pending";
        state.addSkill.error = "";
      })
      .addCase(addSkill.fulfilled, (state, action) => {
        state.addSkill.status = "fulfilled";
        state.addSkill.value = action.payload;
      })
      .addCase(addSkill.rejected, (state, action) => {
        state.addSkill.status = "rejected";
        state.addSkill.error = action.payload;
      })

      // Fetch Skills Cases
      .addCase(fetchSkills.pending, (state) => {
        state.skills.status = "pending";
        state.skills.error = "";
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.skills.status = "fulfilled";
        state.skills.value = action.payload;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.skills.status = "rejected";
        state.skills.error = action.payload;
      })

      // Get Skill Questions Cases
      .addCase(getSKillQuestions.pending, (state) => {
        state.skillQuestions.status = "pending";
        state.skillQuestions.error = "";
      })
      .addCase(getSKillQuestions.fulfilled, (state, action) => {
        state.skillQuestions.status = "fulfilled";
        state.skillQuestions.value = action.payload;
      })
      .addCase(getSKillQuestions.rejected, (state, action) => {
        state.skillQuestions.status = "rejected";
        state.skillQuestions.error = action.payload;
      })

      // Get One Skill Cases
      .addCase(getOneSKill.pending, (state) => {
        state.skill.status = "pending";
        state.skill.error = "";
      })
      .addCase(getOneSKill.fulfilled, (state, action) => {
        state.skill.status = "fulfilled";
        state.skill.value = action.payload;
      })
      .addCase(getOneSKill.rejected, (state, action) => {
        state.skill.status = "rejected";
        state.skill.error = action.payload;
      })

      // Add Questions Cases
      .addCase(addQuestions.pending, (state) => {
        state.addQuestions.status = "pending";
        state.addQuestions.error = "";
      })
      .addCase(addQuestions.fulfilled, (state, action) => {
        state.addQuestions.status = "fulfilled";
        state.addQuestions.value = action.payload;
      })
      .addCase(addQuestions.rejected, (state, action) => {
        state.addQuestions.status = "rejected";
        state.addQuestions.error = action.payload;
      })

      // Get Single Question Cases
      .addCase(getSingleQuestion.pending, (state) => {
        state.singleQuestion.status = "pending";
        state.singleQuestion.error = "";
      })
      .addCase(getSingleQuestion.fulfilled, (state, action) => {
        state.singleQuestion.status = "fulfilled";
        state.singleQuestion.value = action.payload;
      })
      .addCase(getSingleQuestion.rejected, (state, action) => {
        state.singleQuestion.status = "rejected";
        state.singleQuestion.error = action.payload;
      })

      // Update Questions Cases
      .addCase(updateQuestions.pending, (state) => {
        state.updateQuestions.status = "pending";
        state.updateQuestions.error = "";
      })
      .addCase(updateQuestions.fulfilled, (state, action) => {
        state.updateQuestions.status = "fulfilled";
        state.updateQuestions.value = action.payload;
      })
      .addCase(updateQuestions.rejected, (state, action) => {
        state.updateQuestions.status = "rejected";
        state.updateQuestions.error = action.payload;
      })

      // Delete Question Cases
      .addCase(deleteQuestion.pending, (state) => {
        state.deleteQuestion.status = "pending";
        state.deleteQuestion.error = "";
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.deleteQuestion.status = "fulfilled";
        state.deleteQuestion.value = action.payload;
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.deleteQuestion.status = "rejected";
        state.deleteQuestion.error = action.payload;
      })

      .addCase(updateSkill.pending, (state) => {
        state.updateSkill.status = "pending";
        state.updateSkill.error = "";
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.updateSkill.status = "fulfilled";
        state.updateSkill.value = action.payload;
      })
      .addCase(updateSkill.rejected, (state, action) => {
        state.updateSkill.status = "rejected";
        state.updateSkill.error = action.payload;
      });
  },
});

export const {
  clearAddSkillState,
  clearAddQuestionsState,
  clearUpdateQuestionsState,
  clearSingleQuestionState,
  clearDeleteQuestionState,
  clearError,
} = SkillSlice.actions;

export default SkillSlice.reducer;
