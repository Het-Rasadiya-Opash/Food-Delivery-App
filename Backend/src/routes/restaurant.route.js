import express from "express";
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
} from "../controllers/restaurant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";

const router = express.Router();

router.get("/", getAllRestaurants);
router.get("/:restaurantId", getRestaurantById);
router.post(
  "/create",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  upload.array("images", 5),
  createRestaurant,
);

export default router;
