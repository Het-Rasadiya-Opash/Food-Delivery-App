import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOrderError,
  setOrderLoading,
  setOrders,
} from "../features/orderSlice";
import apiRequest from "../utils/apiRequest";

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

  console.log(orders);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Restaurant Orders
      </h1>

      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6">
        {orders?.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl shadow p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-700">
                Order ID: {order._id}
              </p>
              <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                {order.status}
              </span>
            </div>

            <div className="text-gray-600">
              Customer: {order.user?.username}
            </div>

            <div className="text-gray-600">
              Payment: {order.paymentMethod} |{" "}
              {order.isPaid ? "Paid" : "Unpaid"}
            </div>

            <div className="text-gray-600">Total: ₹{order.totalPrice}</div>

            <div className="text-gray-600">
              Address: {order.deliveryAddress?.street},{" "}
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{" "}
              {order.deliveryAddress?.zip}
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">Items:</p>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 border rounded-lg p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity} 
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Ordered at: {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantManagerOrders;
