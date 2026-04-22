import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  cancelError: null,
  restaurantOrders: [],
  restaurantOrdersLoading: false,
  restaurantOrdersError: null,
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
      state.restaurantOrdersError = null;
    },
    setRestaurantOrders: (state, action) => {
      state.restaurantOrders = action.payload;
      state.restaurantOrdersLoading = false;
      state.restaurantOrdersError = null;
    },
    updateRestaurantOrder: (state, action) => {
      const updated = action.payload;
      const idx = state.restaurantOrders.findIndex((o) => o._id === updated._id);
      if (idx !== -1) state.restaurantOrders[idx] = updated;
    },
    setRestaurantOrderLoading: (state, action) => {
      state.restaurantOrdersLoading = action.payload;
    },
    setRestaurantOrderError: (state, action) => {
      state.restaurantOrdersError = action.payload;
      state.restaurantOrdersLoading = false;
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
  setRestaurantOrders,
  updateRestaurantOrder,
  setRestaurantOrderLoading,
  setRestaurantOrderError,
} = orderSlice.actions;

export default orderSlice.reducer;
