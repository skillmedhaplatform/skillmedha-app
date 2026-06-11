import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { message } from "antd";
import { v4 as uuid } from "uuid";
import { gqlUrl, questionUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";

const QuestionSlice = createSlice({
  name: "Questions",
  initialState: {
    allQuestions : {
      data : [],
      cursor :"",
      hasNext : false
    },
    singleQuestion :{}
  },
  reducers: {
   
  },
  extraReducers: (builder) => {

    builder.addCase(allQues.fulfilled, (state, action) => {
      const { data, hasNext, cursor } = action.payload;
    
      state.allQuestions.data = Array.isArray(data.data) ? data.data : [];
      state.allQuestions.hasNext = hasNext ?? false;
      state.allQuestions.cursor = cursor ?? null;
    });
    
   
  },
});


export const allQues = createAsyncThunk(
  "/allQues",
  async ({ cursor, limit, category, questionType }) => {
    const token = getLstorage("token")
    const {data} = await axios.get(
     questionUrl + `/allQuestions?limit=${limit}&cursor=${cursor}` ,
      {
        headers: {
          Authorization: "Bearer "+token,
        },
      }
    );

    return data;
  }
);

export const deleteQuestion = createAsyncThunk("/deleteQuestion" , async (args) => {
  try {
     const token = getLstorage("token")
      const {questionIds , dispatch} = args

      const {data} = await axios.post(questionUrl + "/deleteQuestion", {
        questionIds
      },{
        headers : {
          Authorization : `Bearer ${token}`
        }
      })
      dispatch(allQues({limit : 10 , cursor : null}))

      if(data?.msg) message.success("Questions deleted successfully")
      return data
  } catch (error) {
    message.success("Failed to delete questions")
    console.log(error)
  }
})

export const {

} = QuestionSlice.actions;
export default QuestionSlice.reducer;
