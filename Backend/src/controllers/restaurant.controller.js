import restaurantModel from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createRestaurant = asyncHandler(async (req, res) => {
  const { name, address: addressRaw } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Restaurant name is required");
  }

  let address;
  try {
    address = addressRaw ? JSON.parse(addressRaw) : {};
  } catch {
    throw new ApiError(400, "Invalid address format. Send address as a JSON string");
  }

  const existingRestaurant = await restaurantModel.findOne({
    owner: req.user._id,
  });
  if (existingRestaurant) {
    throw new ApiError(409, "You already have a restaurant");
  }

  const imageFiles = req.files || [];
  const uploadedImages = await Promise.all(
    imageFiles.map((file) => uploadOnCloudinary(file.path)),
  );

  const imageUrls = uploadedImages
    .filter((res) => res !== null)
    .map((res) => res.secure_url);

  const restaurant = await restaurantModel.create({
    name,
    owner: req.user._id,
    images: imageUrls,
    address,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, restaurant, "Restaurant created successfully"));
});

export const getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await restaurantModel.find();
  return res
    .status(201)
    .json(new ApiResponse(201, restaurants, "Restaurant fetch successfully"));
});
