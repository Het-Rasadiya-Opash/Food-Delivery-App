import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : { restaurantId: null, restaurantName: "", items: [] };
  } catch {
    return { restaurantId: null, restaurantName: "", items: [] };
  }
};

const initialState = loadCart();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { restaurantId, restaurantName, item } = action.payload;

      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = [];
      }

      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;

      ///same item add to cart -> +1 quantity  
      const existing = state.items.find(
        (i) => i.menuItemId === item.menuItemId,
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        // new item add in cart
        state.items.push({ ...item, quantity: 1 });
      }
    },
    incrementItem: (state, action) => {
      const item = state.items.find((i) => i.menuItemId === action.payload);
      if (item) item.quantity += 1;
    },
    decrementItem: (state, action) => {
      const index = state.items.findIndex(
        (i) => i.menuItemId === action.payload,
      );
      if (index !== -1) {
        if (state.items[index].quantity === 1) {
          state.items.splice(index, 1);
        } else {
          state.items[index].quantity -= 1;
        }
      }
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = "";
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.menuItemId !== action.payload);
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = "";
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = "";
    },
  },
});

export const {
  addToCart,
  incrementItem,
  decrementItem,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
