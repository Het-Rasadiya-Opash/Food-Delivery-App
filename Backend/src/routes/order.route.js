import express from "express";
import {
  cancelOrder,
  claimOrder,
  getAvailableOrders,
  getMyDriverOrders,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  placeOrder,
  rateOrder,
  updateDriverStatus,
  updateOrderStatus
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
router.post("/:orderId/rate", authMiddleware, rateOrder);
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);
router.patch(
  "/:orderId/status",
  authMiddleware,
  authorizeRole("Restaurant Manager"),
  updateOrderStatus,
);

// Driver routes
router.get(
  "/driver/available",
  authMiddleware,
  authorizeRole("Driver"),
  getAvailableOrders,
);
router.get(
  "/driver/my-orders",
  authMiddleware,
  authorizeRole("Driver"),
  getMyDriverOrders,
);
router.patch(
  "/:orderId/claim",
  authMiddleware,
  authorizeRole("Driver"),
  claimOrder,
);
router.patch(
  "/:orderId/driver-status",
  authMiddleware,
  authorizeRole("Driver"),
  updateDriverStatus,
);

export default router;
