import express from "express";
const router = express.Router();

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import {
  createMenu,
  deleteMenu,
  editMenu,
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

router.put(
  "/:menuId",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  upload.single("image"),
  editMenu,
);

router.delete(
  "/:menuId",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  deleteMenu,
);

export default router;
