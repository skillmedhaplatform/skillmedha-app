import { createSlice } from "@reduxjs/toolkit";

const filterSlice = createSlice({
  name: "filter",
  initialState: {
    searchTerm: "",
    quickSearch: "",
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setQuickSearch: (state, action) => {
      state.quickSearch = action.payload;
    },
  },
});

export const { setSearchTerm, setQuickSearch } = filterSlice.actions;
export default filterSlice.reducer;
