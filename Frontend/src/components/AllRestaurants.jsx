import React, { useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRestaurants,
  setRestaurantLoading,
  setRestaurantError,
} from "../features/restaurantSlice";

const AllRestaurants = () => {
  const dispatch = useDispatch();
  const { restaurants, loading, error } = useSelector((state) => state.restaurant);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllRestaurants = async () => {
      try {
        dispatch(setRestaurantLoading(true));
        const response = await apiRequest.get("/restaurants");
        dispatch(setRestaurants(response.data.data));
      } catch (err) {
        dispatch(setRestaurantError("Failed to load restaurants"));
      }
    };
    fetchAllRestaurants();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All Restaurants</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.map((res) => (
          <div
            onClick={() => navigate(`/restaurants/${res._id}`)}
            key={res._id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
          >
            <img
              src={res.images?.[0]}
              alt={res.name}
              className="h-48 w-full object-cover"
            />

            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">
                {res.name}
              </h2>

              <p className="text-sm text-gray-500">
                {res.address?.street}, {res.address?.city}
              </p>

              <p className="text-sm text-gray-500">
                {res.address?.state} - {res.address?.zip}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    res.isOpen
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {res.isOpen ? "Open" : "Closed"}
                </span>

                <span className="text-yellow-500 font-semibold">
                  ⭐ {res.rating || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllRestaurants;
