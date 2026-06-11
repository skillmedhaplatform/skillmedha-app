const { createSlice } = require("@reduxjs/toolkit");

const SideBarSlice = createSlice({
    name: "SideBar",
    initialState: {
        collapse : false
    },
    reducers: {
        changeCollapse: (state,{payload}) => {
            state.collapse = payload;
        }
    }
})

export const {changeCollapse} = SideBarSlice.actions;

export default SideBarSlice.reducer;