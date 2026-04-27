import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  incrementItem,
  decrementItem,
  removeFromCart,
} from "../features/cartSlice";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Store } from "lucide-react";

const Cart = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, restaurantName, restaurantId } = useSelector(
    (state) => state.cart,
  );

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 p-6 bg-white relative">
        <div className="bg-orange-50 p-6 rounded-full mt-4">
          <ShoppingBag size={48} className="text-orange-300" />
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold text-gray-900">
            Your cart is empty
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Looks like you haven't added anything yet.
          </p>
        </div>
        <button
          onClick={() => {
            navigate("/");
            onClose?.();
          }}
          className="mt-4 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/50 flex items-center gap-3 z-10 sticky top-0">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
          <Store size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ordering from</p>
          <p className="text-sm font-extrabold text-gray-900">{restaurantName}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/30">
        {items.map((item) => (
          <div
            key={item.menuItemId}
            className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group relative"
          >
            <img
              src={
                item.image ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
              }
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover border border-gray-100"
            />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="pr-6">
                <p className="font-bold text-gray-900 text-sm line-clamp-1">
                  {item.name}
                </p>
                <p className="text-orange-600 font-extrabold mt-1">
                  ₹{item.price}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                  <button
                    onClick={() => dispatch(decrementItem(item.menuItemId))}
                    className="w-7 h-7 rounded-md bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors border border-gray-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-sm w-6 text-center text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => dispatch(incrementItem(item.menuItemId))}
                    className="w-7 h-7 rounded-md bg-orange-100 hover:bg-orange-500 hover:text-white text-orange-600 flex items-center justify-center transition-colors border border-orange-200 hover:border-orange-500"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => dispatch(removeFromCart(item.menuItemId))}
              className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 relative">
        <div className="flex justify-between items-center font-bold text-gray-900 text-lg mb-2">
          <span>Subtotal</span>
          <span className="text-2xl font-extrabold">₹{total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mb-6 font-medium">
          Taxes and delivery fees calculated at checkout.
        </p>
        <button
          onClick={() => {
            navigate("/place-order");
            onClose?.();
          }}
          className="w-full py-4 bg-orange-500 text-white font-extrabold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          Proceed to Checkout
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};

export default Cart;

