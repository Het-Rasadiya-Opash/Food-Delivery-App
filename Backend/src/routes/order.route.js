import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, placeOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get(
  "/restaurant-manager/:restaurantId",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  getRestaurantOrders,
);
router.get("/:orderId", authMiddleware, getOrderById);
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);
router.patch(
  "/:orderId/status",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  updateOrderStatus
);

export default router;
