import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
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

    socket.on("update_driver_location", ({ orderId, location }) => {
      io.to(`order_${orderId}`).emit("driver_location_updated", { orderId, location });
      console.log(`Driver updated location for order ${orderId}:`, location);
    });

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
