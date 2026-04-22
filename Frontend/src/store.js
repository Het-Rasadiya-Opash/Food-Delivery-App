import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/usersSlice";
import restaurantReducer from "./features/restaurantSlice";
import menuItemReducer from "./features/menuItemSlice";
import cartReducer from "./features/cartSlice";
import orderReducer from "./features/orderSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    restaurant: restaurantReducer,
    menuItem: menuItemReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
});

store.subscribe(() => {
  try {
    localStorage.setItem("cart", JSON.stringify(store.getState().cart));
  } catch { }
});
