import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
export const app = express();
import errorHandler from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.route.js";
import restaurantRouter from "./routes/restaurant.route.js";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

//routes
app.use("/api/users", userRouter);
app.use("/api/restaurants", restaurantRouter);

app.use(errorHandler);
