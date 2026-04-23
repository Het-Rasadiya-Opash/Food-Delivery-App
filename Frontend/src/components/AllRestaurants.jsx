import React, { useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRestaurants,
  setRestaurantLoading,
  setRestaurantError,
} from "../features/restaurantSlice";
import { MapPin, Star, Clock, Store } from "lucide-react";

const AllRestaurants = () => {
  const dispatch = useDispatch();
  const { restaurants, loading, error } = useSelector(
    (state) => state.restaurant,
  );
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <Store size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="text-orange-500" />
          Featured Restaurants
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {restaurants.map((res) => (
          <div
            onClick={() => navigate(`/restaurants/${res._id}`)}
            key={res._id}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  res.image ||
                  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                }
                alt={res.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm backdrop-blur-md ${
                    res.isOpen
                      ? "bg-green-500/90 text-white"
                      : "bg-red-500/90 text-white"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {res.isOpen ? "Open Now" : "Closed"}
                  </span>
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {res.name}
                </h3>
                <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                  <Star size={14} className="text-orange-500 fill-orange-500" />
                  <span className="text-sm font-bold text-orange-500">
                    {res.rating || "New"}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 space-y-2">
                <div className="flex items-start gap-2 text-gray-500">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                  <p className="text-sm line-clamp-2">
                    {res.address?.street}, {res.address?.city},{" "}
                    {res.address?.state} - {res.address?.zip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && !loading && !error && (
        <div className="text-center py-20 text-gray-500">
          <Store size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No restaurants available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AllRestaurants;
