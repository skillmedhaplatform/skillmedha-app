import { createSlice } from "@reduxjs/toolkit";
import {v4 as uuidv4} from "uuid"

const linksSlice = createSlice({
    name:"Links",
    initialState: {
        value: [{
            title: "Add Link",
            url: "",
            id: uuidv4().split("-").join("")
           }],
           title:"Websites & Social Links"
    },
    reducers: {
        updateTitle: (state, action) => {
            state.title = action.payload;
          },
        addItem: (state,action) => {
           state.value.push({
            title: "Add Link",
            url: "",
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


export const {addItem,modifyItem,deleteItem,updateTitle} = linksSlice.actions;

export default linksSlice;