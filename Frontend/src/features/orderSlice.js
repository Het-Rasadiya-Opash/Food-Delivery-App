import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  cancelError: null,
  currentOrder: null,
  currentOrderLoading: false,
  currentOrderError: null,
  restaurantOrders: [],
  restaurantOrdersLoading: false,
  restaurantOrdersError: null,
  availableOrders: [],
  availableOrdersLoading: false,
  availableOrdersError: null,
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
      if (state.currentOrder?._id === updated._id) {
        state.currentOrder = updated;
      }
      state.cancelError = null;
    },
    setOrderLoading: (state, action) => {
      state.loading = action.payload;
    },
    setOrderError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
      state.currentOrderLoading = false;
      state.currentOrderError = null;
    },
    setCurrentOrderLoading: (state, action) => {
      state.currentOrderLoading = action.payload;
    },
    setCurrentOrderError: (state, action) => {
      state.currentOrderError = action.payload;
      state.currentOrderLoading = false;
    },
    setCancelError: (state, action) => {
      state.cancelError = action.payload;
    },
    clearOrderErrors: (state) => {
      state.error = null;
      state.cancelError = null;
      state.restaurantOrdersError = null;
      state.currentOrderError = null;
      state.availableOrdersError = null;
    },
    setRestaurantOrders: (state, action) => {
      state.restaurantOrders = action.payload;
      state.restaurantOrdersLoading = false;
      state.restaurantOrdersError = null;
    },
    updateRestaurantOrder: (state, action) => {
      const updated = action.payload;
      const idx = state.restaurantOrders.findIndex(
        (o) => o._id === updated._id,
      );
      if (idx !== -1) state.restaurantOrders[idx] = updated;
    },
    setRestaurantOrderLoading: (state, action) => {
      state.restaurantOrdersLoading = action.payload;
    },
    setRestaurantOrderError: (state, action) => {
      state.restaurantOrdersError = action.payload;
      state.restaurantOrdersLoading = false;
    },
    setAvailableOrders: (state, action) => {
      state.availableOrders = action.payload;
      state.availableOrdersLoading = false;
      state.availableOrdersError = null;
    },
    setAvailableOrdersLoading: (state, action) => {
      state.availableOrdersLoading = action.payload;
    },
    setAvailableOrdersError: (state, action) => {
      state.availableOrdersError = action.payload;
      state.availableOrdersLoading = false;
    },
    updateAvailableOrder: (state, action) => {
      const updated = action.payload;
      const idx = state.availableOrders.findIndex((o) => o._id === updated._id);
      if (idx !== -1) state.availableOrders[idx] = updated;
    },
    clearAllOrders: (state) => {
      return initialState;
    },
  },
});

export const {
  setOrders,
  updateOrder,
  setOrderLoading,
  setOrderError,
  setCurrentOrder,
  setCurrentOrderLoading,
  setCurrentOrderError,
  setCancelError,
  clearOrderErrors,
  setRestaurantOrders,
  updateRestaurantOrder,
  setRestaurantOrderLoading,
  setRestaurantOrderError,
  setAvailableOrders,
  setAvailableOrdersLoading,
  setAvailableOrdersError,
  updateAvailableOrder,
  clearAllOrders,
} = orderSlice.actions;

export default orderSlice.reducer;

