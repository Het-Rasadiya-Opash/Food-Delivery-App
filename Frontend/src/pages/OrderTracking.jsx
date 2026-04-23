import {
  ArrowLeft,
  CheckCircle,
  ChefHat,
  Clock,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  User,
  XCircle,
  Navigation,
  ChevronRight,
  Info,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../utils/apiRequest";

const TIMELINE_STEPS = [
  {
    status: "PLACED",
    label: "Order Placed",
    icon: ShoppingBag,
    desc: "Your order has been received",
    color: "orange",
  },
  {
    status: "ACCEPTED",
    label: "Accepted",
    icon: CheckCircle,
    desc: "Restaurant confirmed your order",
    color: "blue",
  },
  {
    status: "PREPARING",
    label: "Preparing",
    icon: ChefHat,
    desc: "Chef is preparing your food",
    color: "purple",
  },
  {
    status: "READY_FOR_PICKUP",
    label: "Ready for Pickup",
    icon: Store,
    desc: "Food is packed and ready",
    color: "indigo",
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    icon: Truck,
    desc: "Driver is on the way",
    color: "amber",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    icon: CheckCircle,
    desc: "Enjoy your meal!",
    color: "green",
  },
];

const ETA_MAP = {
  PLACED: 45,
  ACCEPTED: 40,
  PREPARING: 25,
  READY_FOR_PICKUP: 15,
  OUT_FOR_DELIVERY: 10,
  DELIVERED: 0,
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrder = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const res = await apiRequest.get(`/orders/${orderId}`);
      setOrder(res.data.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    if (["DELIVERED", "CANCELLED"].includes(order.status)) return;

    const interval = setInterval(() => {
      fetchOrder(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [order]);

  if (loading && !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={20} className="text-orange-500 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading Tracking Center...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
          <XCircle size={40} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-8 max-w-xs">{error}</p>
        <button
          onClick={() => navigate("/my-orders")}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} /> Back to My Orders
        </button>
      </div>
    );
  }

  if (!order) return null;

  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";
  const isActive = !isCancelled && !isDelivered;

  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.status === order.status,
  );
  const eta = ETA_MAP[order.status];

  const getTimestamp = (status) => {
    const entry =
      order.statusHistory?.findLast?.((h) => h.status === status) ??
      order.statusHistory?.filter((h) => h.status === status).at(-1);
    return entry?.timestamp
      ? new Date(entry.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      : null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/my-orders")}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors group"
          >
            <ArrowLeft
              size={22}
              className="text-gray-600 group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest">
              Tracking Center
            </h1>
            {isActive && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-green-600 uppercase">
                  Live Updates
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => fetchOrder(false)}
            className={`p-2 hover:bg-gray-50 rounded-xl transition-colors ${loading ? "animate-spin text-orange-500" : "text-gray-400"}`}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            {isActive && (
              <div className="backdrop-blur-xl bg-orange-500/10 border border-orange-500/20 rounded-3xl px-5 py-3 text-center">
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-0.5">
                  Arriving in
                </p>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-3xl font-black text-orange-600">
                    {eta}
                  </span>
                  <span className="text-sm font-bold text-orange-500">min</span>
                </div>
              </div>
            )}
            {isDelivered && (
              <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/20 rounded-3xl p-3">
                <CheckCircle size={32} className="text-green-500" />
              </div>
            )}
            {isCancelled && (
              <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-3xl p-3">
                <XCircle size={32} className="text-red-500" />
              </div>
            )}
          </div>

          <div className="relative z-10 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                Order #{order._id.slice(-8).toUpperCase()}
              </span>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">
                {order.restaurant?.name}
              </h2>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                  <Calendar size={14} />
                  {new Date(order.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                  <Clock size={14} />
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            {order.driver && (
              <div className="bg-gray-50 rounded-3xl p-4 flex items-center gap-4 border border-gray-100 group-hover:bg-blue-50 transition-colors duration-500">
                <div className="relative">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                    {order.driver?.avatar ? (
                      <img
                        src={order.driver.avatar}
                        alt="Driver"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-lg shadow-lg border-2 border-white">
                    <Truck size={12} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">
                    Your Delivery Partner
                  </p>
                  <p className="text-lg font-black text-gray-900">
                    {order.driver?.username}
                  </p>
                </div>
                <button className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900">Order Status</h3>
            {isCancelled && (
              <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                Cancelled
              </span>
            )}
          </div>

          {isCancelled ? (
            <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <XCircle size={24} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-red-900">Order Cancelled</p>
                <p className="text-sm text-red-600 mt-1">
                  {order.cancelReason ||
                    "This order has been cancelled by the restaurant or user."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between pb-6 pt-4 gap-1 relative before:absolute before:top-[1.75rem] before:left-[2.5rem] before:right-[2.5rem] before:h-0.5 before:bg-gray-100">
              {TIMELINE_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isDone = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;
                const timestamp = getTimestamp(step.status);

                return (
                  <div
                    key={step.status}
                    className="relative flex flex-col items-center gap-3 flex-1 min-w-0"
                  >
                    <div
                      className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white shadow-md transition-all duration-500 ${isDone || (isCurrent && step.status === "DELIVERED")
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-orange-500 text-white ring-4 ring-orange-50 scale-110"
                            : "bg-gray-50 text-gray-300 border-gray-100"
                        }`}
                    >
                      <Icon size={20} className="sm:size-6" />
                      {(isDone ||
                        (isCurrent && step.status === "DELIVERED")) && (
                          <div className="absolute -top-1 -right-1 bg-green-100 text-green-600 p-0.5 rounded-full border border-white">
                            <CheckCircle
                              size={10}
                              fill="currentColor"
                              className="text-white"
                            />
                          </div>
                        )}
                    </div>

                    <div className="text-center w-full px-1">
                      <div className="flex flex-col items-center gap-1">
                        <p
                          className={`font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-colors duration-500 line-clamp-1 ${isCurrent && step.status === "DELIVERED"
                              ? "text-gray-900"
                              : isCurrent
                                ? "text-orange-600"
                                : isDone
                                  ? "text-gray-900"
                                  : "text-gray-400"
                            }`}
                        >
                          {step.label}
                        </p>
                        {timestamp && (
                          <span className="text-[8px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-lg border border-gray-100">
                            {timestamp}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[8px] sm:text-[9px] mt-1.5 leading-tight hidden sm:block line-clamp-2 max-w-[80px] mx-auto ${isPending ? "text-gray-300" : "text-gray-500"
                          }`}
                      >
                        {step.desc}
                      </p>
                      {isCurrent && (
                        <div className="mt-1.5 flex justify-center">
                          <span
                            className={`px-1 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest flex items-center gap-1 ${isDelivered
                                ? "bg-green-50 text-gray-900"
                                : "bg-orange-50 text-orange-600"
                              }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${isDelivered
                                  ? "bg-green-500"
                                  : "bg-orange-500 animate-ping"
                                }`}
                            />
                            {isDelivered ? "Done" : "Process"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <MapPin size={22} className="text-orange-500" /> Delivery To
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 group-hover:border-orange-100 group-hover:bg-orange-50/30 transition-all duration-500">
              <p className="text-sm font-black text-gray-900">
                {order.deliveryAddress?.street}
              </p>
              <p className="text-xs font-bold text-gray-400 mt-1">
                {order.deliveryAddress?.city}
                {order.deliveryAddress?.state
                  ? `, ${order.deliveryAddress.state}`
                  : ""}
                {order.deliveryAddress?.zip
                  ? ` - ${order.deliveryAddress.zip}`
                  : ""}
              </p>
              {order.deliveryNotes && (
                <div className="mt-4 p-3 bg-white/50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Info size={10} /> Note for driver
                  </p>
                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    "{order.deliveryNotes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900">Order Summary</h3>
            <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
              {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex items-center gap-4 p-2 group hover:bg-gray-50 rounded-2xl transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs font-bold text-gray-400 mt-0.5">
                    {item.quantity} x ₹{item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
            <div className="flex justify-between items-center px-2">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Total Amount
                </p>
                <p className="text-xs font-bold text-gray-400 mt-0.5">
                  Inc. all taxes and charges
                </p>
              </div>
              <p className="text-3xl font-black text-gray-900">
                ₹{order.totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {lastUpdated && isActive && (
          <div className="flex flex-col items-center justify-center gap-2 pt-4">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
              Last updated {lastUpdated.toLocaleTimeString()}
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Refreshing every 15 seconds
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
