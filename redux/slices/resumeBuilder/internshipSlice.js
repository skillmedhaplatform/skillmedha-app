import { createSlice } from "@reduxjs/toolkit";
import {v4 as uuidv4} from "uuid"

const internshipSlice = createSlice({
    name:"Internship",
    initialState: {
        value: [{
            internship: "Add Internship",
            employer: "",
            start: "",
            end: "",
            city: "",
            desc:"",
            id: uuidv4().split("-").join("")
           }],
           title:"Internships"
    },
    reducers: {
        updateTitle: (state, action) => {
            state.title = action.payload;
          },
        addItem: (state,action) => {
           state.value.push({
            internship: "Add Internship",
            employer: "",
            start: "",
            end: "",
            city: "",
            desc:"",
            id: uuidv4().split("-").join("")
           })
        },
        modifyItem: (state,action) => {
            const {key,value,id} = action.payload;
            const tempArr = state.value.map(e => {
                if(e.id == id) {
                    return {
                        ...e,
                        [key]:value
                    }
                }
                return e;
            })
            state.value = tempArr;
        },
        deleteItem: (state,action) => {
            state.value = state.value.filter(e => e.id != action.payload)
        }
    }
})


export const {addItem,modifyItem,deleteItem,updateTitle} = internshipSlice.actions;

export default internshipSlice;