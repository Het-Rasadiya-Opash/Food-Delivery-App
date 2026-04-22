import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, placeOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:orderId", authMiddleware, getOrderById);
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);

export default router;
