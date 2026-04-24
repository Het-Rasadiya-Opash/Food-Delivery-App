import { Server } from "socket.io";
import userModel from "./models/user.model.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_order_room", (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`User joined room: order_${orderId}`);
    });

    socket.on("join_restaurant_room", (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`Restaurant manager joined room: restaurant_${restaurantId}`);
    });

    socket.on("join_drivers_room", () => {
      socket.join("drivers");
      console.log("Driver joined drivers room");
    });

    socket.on("join_user_room", (userId) => {
      socket.join(`user_${userId}`);
      socket.userId = userId;
      console.log(`User joined private room: user_${userId}`);
    });

    socket.on(
      "update_driver_location",
      async ({ orderId, location, userId }) => {
        const id = userId || socket.userId;

        io.to(`order_${orderId}`).emit("driver_location_updated", {
          orderId,
          location,
        });

        if (id && location?.lat && location?.lng) {
          try {
            await userModel.findByIdAndUpdate(id, {
              "address.location": {
                type: "Point",
                coordinates: [location.lng, location.lat],
              },
            });
          } catch (error) {
            console.error("Failed to update driver location in DB:", error);
          }
        }
      },
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitOrderUpdate = (orderId, orderData) => {
  if (io) {
    io.to(`order_${orderId}`).emit("order_updated", orderData);
    console.log(`Emitted order_updated for order: ${orderId}`);
  }
};

export const emitNewOrder = (restaurantId, orderData) => {
  if (io) {
    io.to(`restaurant_${restaurantId}`).emit("new_order", orderData);
    console.log(`Emitted new_order for restaurant: ${restaurantId}`);
  }
};

export const emitOrderReady = (orderData) => {
  if (io) {
    io.to("drivers").emit("order_ready", orderData);
    console.log("Emitted order_ready to all drivers");
  }
};

export const emitOrderAssigned = (driverId, orderData) => {
  if (io) {
    io.to(`user_${driverId}`).emit("order_assigned", orderData);
    console.log(`Emitted order_assigned to driver: ${driverId}`);
  }
};
