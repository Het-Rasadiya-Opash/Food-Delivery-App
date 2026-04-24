import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import socket from "../socket";
import {
  setRestaurantOrders,
  updateRestaurantOrder,
  setRestaurantOrderLoading,
  setRestaurantOrderError,
} from "../features/orderSlice";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  XCircle,
  Filter,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  MapPin,
  Phone,
} from "lucide-react";

const STATUS_CONFIG = {
  PLACED: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Clock size={16} />,
  },
  ACCEPTED: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <CheckCircle size={16} />,
  },
  PREPARING: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <ChefHat size={16} />,
  },
  READY_FOR_PICKUP: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <ShoppingBag size={16} />,
  },
  OUT_FOR_DELIVERY: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <Truck size={16} />,
  },
  DELIVERED: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle size={16} />,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle size={16} />,
  },
};

const TABS = [
  { id: "All", label: "All Orders", icon: <Filter size={16} /> },
  { id: "New", label: "New", icon: <Clock size={16} /> },
  { id: "Active", label: "Active", icon: <ChefHat size={16} /> },
  { id: "Done", label: "Completed", icon: <CheckCircle size={16} /> },
];

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

  useEffect(() => {
    fetchOrders(true);
  }, [restaurantId, dispatch]);

  useEffect(() => {
    if (restaurantId) {
      socket.emit("join_restaurant_room", restaurantId);

      socket.on("new_order", (newOrder) => {
        console.log("New order received via socket:", newOrder);
        dispatch(setRestaurantOrders([newOrder, ...orders]));
      });

      return () => {
        socket.off("new_order");
      };
    }
  }, [restaurantId, orders, dispatch]);

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
        return [
          "ACCEPTED",
          "PREPARING",
          "READY_FOR_PICKUP",
          "OUT_FOR_DELIVERY",
        ].includes(o.status);
      if (activeTab === "Done")
        return ["DELIVERED", "CANCELLED"].includes(o.status);
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();
  const newCount = orders.filter((o) => o.status === "PLACED").length;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-800">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                Order Queue
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage incoming orders and track their status in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchOrders(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 text-sm font-medium"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin text-orange-500" : ""}
            />
            Refresh Queue
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white border border-gray-900"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "New" && newCount > 0 && (
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-white text-gray-900" : "bg-red-500 text-white"}`}
                >
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              There are currently no orders in the {activeTab.toLowerCase()}{" "}
              queue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const statusConfig =
                STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;

              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h2 className="font-extrabold text-gray-900 text-lg">
                          #{order._id.slice(-6).toUpperCase()}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock size={12} />{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold border rounded-full ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <span className="font-bold text-sm">
                          {(order.customer?.name || "C")[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {order.customer?.name || "Customer"}
                        </p>
                        {order.deliveryAddress && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 line-clamp-1">
                            <MapPin size={12} /> {order.deliveryAddress.street},{" "}
                            {order.deliveryAddress.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 bg-gray-50/50">
                    <div className="space-y-3">
                      {order.items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-start"
                        >
                          <div className="flex gap-2">
                            <span className="font-bold text-gray-900 text-sm">
                              {item.quantity}x
                            </span>
                            <span className="text-sm text-gray-700 font-medium">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Actions */}
                  <div className="p-5 border-t border-gray-100 bg-white rounded-b-2xl">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-gray-500 font-medium text-sm">
                        Total Amount
                      </span>
                      <span className="text-xl font-extrabold text-gray-900">
                        ₹{order.totalPrice}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      {order.status === "PLACED" && (
                        <>
                          <button
                            disabled={isActionLoading === order._id}
                            onClick={() =>
                              handleUpdateStatus(order._id, "ACCEPTED")
                            }
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle size={18} /> Accept
                          </button>
                          <button
                            disabled={isActionLoading === order._id}
                            onClick={() =>
                              handleUpdateStatus(order._id, "CANCELLED")
                            }
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors border border-red-200"
                          >
                            <XCircle size={18} /> Reject
                          </button>
                        </>
                      )}

                      {order.status === "ACCEPTED" && (
                        <button
                          disabled={isActionLoading === order._id}
                          onClick={() =>
                            handleUpdateStatus(order._id, "PREPARING")
                          }
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-lg shadow-orange-500/20"
                        >
                          <ChefHat size={18} /> Start Preparing
                        </button>
                      )}

                      {order.status === "PREPARING" && (
                        <button
                          disabled={isActionLoading === order._id}
                          onClick={() =>
                            handleUpdateStatus(order._id, "READY_FOR_PICKUP")
                          }
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-lg shadow-orange-600/20"
                        >
                          <ShoppingBag size={18} /> Ready for Pickup
                        </button>
                      )}

                      {[
                        "READY_FOR_PICKUP",
                        "OUT_FOR_DELIVERY",
                        "DELIVERED",
                        "CANCELLED",
                      ].includes(order.status) && (
                        <div className="w-full flex justify-center py-3 bg-gray-50 rounded-xl text-gray-500 text-sm font-medium border border-gray-100">
                          {order.status === "CANCELLED"
                            ? "Order Cancelled"
                            : "Order Processed"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrderQueue;
