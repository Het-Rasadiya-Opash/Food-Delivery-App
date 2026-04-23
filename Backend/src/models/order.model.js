import mongoose from "mongoose";

const ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: {
          type: String,
        },
        category: {
          type: String,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PLACED",
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: ORDER_STATUSES,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
        },
      },
    ],

    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zip: String,
    },

    deliveryNotes: {
      type: String,
      default: "",
    },

    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },

    cancelReason: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "ONLINE"],
      default: "CASH",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },
    restaurantRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    driverRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    isRated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

orderSchema.pre("save", function () {
  if (this.isNew) {
    this.statusHistory.push({ status: "PLACED" });
  }
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
