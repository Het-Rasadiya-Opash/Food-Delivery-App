import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import { clearCart } from "../features/cartSlice";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const PlaceOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, restaurantId, restaurantName } = useSelector(
    (state) => state.cart,
  );
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

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const taxesAndFees = total * 0.1; // 10%
  const grandTotal = total + taxesAndFees;

  const handleChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest.post("/orders", {
        restaurantId,
        items: items.map(({ menuItemId, quantity }) => ({
          menuItemId,
          quantity,
        })),
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-gray-500 gap-4">
        <div className="bg-gray-50 p-8 rounded-full">
          <ShoppingBag size={64} className="text-gray-300" />
        </div>
        <p className="text-2xl font-bold text-gray-800">Your cart is empty</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition shadow-sm"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <MapPin className="text-orange-500" /> Delivery Details
              </h2>

              {error && (
                <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-2">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    placeholder="123 Main St, Apt 4B"
                    value={address.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={address.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={address.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP
                    </label>
                    <input
                      type="text"
                      name="zip"
                      placeholder="ZIP"
                      value={address.zip}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <FileText size={16} className="text-gray-400" /> Delivery
                    Instructions
                  </label>
                  <textarea
                    placeholder="E.g., Leave at the front door, ring doorbell..."
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <CreditCard className="text-orange-500" /> Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`relative flex items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${paymentMethod === "CASH" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    value="CASH"
                    checked={paymentMethod === "CASH"}
                    onChange={() => setPaymentMethod("CASH")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <span className="block text-sm font-bold text-gray-900">
                      Cash on Delivery
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Pay when your order arrives
                    </span>
                  </div>
                  {paymentMethod === "CASH" && (
                    <CheckCircle2 className="text-orange-500" size={20} />
                  )}
                </label>

                <label
                  className={`relative flex items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${paymentMethod === "ONLINE" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <span className="block text-sm font-bold text-gray-900">
                      Pay Online
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Credit/Debit Card, UPI
                    </span>
                  </div>
                  {paymentMethod === "ONLINE" && (
                    <CheckCircle2 className="text-orange-500" size={20} />
                  )}
                </label>
              </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Place Order • ₹{grandTotal.toFixed(2)}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>

            <div className="hidden lg:block">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Place Order • ₹{grandTotal.toFixed(2)}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 pb-24 lg:pb-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Order Summary
            </h2>
            <p className="text-sm font-medium text-orange-600 mb-6 pb-4 border-b border-gray-100">
              {restaurantName}
            </p>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-4">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    }
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxes & Fees (10%)</span>
                <span className="font-medium text-gray-900">
                  ₹{taxesAndFees.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>

              <div className="pt-3 flex justify-between font-extrabold text-gray-900 text-xl border-t border-gray-100">
                <span>Total</span>
                <span className="text-orange-600">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
