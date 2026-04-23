import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import {
  Truck,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Navigation,
  User,
  ShoppingBag,
  Info,
  ChevronRight,
  IndianRupee,
  Star,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  setAvailableOrders,
  setAvailableOrdersLoading,
  setAvailableOrdersError,
  setOrders,
  setOrderLoading,
  setOrderError,
  updateOrder,
  updateAvailableOrder,
} from "../features/orderSlice";

const STATUS_CONFIG = {
  OUT_FOR_DELIVERY: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <Navigation size={14} />,
    label: "Out for Delivery",
  },
  DELIVERED: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle size={14} />,
    label: "Delivered",
  },
  READY_FOR_PICKUP: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <Info size={14} />,
    label: "Ready for Pickup",
  },
};

const TABS = [
  { id: "available", label: "Available Orders", icon: <Package size={18} /> },
  { id: "my-orders", label: "My Deliveries", icon: <Truck size={18} /> },
];

const DriverDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.users.currentUser);

  const availableOrders = useSelector((state) => state.orders.availableOrders);
  const availableLoading = useSelector(
    (state) => state.orders.availableOrdersLoading,
  );
  const availableError = useSelector(
    (state) => state.orders.availableOrdersError,
  );

  const myOrders = useSelector((state) => state.orders.orders);
  const myLoading = useSelector((state) => state.orders.loading);
  const myError = useSelector((state) => state.orders.error);

  const [tab, setTab] = useState("available");

  const fetchAvailable = async () => {
    try {
      dispatch(setAvailableOrdersLoading(true));
      const res = await apiRequest.get("/orders/driver/available");
      dispatch(setAvailableOrders(res.data.data));
    } catch (err) {
      dispatch(
        setAvailableOrdersError(
          err.response?.data?.message || "Failed to load orders",
        ),
      );
    }
  };

  const fetchMyOrders = async () => {
    try {
      dispatch(setOrderLoading(true));
      const res = await apiRequest.get("/orders/driver/my-orders");
      dispatch(setOrders(res.data.data));
    } catch (err) {
      dispatch(
        setOrderError(err.response?.data?.message || "Failed to load orders"),
      );
    }
  };

  useEffect(() => {
    if (tab === "available") fetchAvailable();
    else fetchMyOrders();
  }, [tab]);

  const handleClaim = async (orderId) => {
    try {
      await apiRequest.patch(`/orders/${orderId}/claim`);
      dispatch(
        setAvailableOrders(availableOrders.filter((o) => o._id !== orderId)),
      );
      setTab("my-orders");
      fetchMyOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to claim order");
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const res = await apiRequest.patch(`/orders/${orderId}/driver-status`, {
        status,
      });
      dispatch(updateOrder(res.data.data));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const loading = tab === "available" ? availableLoading : myLoading;
  const error = tab === "available" ? availableError : myError;

  if (loading && availableOrders.length === 0 && myOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Truck className="text-orange-600" size={28} />
                  Driver Dashboard
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                Welcome back,{" "}
                <span className="font-bold text-gray-700">
                  {currentUser?.username}
                </span>
                !
                {currentUser?.rating > 0 && (
                  <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-orange-100">
                    <Star size={12} fill="currentColor" />
                    {currentUser.rating.toFixed(1)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              tab === "available" ? fetchAvailable() : fetchMyOrders()
            }
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 text-sm font-semibold"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin text-orange-500" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                tab === t.id
                  ? "bg-gray-900 text-white border border-gray-900"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === "available" && availableOrders.length > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${tab === t.id ? "bg-white text-gray-900" : "bg-orange-500 text-white"}`}
                >
                  {availableOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "available" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableOrders.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  No Orders Available
                </h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                  All caught up! Check back later for new delivery opportunities
                  in your area.
                </p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            New Order
                          </span>
                          <h2 className="font-extrabold text-gray-900 text-lg">
                            #{order._id.slice(-6).toUpperCase()}
                          </h2>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                          <Clock size={12} /> Just now
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold border rounded-full bg-orange-50 text-orange-700 border-orange-100">
                        <Info size={12} /> Ready
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100 text-orange-600">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {order.restaurant?.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {order.restaurant?.address?.street},{" "}
                            {order.restaurant?.address?.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 border border-dashed border-gray-200 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                          <Navigation size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                            Delivery Location
                          </p>
                          <p className="text-xs font-semibold text-gray-700 mt-0.5 line-clamp-1">
                            {order.deliveryAddress?.street},{" "}
                            {order.deliveryAddress?.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-2xl shadow-lg shadow-gray-900/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Earnings
                        </span>
                        <div className="flex items-center text-white font-extrabold text-xl">
                          <IndianRupee size={18} />
                          {order.totalPrice?.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaim(order._id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-600/20"
                      >
                        Claim <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "my-orders" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myOrders.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Truck size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  No Active Deliveries
                </h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                  You haven't claimed any orders yet. Go to "Available Orders"
                  to find work!
                </p>
              </div>
            ) : (
              myOrders.map((order) => {
                const statusCfg =
                  STATUS_CONFIG[order.status] || STATUS_CONFIG.READY_FOR_PICKUP;
                return (
                  <div
                    key={order._id}
                    className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-extrabold text-gray-900 text-lg">
                              #{order._id.slice(-6).toUpperCase()}
                            </h2>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {new Date(order.createdAt).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold border rounded-full ${statusCfg.color}`}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                            <User size={10} /> Customer
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {order.user?.username || "Guest User"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                            <MapPin size={10} /> Destination
                          </p>
                          <p className="text-sm font-semibold text-gray-700 line-clamp-1">
                            {order.deliveryAddress?.street},{" "}
                            {order.deliveryAddress?.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50/50 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingBag size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Order Items
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-600 font-medium">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-gray-900 font-bold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white border-t border-gray-100">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                          Total Earnings
                        </span>
                        <div className="flex items-center text-gray-900 font-extrabold text-2xl">
                          <IndianRupee size={20} />
                          {order.totalPrice?.toFixed(2)}
                        </div>
                      </div>

                      {order.status === "OUT_FOR_DELIVERY" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(order._id, "DELIVERED")
                          }
                          className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-[0.98]"
                        >
                          <CheckCircle size={20} /> Complete Delivery
                        </button>
                      )}

                      {order.status === "DELIVERED" && (
                        <div className="w-full py-3 bg-gray-50 rounded-2xl text-green-600 text-xs font-bold flex items-center justify-center gap-2 border border-green-100 uppercase tracking-widest">
                          <CheckCircle size={16} /> Successfully Delivered
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
