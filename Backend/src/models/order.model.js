import mongoose from "mongoose";

const ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
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
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: String,
      zip: String,
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
        },
      },
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
  },
  { timestamps: true },
);

orderSchema.pre("save", function (next) {
  if (this.isNew) {
    this.statusHistory.push({ status: "PLACED" });
  }
  next();
});

orderSchema.index({ "deliveryAddress.location": "2dsphere" });

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
