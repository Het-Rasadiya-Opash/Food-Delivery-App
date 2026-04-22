import React, { useEffect, useState } from "react";
import apiRequest from "../utils/apiRequest";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  PLACED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-yellow-100 text-yellow-700",
  PREPARING: "bg-orange-100 text-orange-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get("/orders/my-orders");
        setOrders(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      const res = await apiRequest.patch(`/orders/${orderId}/cancel`, {
        cancelReason: "Cancelled by customer",
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.data : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Cannot cancel order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-lg mb-3">No orders yet</p>
          <button onClick={() => navigate("/")} className="text-red-500 underline">
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-md p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {order.restaurant?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.menuItemId} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                    <span className="text-sm font-semibold text-red-500">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-bold text-gray-800">
                  Total: ₹{order.totalPrice.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  {["PLACED", "ACCEPTED"].includes(order.status) && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="px-4 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
