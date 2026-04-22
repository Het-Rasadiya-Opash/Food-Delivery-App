import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import {
  setRestaurantOrders,
  updateRestaurantOrder,
  setRestaurantOrderLoading,
  setRestaurantOrderError,
} from "../features/orderSlice";

const STATUS_COLORS = {
  PLACED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ACCEPTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PREPARING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  OUT_FOR_DELIVERY: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const TABS = ["All", "New", "Active", "Done"];

const RestaurantOrderQueue = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.users.currentUser);
  const orders = useSelector((state) => state.orders.restaurantOrders ?? []);
  const loading = useSelector((state) => state.orders.restaurantOrdersLoading);
  const error = useSelector((state) => state.orders.restaurantOrdersError);

  const [restaurantId, setRestaurantId] = useState(null);
  const [activeTab, setActiveTab] = useState("New");
  const [isActionLoading, setIsActionLoading] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await apiRequest.get("/restaurants/owner");
        if (res.data.data?._id) {
          setRestaurantId(res.data.data._id);
        } else {
          dispatch(
            setRestaurantOrderError("No restaurant found for this account."),
          );
        }
      } catch (err) {
        dispatch(
          setRestaurantOrderError("Failed to verify restaurant access."),
        );
      }
    };
    if (currentUser?.role === "Restaurant Manager") {
      fetchRestaurant();
    } else {
      dispatch(setRestaurantOrderError("Not authorized."));
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    const fetchOrders = async (showLoading = false) => {
      if (!restaurantId) return;

      try {
        if (showLoading && orders.length === 0) {
          dispatch(setRestaurantOrderLoading(true));
        }

        const res = await apiRequest.get(
          `/orders/restaurant-manager/${restaurantId}`,
        );

        dispatch(setRestaurantOrders(res.data.data));
      } catch (err) {
        dispatch(
          setRestaurantOrderError(
            err.response?.data?.message || "Failed to load queue.",
          ),
        );
      }
    };

    fetchOrders(true);
  }, [restaurantId, dispatch, orders.length]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setIsActionLoading(orderId);
      const res = await apiRequest.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        ...(newStatus === "CANCELLED" && {
          cancelReason: "Rejected by Restaurant",
        }),
      });
      dispatch(updateRestaurantOrder(res.data.data));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setIsActionLoading(null);
    }
  };

  const getFilteredOrders = () => {
    return orders.filter((o) => {
      if (activeTab === "All") return true;
      if (activeTab === "New") return o.status === "PLACED";
      if (activeTab === "Active")
        return ["ACCEPTED", "PREPARING"].includes(o.status);
      if (activeTab === "Done")
        return ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].includes(
          o.status,
        );
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();
  const newCount = orders.filter((o) => o.status === "PLACED").length;

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders Queue</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-sm"
          >
            Back
          </button>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                activeTab === tab
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
            >
              {tab}
              {tab === "New" && newCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">No orders found</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg">
                    #{order._id.slice(-6)}
                  </h2>
                  <span
                    className={`px-3 py-1 text-xs border rounded-full ${
                      STATUS_COLORS[order.status]
                    }`}
                  >
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  {order.customer?.name || "Customer"}
                </div>

                <div className="space-y-1 mb-4">
                  {order.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-semibold mb-4">
                  <span>Total</span>
                  <span>₹{order.totalPrice}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {order.status === "PLACED" && (
                    <>
                      <button
                        disabled={isActionLoading === order._id}
                        onClick={() =>
                          handleUpdateStatus(order._id, "ACCEPTED")
                        }
                        className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        disabled={isActionLoading === order._id}
                        onClick={() =>
                          handleUpdateStatus(order._id, "CANCELLED")
                        }
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {order.status === "ACCEPTED" && (
                    <button
                      disabled={isActionLoading === order._id}
                      onClick={() => handleUpdateStatus(order._id, "PREPARING")}
                      className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      Start Preparing
                    </button>
                  )}

                  {order.status === "PREPARING" && (
                    <button
                      disabled={isActionLoading === order._id}
                      onClick={() =>
                        handleUpdateStatus(order._id, "OUT_FOR_DELIVERY")
                      }
                      className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      Out for Delivery
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrderQueue;
