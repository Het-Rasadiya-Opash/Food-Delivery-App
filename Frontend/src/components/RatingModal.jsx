import React, { useState } from "react";
import { Star, X, Store, Truck } from "lucide-react";
import apiRequest from "../utils/apiRequest";

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="focus:outline-none transition-transform hover:scale-110"
      >
        <Star
          size={28}
          className={
            star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }
        />
      </button>
    ))}
  </div>
);

const RatingModal = ({ order, onClose, onRated }) => {
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasDriver = !!order.driver;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantRating) return setError("Please rate the restaurant");
    if (hasDriver && !driverRating) return setError("Please rate the driver");

    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest.patch(`/orders/${order._id}/rate`, {
        restaurantRating,
        driverRating: hasDriver ? driverRating : undefined,
        review,
      });
      onRated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-extrabold text-gray-900 mb-1">
          Rate Your Order
        </h2>
        <p className="text-sm text-gray-500 mb-6">{order.restaurant?.name}</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Store size={16} className="text-orange-500" /> Restaurant
            </p>
            <StarPicker
              value={restaurantRating}
              onChange={setRestaurantRating}
            />
            <p className="text-xs text-gray-400">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                restaurantRating
              ] || "Tap to rate"}
            </p>
          </div>

          {hasDriver && (
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Truck size={16} className="text-blue-500" /> Driver
                <span className="text-xs font-normal text-gray-400">
                  ({order.driver?.username})
                </span>
              </p>
              <StarPicker value={driverRating} onChange={setDriverRating} />
              <p className="text-xs text-gray-400">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                  driverRating
                ] || "Tap to rate"}
              </p>
            </div>
          )}

          <textarea
            placeholder="Write a review (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none bg-gray-50 focus:bg-white"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
