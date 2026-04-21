import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    description: { type: String },
    price: {
      type: Number,
      required: true,
    },

    image: { type: String },
    category: { type: String },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const menuItemModel = mongoose.model("MenuItem", menuItemSchema);

export default menuItemModel;
