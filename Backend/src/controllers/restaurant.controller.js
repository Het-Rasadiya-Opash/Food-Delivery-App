import restaurantModel from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    isOpen,
    rating
  });

  return res
    .status(201)
    .json(new ApiResponse(201, restaurant, "Restaurant created successfully"));
});

export const getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await restaurantModel.find();
  return res
    .status(201)
    .json(new ApiResponse(201, restaurants, "Restaurants fetch successfully"));
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
    .status(201)
    .json(new ApiResponse(201, restaurant, "Restaurant fetch successfully"));
});

export const getOwnerRestaurant = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const ownerRestaurant = await restaurantModel.findOne({ owner: ownerId });
 
  return res
    .status(201)
    .json(
      new ApiResponse(201, ownerRestaurant, "Restaurant fetch successfully"),
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

  const imageFiles = req.files || [];
  if (imageFiles.length > 0) {
    const uploadedImages = await Promise.all(
      imageFiles.map((file) => uploadOnCloudinary(file.path)),
    );
    const newImageUrls = uploadedImages
      .filter((res) => res !== null)
      .map((res) => res.secure_url);
    restaurant.images = [...restaurant.images, ...newImageUrls];
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

  await restaurant.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Restaurant deleted successfully"));
});
