import userModel from "../models/user.model.js";
import restaurantModel from "../models/restaurant.model.js";
import menuItemModel from "../models/MenuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, role, password, address } = req.body;
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with username or email already exist");
  }
  const user = await userModel.create({
    username,
    email,
    password,
    role,
    address,
  });
  const token = user.generateToken();
  const createdUser = await userModel.findById(user._id).select("-password");
  res.cookie("token", token);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: createdUser, token },
        "User Register Successfully",
      ),
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const findUser = await userModel.findOne({ email });
  if (!findUser) {
    throw new ApiError(400, "Invalid Credientials");
  }
  const isPasswordCorrect = await findUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Credientials");
  }
  const token = findUser.generateToken();

  const loggedInUser = await userModel
    .findById(findUser._id)
    .select("-password");

  return res
    .status(200)
    .cookie("token", token)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, token },
        "User LoggedIn Successfully",
      ),
    );
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return res
    .status(200)
    .json(new ApiResponse(200, "User Logged Out Succesfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(400, "userId not found");
  }
  const user = await userModel.findById(userId).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetch Successfully"));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "Restaurant Manager") {
    const restaurant = await restaurantModel.findOne({ owner: userId });
    if (restaurant) {
      await menuItemModel.deleteMany({ restaurant: restaurant._id });
      await restaurant.deleteOne();
    }
  }

  await user.deleteOne();

  res.clearCookie("token");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "User account and associated data deleted successfully",
      ),
    );
});
