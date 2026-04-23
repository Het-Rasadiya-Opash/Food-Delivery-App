import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import {
  setOrders,
  updateOrder,
  setOrderLoading,
  setOrderError,
  setCancelError,
} from "../features/orderSlice";
import {
  ShoppingBag,
  Clock,
  MapPin,
  XCircle,
  ChevronRight,
  Store,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  PLACED: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Clock size={14} />,
  },
  ACCEPTED: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Clock size={14} />,
  },
  PREPARING: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <Store size={14} />,
  },
  READY_FOR_PICKUP: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <MapPin size={14} />,
  },
  OUT_FOR_DELIVERY: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <MapPin size={14} />,
  },
  DELIVERED: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <ShoppingBag size={14} />,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-600 border-red-200",
    icon: <XCircle size={14} />,
  },
};

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector((state) => state.orders?.orders ?? []);
  const loading = useSelector((state) => state.orders?.loading ?? false);
  const error = useSelector((state) => state.orders?.error ?? null);
  const cancelError = useSelector((state) => state.orders?.cancelError ?? null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch(setOrderLoading(true));
        const res = await apiRequest.get("/orders/my-orders");
        dispatch(setOrders(res.data.data));
      } catch (err) {
        dispatch(
          setOrderError(err.response?.data?.message || "Failed to load orders"),
        );
      }
    };
    fetchOrders();
  }, [dispatch]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      dispatch(setCancelError(null));
      const res = await apiRequest.patch(`/orders/${orderId}/cancel`, {
        cancelReason: "Cancelled by customer",
      });
      dispatch(updateOrder(res.data.data));
    } catch (err) {
      dispatch(
        setCancelError(err.response?.data?.message || "Cannot cancel order"),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 text-red-500 gap-4">
        <AlertCircle size={48} className="opacity-50" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-100 p-2.5 rounded-xl">
            <ShoppingBag className="text-orange-600" size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Order History
          </h1>
        </div>

        {cancelError && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {cancelError}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center bg-white rounded-3xl shadow-sm border border-gray-100 py-20 px-4">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">
              No orders yet
            </p>
            <p className="text-gray-500 mb-6">
              When you place orders, they will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition shadow-sm inline-flex items-center gap-2 group"
            >
              Start Ordering
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig =
                STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <Store size={18} className="text-orange-500" />
                        {order.restaurant?.name || "Unknown Restaurant"}
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(order.createdAt).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide ${statusConfig.color}`}
                    >
                      {statusConfig.icon}
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center gap-4 group"
                      >
                        <img
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                          }
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover border border-gray-100 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-sm font-medium text-gray-500 mt-0.5">
                            Qty:{" "}
                            <span className="text-gray-900 bg-gray-100 px-2 rounded-md">
                              {item.quantity}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Total Amount
                      </span>
                      <span className="font-extrabold text-gray-900 text-xl">
                        ₹{order.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      {["PLACED", "ACCEPTED"].includes(order.status) && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle size={16} /> Cancel Order
                        </button>
                      )}

                      <button
                        onClick={() =>
                          navigate(`/restaurants/${order.restaurant?._id}`)
                        }
                        className="w-full sm:w-auto px-5 py-2.5 bg-orange-100 text-orange-700 rounded-xl text-sm font-bold hover:bg-orange-200 transition-colors flex items-center justify-center"
                      >
                        Order Again
                      </button>
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

export default MyOrders;
