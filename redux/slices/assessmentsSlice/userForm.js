const { createSlice } = require("@reduxjs/toolkit");

const UserFormSlice = createSlice({
    name: "UserForm",
    initialState: {
        value : {}
    },
    reducers: {
        formVals: (state,{payload}) => {
            state.value = payload;
        }
    }
})

export const {formVals} = UserFormSlice.actions;

export default UserFormSlice.reducer;