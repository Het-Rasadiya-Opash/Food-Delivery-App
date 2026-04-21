import menuItemModel from "../models/MenuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createMenu = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { name, description, price, category, isAvailable } = req.body;

  if (!name?.trim()) throw new ApiError(400, "Name is required");
  if (!price) throw new ApiError(400, "Price is required");

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
