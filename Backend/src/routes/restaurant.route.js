import express from "express";
import {
  createRestaurant,
  getAllRestaurants,
  getOwnerRestaurant,
  getRestaurantById,
  editRestaurant,
  deleteRestaurant,
  restaurantAnalytics,
} from "../controllers/restaurant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";

const router = express.Router();

router.get("/", getAllRestaurants);

router.get(
  "/owner",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  getOwnerRestaurant,
);

router.get(
  "/analytics/:restaurantId",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  restaurantAnalytics,
);

router.get("/:restaurantId", getRestaurantById);

router.post(
  "/create",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  upload.single("image"),
  createRestaurant,
);

router.put(
  "/:restaurantId",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  upload.single("image"),
  editRestaurant,
);

router.delete(
  "/:restaurantId",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  deleteRestaurant,
);

export default router;
