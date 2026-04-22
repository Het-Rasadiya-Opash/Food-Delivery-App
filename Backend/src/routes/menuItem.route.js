import express from "express";
const router = express.Router();

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import {
  createMenu,
  getAllMenusForRestaurants,
} from "../controllers/menuItem.controller.js";

router.get("/:restaurantId", getAllMenusForRestaurants);

router.post(
  "/create/:restaurantId",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  upload.single("image"),
  createMenu,
);

export default router;
