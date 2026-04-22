import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOrderError,
  setOrderLoading,
  setOrders,
} from "../features/orderSlice";
import apiRequest from "../utils/apiRequest";
import {
  ListOrdered,
  User,
  MapPin,
  CreditCard,
  Clock,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

const RestaurantManagerOrders = () => {
  const { loading, error, orders } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const { restaurant } = useSelector((state) => state.restaurant);
  const restaurantId = restaurant?._id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch(setOrderLoading(true));
        const res = await apiRequest.get(
          `/orders/restaurant-manager/${restaurantId}`,
        );
        dispatch(setOrders(res.data.data));
      } catch (err) {
        dispatch(setOrderError(err.message));
      } finally {
        dispatch(setOrderLoading(false));
      }
    };
    if (restaurantId) fetchOrders();
  }, [dispatch, restaurantId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8 bg-red-50 rounded-2xl">
        {error}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ListOrdered className="text-gray-400" size={24} />
        </div>
        <p className="text-gray-500 font-medium">No active orders right now.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  Order{" "}
                  <span className="text-gray-500 font-mono text-sm">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                </p>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                  <Clock size={12} />{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-4 py-1.5 text-xs rounded-full font-bold uppercase tracking-wide border
                ${
                  order.status === "DELIVERED"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : order.status === "CANCELLED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 border-b border-gray-50">
              <div className="flex gap-3">
                <div className="bg-blue-50 p-2 rounded-lg h-fit text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    Customer
                  </p>
                  <p className="font-semibold text-gray-900">
                    {order.user?.username || "Guest User"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-green-50 p-2 rounded-lg h-fit text-green-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    Payment
                  </p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                    {order.paymentMethod}
                    {order.isPaid ? (
                      <span className="inline-flex items-center gap-0.5 text-xs text-green-600 bg-green-100 px-1.5 rounded">
                        <CheckCircle2 size={10} /> Paid
                      </span>
                    ) : (
                      <span className="text-xs text-orange-600 bg-orange-100 px-1.5 rounded">
                        Unpaid
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:col-span-2 lg:col-span-1">
                <div className="bg-orange-50 p-2 rounded-lg h-fit text-orange-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                    Delivery Address
                  </p>
                  <p className="font-medium text-gray-800 text-sm line-clamp-2">
                    {order.deliveryAddress?.street},{" "}
                    {order.deliveryAddress?.city},{" "}
                    {order.deliveryAddress?.state} {order.deliveryAddress?.zip}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/30 p-6">
              <p className="font-bold text-gray-900 mb-4">Order Items</p>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item._id || item.menuItemId}
                    className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
                  >
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                      }
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-orange-600">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-gray-500 uppercase tracking-wide text-sm">
                Total Amount
              </span>
              <span className="font-extrabold text-gray-900 text-xl">
                ₹{order.totalPrice}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantManagerOrders;
