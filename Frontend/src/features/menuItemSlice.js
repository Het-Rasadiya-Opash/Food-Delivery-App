import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  menuItems: [],
  selectedMenuItem: null,
  loading: false,
  error: null,
};

const menuItemSlice = createSlice({
  name: "menuItem",
  initialState,
  reducers: {
    setMenuItems: (state, action) => {
      state.menuItems = action.payload;
      state.loading = false;
      state.error = null;
    },
    addMenuItem: (state, action) => {
      state.menuItems.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    setSelectedMenuItem: (state, action) => {
      state.selectedMenuItem = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateMenuItem: (state, action) => {
      const index = state.menuItems.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) state.menuItems[index] = action.payload;
      state.loading = false;
      state.error = null;
    },
    removeMenuItem: (state, action) => {
      state.menuItems = state.menuItems.filter((item) => item._id !== action.payload);
      state.loading = false;
    },
    setMenuItemLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMenuItemError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearMenuItems: (state) => {
      state.menuItems = [];
      state.selectedMenuItem = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setMenuItems,
  addMenuItem,
  setSelectedMenuItem,
  updateMenuItem,
  removeMenuItem,
  setMenuItemLoading,
  setMenuItemError,
  clearMenuItems,
} = menuItemSlice.actions;

export default menuItemSlice.reducer;
