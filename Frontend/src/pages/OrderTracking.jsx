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
  Package,
  Home,
  Phone,
  Star,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../utils/apiRequest";

const TIMELINE_STEPS = [
  {
    status: "PLACED",
    label: "Order Placed",
    icon: ClipboardList,
    desc: "Request received",
    color: "#F97316",
  },
  {
    status: "ACCEPTED",
    label: "Accepted",
    icon: CheckCircle,
    desc: "Kitchen confirmed",
    color: "#F97316",
  },
  {
    status: "PREPARING",
    label: "Preparing",
    icon: ChefHat,
    desc: "In progress",
    color: "#F97316",
  },
  {
    status: "READY_FOR_PICKUP",
    label: "Ready",
    icon: Package,
    desc: "Waiting for courier",
    color: "#94A3B8",
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "On the Way",
    icon: Truck,
    desc: "Courier on route",
    color: "#94A3B8",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    icon: Home,
    desc: "Enjoy your meal!",
    color: "#94A3B8",
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

  const getEstimatedArrival = () => {
    if (!order.createdAt) return "N/A";
    const createdDate = new Date(order.createdAt);
    const arrivalDate = new Date(createdDate.getTime() + eta * 60000);
    return arrivalDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }) + " Today";
  };

  const getStatusBadge = () => {
    const statusMap = {
      PLACED: "ORDER PLACED",
      ACCEPTED: "ORDER ACCEPTED",
      PREPARING: "PREPARING YOUR ORDER",
      READY_FOR_PICKUP: "READY FOR PICKUP",
      OUT_FOR_DELIVERY: "OUT FOR DELIVERY",
      DELIVERED: "DELIVERED",
      CANCELLED: "CANCELLED",
    };
    return statusMap[order.status] || order.status;
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative border border-white/20">
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              ORDER STATUS
            </p>
            <h1 className="text-3xl font-black text-[#1E293B] mb-2 flex items-center gap-2">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
              <Clock size={16} className="text-orange-500" />
              <span>Estimated Arrival: <span className="text-[#1E293B]">{getEstimatedArrival()}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full shadow-sm">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs font-black text-orange-600 uppercase tracking-wider">
                {getStatusBadge()}
              </span>
            </div>
            <button
              onClick={() => navigate("/my-orders")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="px-8 py-10">
          <div className="relative flex justify-between items-start">
            <div className="absolute top-[28px] left-[30px] right-[30px] h-[2px] bg-gray-100 -z-0" />
            <div 
              className="absolute top-[28px] left-[30px] h-[2px] bg-orange-500 -z-0 transition-all duration-1000"
              style={{ width: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 94}%` }}
            />

            {TIMELINE_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isDone = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;
              const timestamp = getTimestamp(step.status);

              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center flex-1">
                  <div 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg transition-all duration-500 ${
                      isDone || isCurrent 
                        ? "bg-orange-500 text-white" 
                        : "bg-white text-gray-300"
                    } ${isCurrent ? "ring-8 ring-orange-500/10 scale-110 shadow-orange-500/20 shadow-2xl" : ""}`}
                  >
                    {isDone ? <CheckCircle size={22} /> : <Icon size={22} />}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className={`text-[13px] font-black uppercase tracking-tight mb-0.5 ${
                      isPending ? "text-gray-400" : "text-[#1E293B]"
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-[10px] font-bold ${
                      isPending ? "text-gray-300" : "text-gray-400"
                    }`}>
                      {timestamp || (isCurrent ? "In progress" : isPending ? "Pending" : "")}
                    </p>
                    <p className={`text-[10px] font-medium mt-1 leading-tight ${
                      isPending ? "text-gray-200" : "text-gray-400"
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative rounded-3xl overflow-hidden min-h-[300px] shadow-inner group">
            <img 
              src="/map_bg.png" 
              alt="Map" 
              className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
            />
            
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-700">
              <div className="w-12 h-12 bg-[#FFF7ED] rounded-xl flex items-center justify-center text-orange-500 border border-[#FFEDD5]">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-[#1E293B]">
                  {order.driver?.username || "Mark J."} is your courier
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mt-0.5">
                  <Star size={10} className="fill-[#F59E0B] text-orange-500" />
                  <span>5.0</span>
                  <span className="text-gray-200">•</span>
                  <span>1,200+ deliveries</span>
                </div>
              </div>
              <button className="px-5 py-2 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 active:scale-95">
                Call
              </button>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full animate-ping absolute -inset-0" />
                <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center relative border-4 border-orange-500">
                  <Truck size={20} className="text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] rounded-3xl p-8 flex flex-col h-full border border-gray-100">
            <h3 className="text-xl font-black text-[#1E293B] mb-6">Order Summary</h3>
            
            <div className="flex-1 space-y-4 mb-8 overflow-y-auto pr-2">
              {order.items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[11px] font-black text-orange-500">
                      {item.quantity}x
                    </span>
                    <p className="text-[13px] font-bold text-gray-600 group-hover:text-[#1E293B] transition-colors">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-[13px] font-black text-[#1E293B]">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              
              <div className="flex justify-between items-center py-4 border-t border-dashed border-gray-200">
                <p className="text-[13px] font-bold text-gray-400">Delivery Fee</p>
                <p className="text-[13px] font-black text-orange-500 uppercase tracking-widest">FREE</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 mt-auto">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                    TOTAL AMOUNT
                  </p>
                  <p className="text-4xl font-black text-[#1E293B]">
                    ₹{order.totalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Paid via Visa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
