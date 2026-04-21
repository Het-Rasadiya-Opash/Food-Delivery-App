import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/usersSlice";
import restaurantReducer from "./features/restaurantSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    restaurant: restaurantReducer,
  },
});
