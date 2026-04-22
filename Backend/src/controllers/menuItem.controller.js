import menuItemModel from "../models/MenuItem.model.js";
import restaurantModel from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createMenu = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { name, description, price, category, isAvailable } = req.body;

  if (!name || !price) {
    throw new ApiError("Name and Price Are required");
  }

  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only  restaurant Manager  add menu items");
  }

  const imageFile = req.file;
  let imageUrl = null;

  if (imageFile) {
    const uploaded = await uploadOnCloudinary(imageFile.path);
    if (!uploaded) throw new ApiError(500, "Image upload failed");
    imageUrl = uploaded.secure_url;
  }

  const menuItem = await menuItemModel.create({
    restaurant: restaurantId,
    name,
    description,
    price,
    category,
    image: imageUrl,
    ...(isAvailable !== undefined && { isAvailable }),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, menuItem, "Menu item created successfully"));
});

export const getAllMenusForRestaurants = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const menuItems = await menuItemModel.find({
    restaurant: { $in: restaurantId },
  });
  return res
    .status(200)
    .json(new ApiResponse(201, menuItems, "Menu item fetch successfully"));
});
