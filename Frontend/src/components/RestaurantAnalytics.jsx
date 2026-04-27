import { useEffect, useState, useMemo } from "react";
import apiRequest from "../utils/apiRequest";
import {
  AlertCircle,
  BarChart3,
  Clock3,
  ShoppingBag,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  LayoutDashboard,
  Zap,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";

const RestaurantAnalytics = () => {
  const [restaurantId, setRestaurantId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchOwnRestaurant = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiRequest.get("/restaurants/owner");
        const ownerRestaurantId = res?.data?.data?._id;

        if (!ownerRestaurantId) {
          throw new Error("Restaurant not found");
        }
        setRestaurantId(ownerRestaurantId);
      } catch (err) {
        setError("Failed to fetch your restaurant");
        setLoading(false);
      }
    };
    fetchOwnRestaurant();
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    const fetchRestaurantAnalyticsData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiRequest.get(
          `/restaurants/analytics/${restaurantId}`,
        );
        setAnalytics(res?.data?.data || null);
      } catch (err) {
        setError("Failed to load restaurant analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantAnalyticsData();
  }, [restaurantId, refreshKey]);

  const chartData = useMemo(() => {
    if (!analytics?.ordersPerHour) return [];
    return [...analytics.ordersPerHour].reverse().slice(-7);
  }, [analytics]);

  const maxOrders = useMemo(() => {
    if (!chartData.length) return 1;
    return Math.max(...chartData.map((d) => d.orders), 5);
  }, [chartData]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-white/50  rounded-3xl  mt-6 mx-6 ">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap size={24} className="text-orange-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">
          Data Loading
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 bg-red-50 rounded-full text-red-500">
          <AlertCircle size={48} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Connection Interrupted
          </h3>
          <p className="text-gray-500">{error}</p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="mt-2 px-6 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-600 font-bold text-sm tracking-wider uppercase">
            <LayoutDashboard size={16} />
            Management Suite
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Performance Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-semibold text-gray-600">
            <Calendar size={16} className="text-orange-500" />
            Last 24 Hours
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all active:scale-95"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-orange-50 rounded-full opacity-50 blur-3xl group-hover:bg-orange-100 transition-colors" />
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                <Clock3 size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUp size={14} /> Efficient
              </div>
            </div>
            <div className="mt-6">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Avg Prep Time
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-4xl font-black text-gray-900">
                  {analytics.averagePrepTime?.minutes ?? 0}
                </h2>
                <span className="text-xl font-bold text-gray-400">min</span>
              </div>
            </div>
            <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-medium text-gray-500">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              Calculated over {analytics.averagePrepTime?.measuredOrders ??
                0}{" "}
              orders
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-red-50 rounded-full opacity-50 blur-3xl group-hover:bg-red-100 transition-colors" />
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                <XCircle size={24} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${analytics.rejectionRate?.percentage < 10 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
              >
                {analytics.rejectionRate?.percentage < 10 ? (
                  <ArrowDownRight size={14} />
                ) : (
                  <ArrowUpRight size={14} />
                )}
                {analytics.rejectionRate?.percentage < 10 ? "Low" : "Critical"}
              </div>
            </div>
            <div className="mt-6">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Rejection Rate
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-4xl font-black text-gray-900">
                  {analytics.rejectionRate?.percentage ?? 0}
                </h2>
                <span className="text-xl font-bold text-gray-400">%</span>
              </div>
            </div>
            <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-medium text-gray-500">
              <div
                className={`h-1.5 w-1.5 rounded-full ${analytics.rejectionRate?.percentage < 10 ? "bg-green-400" : "bg-red-400"}`}
              />
              {analytics.rejectionRate?.rejectedOrders ?? 0} orders rejected of{" "}
              {analytics.rejectionRate?.totalOrders ?? 0}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gray-900 rounded-[2rem] p-8 shadow-2xl shadow-orange-500/10 transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-orange-500 rounded-full opacity-10 blur-3xl" />
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/10 text-orange-400 rounded-2xl border border-white/10">
                <ShoppingBag size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg">
                <TrendingUp size={14} /> Peak Sync
              </div>
            </div>
            <div className="mt-6">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Peak Activity
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-4xl font-black text-white">
                  {analytics.ordersPerHour?.length ?? 0}
                </h2>
                <span className="text-xl font-bold text-white/40">buckets</span>
              </div>
            </div>
            <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-medium text-gray-400">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Active order windows in last 24h
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Best Sellers
              </h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <UtensilsCrossed size={20} />
            </div>
          </div>

          <div className="p-6 flex-grow">
            {analytics.topItems?.length ? (
              <div className="space-y-6">
                {analytics.topItems.map((item, index) => (
                  <div key={index} className="group flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            index === 0
                              ? "bg-orange-500 text-white"
                              : index === 1
                                ? "bg-orange-100 text-orange-600"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                          {item.itemName}
                        </span>
                      </div>
                      <span className="font-black text-gray-900">
                        ₹{item.revenue}
                      </span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(item.revenue / (analytics.topItems[0]?.revenue || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      <span>{item.totalQuantity} Units Sold</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <UtensilsCrossed size={48} className="opacity-10" />
                <p className="font-semibold italic">No sales recorded yet</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-50 mt-auto">
            <button className="w-full py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:text-orange-500 hover:border-orange-100 transition-all shadow-sm">
              View Detailed Inventory Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantAnalytics;
