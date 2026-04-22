import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import { clearCart } from "../features/cartSlice";

const PlaceOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, restaurantId, restaurantName } = useSelector((state) => state.cart);
  const { currentUser } = useSelector((state) => state.users);

  const [address, setAddress] = useState({
    street: currentUser?.address?.street || "",
    city: currentUser?.address?.city || "",
    state: currentUser?.address?.state || "",
    zip: currentUser?.address?.zip || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest.post("/orders", {
        restaurantId,
        items: items.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
        deliveryAddress: address,
        paymentMethod,
        deliveryNotes,
      });
      dispatch(clearCart());
      navigate("/my-orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-500 gap-3">
        <span className="text-5xl">🛒</span>
        <p className="text-lg">Your cart is empty</p>
        <button onClick={() => navigate("/")} className="text-red-500 underline">
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">

        <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Delivery Details</h2>

          {error && <div className="text-sm text-red-500 bg-red-100 p-2 rounded">{error}</div>}

          <input
            type="text"
            name="street"
            placeholder="Street *"
            value={address.street}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="city"
              placeholder="City *"
              value={address.city}
              onChange={handleChange}
              required
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <input
              type="text"
              name="zip"
              placeholder="ZIP"
              value={address.zip}
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <textarea
            placeholder="Delivery notes (optional)"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            rows={2}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Payment Method</p>
            <div className="flex gap-4">
              {["CASH", "ONLINE"].map((method) => (
                <label key={method} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? "Placing Order..." : `Place Order • ₹${total.toFixed(2)}`}
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
          <p className="text-sm text-gray-500">{restaurantName}</p>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">x{item.quantity}</p>
                  <p className="text-sm text-red-500 font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between font-bold text-gray-800 text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
