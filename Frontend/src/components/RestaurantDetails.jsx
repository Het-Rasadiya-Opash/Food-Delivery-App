import React, { useEffect, useState } from "react";
import apiRequest from "../utils/apiRequest";
import { useParams } from "react-router-dom";

const RestaurantDetails = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get(`/restaurants/${restaurantId}`);
        setRestaurant(res.data.data);
      } catch (err) {
        setError("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantDetails();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <img
          src={restaurant.images?.[0]}
          alt={restaurant.name}
          className="w-full h-80 object-cover"
        />

        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              {restaurant.name}
            </h1>
            <span
              className={`px-4 py-1 text-sm rounded-full font-semibold ${
                restaurant.isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {restaurant.isOpen ? "Open" : "Closed"}
            </span>
          </div>

          <div className="text-gray-600 space-y-1">
            <p>
              {restaurant.address?.street}, {restaurant.address?.city}
            </p>
            <p>
              {restaurant.address?.state} - {restaurant.address?.zip}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-yellow-500 font-semibold text-lg">
              ⭐ {restaurant.rating || 0}
            </div>
            <div className="text-sm text-gray-500">
              Owner: {restaurant.owner?.username}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;