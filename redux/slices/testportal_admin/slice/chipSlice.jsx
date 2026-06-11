const { createSlice } = require("@reduxjs/toolkit");
import { v4 as uuidv4,validate as uuidValidate } from 'uuid';
const ChipsSlice = createSlice({
    name: "ChipsData",
    initialState: {
        testCategory: [],
        questionTags : [],
        questionCategory: [],
        testLanguages: []
    },
    reducers : {
        addChip: (state,action) => {
            let chipId = uuidv4();
            if(action.payload._id) chipId = action.payload._id
            state[action.payload.keyName].push({
                ...action.payload,
                _id: chipId
            })
            console.log(uuidValidate("66a767ac012cd8da3be0a926"));
        },
        removeChip: (state,action) => {
            state[action.payload.keyName] = state[action.payload.keyName].filter(e => e._id !== action.payload.chipId)
        },
        initalizeChips: (state,action) => {
            let initChips = [];
            if(action.payload.initialValue) initChips = action.payload.initialValue
            state[action.payload.keyName] = initChips;
        }
    }
})

export const {addChip,removeChip,initalizeChips} = ChipsSlice.actions;

export default ChipsSlice.reducer;