import express from "express";
import {
  deleteAccount,
  getMe,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, getMe);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.delete("/delete-account", authMiddleware, deleteAccount);

export default router;
