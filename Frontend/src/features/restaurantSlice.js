import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  restaurant: null,
  restaurants: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    setRestaurant: (state, action) => {
      state.restaurant = action.payload;
      state.loading = false;
      state.error = null;
    },
    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
      state.loading = false;
      state.error = null;
    },
    setRestaurantLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRestaurantError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearRestaurant: (state) => {
      state.restaurant = null;
      state.error = null;
      state.loading = false;
    },
    removeRestaurant: (state, action) => {
      state.restaurants = state.restaurants.filter(
        (r) => r._id !== action.payload,
      );
    },
  },
});

export const {
  setRestaurant,
  setRestaurants,
  setSelectedRestaurant,
  setRestaurantLoading,
  setRestaurantError,
  clearRestaurant,
  removeRestaurant,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;
