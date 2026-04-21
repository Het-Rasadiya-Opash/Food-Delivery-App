import React, { useState } from "react";
import apiRequest from "../utils/apiRequest";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRestaurant,
  setRestaurantLoading,
  setRestaurantError,
} from "../features/restaurantSlice";

const EditRestaurantForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { restaurant, loading, error } = useSelector((state) => state.restaurant);

  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    street: restaurant?.address?.street || "",
    city: restaurant?.address?.city || "",
    state: restaurant?.address?.state || "",
    zip: restaurant?.address?.zip || "",
    lat: restaurant?.address?.location?.coordinates?.[1] || "",
    lng: restaurant?.address?.location?.coordinates?.[0] || "",
    isOpen: restaurant?.isOpen ?? true,
    rating: restaurant?.rating || 0,
    images: [],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setRestaurantLoading(true));

    try {
      const address = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        location: {
          type: "Point",
          coordinates: [Number(formData.lng), Number(formData.lat)],
        },
      };

      const data = new FormData();
      data.append("name", formData.name);
      data.append("address", JSON.stringify(address));
      data.append("isOpen", formData.isOpen);
      data.append("rating", formData.rating);

      Array.from(formData.images).forEach((file) => {
        data.append("images", file);
      });

      const res = await apiRequest.put(`/restaurants/${restaurant._id}`, data);
      dispatch(setRestaurant(res.data.data));
      navigate("/profile");
    } catch (err) {
      dispatch(setRestaurantError(err.response?.data?.message || "Failed to update restaurant"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-gray-800">Edit Restaurant</h2>

        {error && (
          <div className="text-sm text-red-500 bg-red-100 p-2 rounded">{error}</div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Restaurant Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="street"
            placeholder="Street"
            value={formData.street}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="zip"
            placeholder="ZIP Code"
            value={formData.zip}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="lat"
            placeholder="Latitude"
            value={formData.lat}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            name="lng"
            placeholder="Longitude"
            value={formData.lng}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Is Open</label>
            <input
              type="checkbox"
              name="isOpen"
              checked={formData.isOpen}
              onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
              className="w-5 h-5 accent-indigo-600"
            />
          </div>
          <input
            type="number"
            name="rating"
            placeholder="Rating (0-5)"
            value={formData.rating}
            min={0}
            max={5}
            step={0.1}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full"
        />

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/owner-restaurant")}
            className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRestaurantForm;
