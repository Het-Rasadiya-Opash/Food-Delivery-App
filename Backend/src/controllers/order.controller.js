import orderModel from "../models/order.model.js";
import menuItemModel from "../models/MenuItem.model.js";
import restaurantModel from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, deliveryAddress, paymentMethod, deliveryNotes } =
    req.body;

  if (
    !restaurantId ||
    !items?.length ||
    !deliveryAddress?.street ||
    !deliveryAddress?.city
  ) {
    throw new ApiError(
      400,
      "restaurantId, items, and deliveryAddress are required",
    );
  }

  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  if (!restaurant.isOpen)
    throw new ApiError(400, "Restaurant is currently closed");

  const itemSnapshots = await Promise.all(
    items.map(async ({ menuItemId, quantity }) => {
      if (!quantity || quantity < 1)
        throw new ApiError(400, "Invalid quantity");
      const menuItem = await menuItemModel.findById(menuItemId);
      if (!menuItem)
        throw new ApiError(404, `Menu item ${menuItemId} not found`);
      if (!menuItem.isAvailable)
        throw new ApiError(400, `${menuItem.name} is not available`);
      return {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        image: menuItem.image,
        category: menuItem.category,
      };
    }),
  );

  const totalPrice = itemSnapshots.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const order = await orderModel.create({
    user: req.user._id,
    restaurant: restaurantId,
    items: itemSnapshots,
    totalPrice,
    deliveryAddress,
    paymentMethod: paymentMethod || "CASH",
    deliveryNotes: deliveryNotes || "",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel
    .find({ user: req.user._id })
    .populate("restaurant", "name images")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await orderModel
    .findById(orderId)
    .populate("restaurant", "name images address")
    .populate("driver", "username");

  if (!order) throw new ApiError(404, "Order not found");

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to view this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { cancelReason } = req.body;

  const order = await orderModel.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this order");
  }

  if (!["PLACED", "ACCEPTED"].includes(order.status)) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  order.status = "CANCELLED";
  order.cancelReason = cancelReason || "Cancelled by customer";
  order.statusHistory.push({ status: "CANCELLED", note: cancelReason });
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await orderModel.findById(orderId).populate("restaurant");
  if (!order) throw new ApiError(404, "Order not found");

  if (order.restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update this order");
  }

  const validTransitions = {
    PLACED: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["PREPARING"],
    PREPARING: ["READY_FOR_PICKUP"],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new ApiError(
      400,
      `Cannot transition order from ${order.status} to ${status}`,
    );
  }

  order.status = status;
  if (status === "CANCELLED") {
    order.cancelReason = req.body.cancelReason || "Rejected by restaurant";
    order.statusHistory.push({ status, note: order.cancelReason });
  } else {
    order.statusHistory.push({ status });
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, `Order marked as ${status}`));
});

export const getRestaurantOrders = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(400, "Restaurant not found");
  }
  const isManager = req.user._id.toString() === restaurant.owner.toString();

  if (!isManager) {
    throw new ApiError(
      403,
      "Not Authorized - Requires Restaurant Manager Access",
    );
  }

  const orders = await orderModel
    .find({ restaurant: restaurantId })
    .populate("user");

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Fetch Orders successfully"));
});

export const rateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { restaurantRating, driverRating, review } = req.body;

  if (!restaurantRating) {
    throw new ApiError(400, "Restaurant rating is required");
  }

  if (restaurantRating < 1 || restaurantRating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  if (driverRating && (driverRating < 1 || driverRating > 5)) {
    throw new ApiError(400, "Driver rating must be between 1 and 5");
  }

  const order = await orderModel.findById(orderId).populate("restaurant");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to rate this order");
  }

  if (order.status !== "DELIVERED") {
    throw new ApiError(400, "Can only rate delivered orders");
  }

  if (order.rating?.ratedAt) {
    throw new ApiError(400, "Order already rated");
  }

  order.rating = {
    restaurantRating,
    driverRating: order.driver ? driverRating || null : null,
    review: review || "",
    ratedAt: new Date(),
  };
  await order.save();

  const restaurant = order.restaurant;
  const ratedRestaurantOrders = await orderModel.find({
    restaurant: restaurant._id,
    status: "DELIVERED",
    "rating.restaurantRating": { $ne: null },
  });
  const restaurantAvg =
    ratedRestaurantOrders.reduce(
      (sum, o) => sum + o.rating.restaurantRating,
      0,
    ) / ratedRestaurantOrders.length;
  await restaurantModel.findByIdAndUpdate(restaurant._id, {
    rating: Math.round(restaurantAvg * 10) / 10,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Rating submitted successfully"));
});

//Driver

export const getAvailableOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel
    .find({ status: "READY_FOR_PICKUP", driver: null })
    .populate("restaurant", "name address")
    .sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Available orders fetched"));
});

export const claimOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await orderModel.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.status !== "READY_FOR_PICKUP") {
    throw new ApiError(400, "Order is not ready for pickup");
  }

  if (order.driver) {
    throw new ApiError(400, "Order already claimed by another driver");
  }

  order.driver = req.user._id;
  order.status = "OUT_FOR_DELIVERY";
  order.statusHistory.push({
    status: "OUT_FOR_DELIVERY",
    note: "Picked up by driver",
  });
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order claimed successfully"));
});

export const updateDriverStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const DRIVER_TRANSITIONS = {
    OUT_FOR_DELIVERY: "DELIVERED",
  };

  if (!Object.values(DRIVER_TRANSITIONS).includes(status)) {
    throw new ApiError(400, `Invalid driver status: ${status}`);
  }

  const order = await orderModel.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (!order.driver || order.driver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update this order");
  }

  if (DRIVER_TRANSITIONS[order.status] !== status) {
    throw new ApiError(
      400,
      `Cannot transition from ${order.status} to ${status}`,
    );
  }

  order.status = status;
  order.statusHistory.push({ status });
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, `Order marked as ${status}`));
});

export const getMyDriverOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel
    .find({ driver: req.user._id })
    .populate("restaurant", "name address")
    .populate("user", "username")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Driver orders fetched"));
});
