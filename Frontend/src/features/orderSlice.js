import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  cancelError: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateOrder: (state, action) => {
      const updated = action.payload;
      const idx = state.orders.findIndex((o) => o._id === updated._id);
      if (idx !== -1) state.orders[idx] = updated;
      state.cancelError = null;
    },
    setOrderLoading: (state, action) => {
      state.loading = action.payload;
    },
    setOrderError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCancelError: (state, action) => {
      state.cancelError = action.payload;
    },
    clearOrderErrors: (state) => {
      state.error = null;
      state.cancelError = null;
    },
  },
});

export const {
  setOrders,
  updateOrder,
  setOrderLoading,
  setOrderError,
  setCancelError,
  clearOrderErrors,
} = orderSlice.actions;

export default orderSlice.reducer;
