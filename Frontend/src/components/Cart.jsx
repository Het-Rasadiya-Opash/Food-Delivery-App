import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { incrementItem, decrementItem, removeFromCart } from "../features/cartSlice";

const Cart = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, restaurantName, restaurantId } = useSelector((state) => state.cart);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
        <span className="text-5xl">🛒</span>
        <p className="text-lg font-medium">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Your Cart</h2>
      <p className="text-sm text-gray-500 mb-4">{restaurantName}</p>

      <div className="flex-1 overflow-y-auto space-y-4">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
              <p className="text-red-500 font-bold text-sm">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(decrementItem(item.menuItemId))}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 flex items-center justify-center"
              >
                −
              </button>
              <span className="font-semibold w-4 text-center">{item.quantity}</span>
              <button
                onClick={() => dispatch(incrementItem(item.menuItemId))}
                className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button
              onClick={() => dispatch(removeFromCart(item.menuItemId))}
              className="text-gray-400 hover:text-red-500 text-lg ml-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mt-4 space-y-3">
        <div className="flex justify-between font-bold text-gray-800 text-lg">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => { navigate("/place-order"); onClose?.(); }}
          className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
