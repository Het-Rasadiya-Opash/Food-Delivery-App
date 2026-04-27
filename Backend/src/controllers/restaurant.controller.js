import restaurantModel from "../models/restaurant.model.js";
import menuItemModel from "../models/MenuItem.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import orderModel from "../models/order.model.js";

export const createRestaurant = asyncHandler(async (req, res) => {
  const { name, address: addressRaw, isOpen, rating } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Restaurant name is required");
  }

  let address;
  try {
    address = addressRaw ? JSON.parse(addressRaw) : {};
  } catch {
    throw new ApiError(
      400,
      "Invalid address format. Send address as a JSON string",
    );
  }

  const existingRestaurant = await restaurantModel.findOne({
    owner: req.user._id,
  });
  if (existingRestaurant) {
    throw new ApiError(409, "You already have a restaurant");
  }

  const imageFile = req.file;
  let imageUrl = null;
  if (imageFile) {
    const uploaded = await uploadOnCloudinary(imageFile.path);
    if (uploaded) imageUrl = uploaded.secure_url;
  }

  const restaurant = await restaurantModel.create({
    name,
    owner: req.user._id,
    image: imageUrl || null,
    address,
    isOpen,
    rating,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, restaurant, "Restaurant created successfully"));
});

export const getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await restaurantModel.find();
  return res
    .status(200)
    .json(new ApiResponse(200, restaurants, "Restaurants fetch successfully"));
});

export const getRestaurantById = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await restaurantModel
    .findById(restaurantId)
    .populate("owner", "username");
  if (!restaurant) {
    throw new ApiError(400, "Restaurant not found for restaurantId ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Restaurant fetch successfully"));
});

export const getOwnerRestaurant = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const ownerRestaurant = await restaurantModel.findOne({ owner: ownerId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, ownerRestaurant, "Restaurant fetch successfully"),
    );
});

export const editRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this restaurant");
  }

  const { name, address: addressRaw, isOpen, rating } = req.body;

  let address;
  try {
    address = addressRaw ? JSON.parse(addressRaw) : {};
  } catch {
    throw new ApiError(
      400,
      "Invalid address format. Send address as a JSON string",
    );
  }

  const imageFile = req.file;
  if (imageFile) {
    const uploaded = await uploadOnCloudinary(imageFile.path);
    if (uploaded) restaurant.image = uploaded.secure_url;
  }

  if (name) restaurant.name = name;
  if (address) restaurant.address = address;
  if (isOpen !== undefined) restaurant.isOpen = isOpen;
  if (rating !== undefined) restaurant.rating = rating;

  await restaurant.save();

  return res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Restaurant updated successfully"));
});

export const deleteRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this restaurant");
  }

  await menuItemModel.deleteMany({ restaurant: restaurantId });

  await restaurant.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Restaurant deleted successfully"));
});

export const restaurantAnalytics = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, "Invalid restaurant id");
  }

  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to access this analytics");
  }

  const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
  const last24HoursStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [ordersPerHourRaw, topItems, prepStats, rejectionStats] =
    await Promise.all([
      orderModel.aggregate([
        {
          $match: {
            restaurant: restaurantObjectId,
            createdAt: { $gte: last24HoursStart },
          },
        },
        {
          $group: {
            _id: {
              hour: {
                $dateToString: {
                  format: "%Y-%m-%d %H:00",
                  date: "$createdAt",
                },
              },
            },
            orders: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            hour: "$_id.hour",
            orders: 1,
          },
        },
        { $sort: { hour: -1 } },
      ]),
      orderModel.aggregate([
        {
          $match: {
            restaurant: restaurantObjectId,
            status: { $ne: "CANCELLED" },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.menuItemId",
            itemName: { $first: "$items.name" },
            totalQuantity: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            menuItemId: "$_id",
            itemName: 1,
            totalQuantity: 1,
            revenue: 1,
          },
        },
      ]),
      orderModel.aggregate([
        {
          $match: {
            restaurant: restaurantObjectId,
          },
        },
        {
          $project: {
            acceptedAt: {
              $first: {
                $map: {
                  input: {
                    $filter: {
                      input: "$statusHistory",
                      as: "s",
                      cond: { $eq: ["$$s.status", "ACCEPTED"] },
                    },
                  },
                  as: "accepted",
                  in: "$$accepted.timestamp",
                },
              },
            },
            readyAt: {
              $first: {
                $map: {
                  input: {
                    $filter: {
                      input: "$statusHistory",
                      as: "s",
                      cond: { $eq: ["$$s.status", "READY_FOR_PICKUP"] },
                    },
                  },
                  as: "ready",
                  in: "$$ready.timestamp",
                },
              },
            },
          },
        },
        {
          $match: {
            acceptedAt: { $type: "date" },
            readyAt: { $type: "date" },
            $expr: { $gte: ["$readyAt", "$acceptedAt"] },
          },
        },
        {
          $group: {
            _id: null,
            averagePrepTimeMinutes: {
              $avg: {
                $divide: [{ $subtract: ["$readyAt", "$acceptedAt"] }, 60000],
              },
            },
            measuredOrders: { $sum: 1 },
          },
        },
      ]),
      orderModel.aggregate([
        {
          $match: {
            restaurant: restaurantObjectId,
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            rejectedOrders: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "CANCELLED"] },
                      {
                        $regexMatch: {
                          input: { $ifNull: ["$cancelReason", ""] },
                          regex: "rejected by restaurant",
                          options: "i",
                        },
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

  const prepTimeData = prepStats[0] || {
    averagePrepTimeMinutes: 0,
    measuredOrders: 0,
  };
  const rejectionData = rejectionStats[0] || {
    totalOrders: 0,
    rejectedOrders: 0,
  };

  const rejectionRate =
    rejectionData.totalOrders > 0
      ? (rejectionData.rejectedOrders / rejectionData.totalOrders) * 100
      : 0;

  const analytics = {
    ordersPerHour: ordersPerHourRaw,
    topItems,
    averagePrepTime: {
      minutes: Number((prepTimeData.averagePrepTimeMinutes || 0).toFixed(2)),
      measuredOrders: prepTimeData.measuredOrders || 0,
    },
    rejectionRate: {
      rejectedOrders: rejectionData.rejectedOrders || 0,
      totalOrders: rejectionData.totalOrders || 0,
      percentage: Number(rejectionRate.toFixed(2)),
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Restaurant analytics fetched"));
});
