import orderModel from "../models/order.model.js";
import menuItemModel from "../models/MenuItem.model.js";
import restaurantModel from "../models/restaurant.model.js";
import userModel from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  emitOrderUpdate,
  emitNewOrder,
  emitOrderReady,
  emitOrderAssigned,
} from "../socket.js";

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

  const populatedOrder = await orderModel.findById(order._id).populate("user");
  emitNewOrder(restaurantId, populatedOrder);

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
    .populate("restaurant", "name images address owner")
    .populate("user", "username address")
    .populate("driver", "username rating totalRatings");

  if (!order) throw new ApiError(404, "Order not found");

  const isCustomer = order.user._id.toString() === req.user._id.toString();
  const isDriver = order.driver?._id.toString() === req.user._id.toString();
  const isRestaurantOwner =
    order.restaurant?.owner?.toString() === req.user._id.toString();

  if (!isCustomer && !isDriver && !isRestaurantOwner) {
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

  const updatedOrder = await orderModel
    .findById(orderId)
    .populate("restaurant", "name images address")
    .populate("user", "username address")
    .populate("driver", "username rating totalRatings");

  emitOrderUpdate(orderId, updatedOrder);

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

  const updatedOrder = await orderModel
    .findById(orderId)
    .populate("restaurant", "name images address")
    .populate("user", "username address")
    .populate("driver", "username rating totalRatings");

  emitOrderUpdate(orderId, updatedOrder);

  if (status === "READY_FOR_PICKUP") {
    const restaurantLocation = order.restaurant?.address?.location;
    if (restaurantLocation && restaurantLocation.coordinates) {
      const [lng, lat] = restaurantLocation.coordinates;
      const nearestDriver = await userModel.findOne({
        role: "Driver",
        isAvailable: true,
        "address.location": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        },
      });

      if (nearestDriver) {
        order.driver = nearestDriver._id;
        nearestDriver.isAvailable = false;
        await Promise.all([order.save(), nearestDriver.save()]);

        const assignedOrder = await orderModel
          .findById(orderId)
          .populate("restaurant", "name images address")
          .populate("user", "username address")
          .populate("driver", "username rating totalRatings");

        emitOrderAssigned(nearestDriver._id, assignedOrder);
        console.log(
          `Auto-dispatched order ${orderId} to nearest driver: ${nearestDriver.username}`,
        );
      }
    }

    const populatedOrder = await orderModel
      .findById(orderId)
      .populate("restaurant", "name address");
    emitOrderReady(populatedOrder);
  }

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

  if (!req.user.isAvailable) {
    throw new ApiError(400, "You are already handling an order");
  }

  order.driver = req.user._id;

  await order.save();

  await userModel.findByIdAndUpdate(req.user._id, { isAvailable: false });

  const updatedOrder = await orderModel
    .findById(orderId)
    .populate("restaurant", "name images address")
    .populate("user", "username address")
    .populate("driver", "username rating totalRatings");

  emitOrderUpdate(orderId, updatedOrder);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order claimed successfully"));
});

export const updateDriverStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const DRIVER_TRANSITIONS = {
    READY_FOR_PICKUP: "OUT_FOR_DELIVERY",
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

  if (status === "DELIVERED") {
    await userModel.findByIdAndUpdate(req.user._id, { isAvailable: true });
  }

  const updatedOrder = await orderModel
    .findById(orderId)
    .populate("restaurant", "name images address")
    .populate("user", "username address")
    .populate("driver", "username rating totalRatings");

  emitOrderUpdate(orderId, updatedOrder);

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

//review
export const rateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { restaurantRating, driverRating } = req.body;

  if (!restaurantRating || restaurantRating < 1 || restaurantRating > 5) {
    throw new ApiError(400, "Valid restaurant rating (1-5) is required");
  }

  const order = await orderModel
    .findById(orderId)
    .populate("restaurant")
    .populate("driver");

  if (!order) throw new ApiError(404, "Order not found");

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to rate this order");
  }

  if (order.status !== "DELIVERED") {
    throw new ApiError(400, "Only delivered orders can be rated");
  }

  if (order.isRated) {
    throw new ApiError(400, "Order has already been rated");
  }

  // Update Order
  order.restaurantRating = restaurantRating;
  if (driverRating && driverRating >= 1 && driverRating <= 5) {
    order.driverRating = driverRating;
  }
  order.isRated = true;
  await order.save();

  // Update Restaurant Rating
  const restaurant = order.restaurant;
  if (restaurant) {
    const total = restaurant.totalRatings || 0;
    const currentAvg = restaurant.rating || 0;
    restaurant.rating = (currentAvg * total + restaurantRating) / (total + 1);
    restaurant.totalRatings = total + 1;
    await restaurant.save();
  }

  // Update Driver Rating
  const driver = order.driver;
  if (driver && driverRating && driverRating >= 1 && driverRating <= 5) {
    const total = driver.totalRatings || 0;
    const currentAvg = driver.rating || 0;
    driver.rating = (currentAvg * total + driverRating) / (total + 1);
    driver.totalRatings = total + 1;
    await driver.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order rated successfully"));
});
