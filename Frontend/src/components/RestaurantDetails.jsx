import React, { useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedRestaurant,
  setRestaurantLoading,
  setRestaurantError,
} from "../features/restaurantSlice";
import AllMenuItems from "./AllMenuItems";
import { MapPin, Star, Clock, Store, ArrowLeft } from "lucide-react";

const RestaurantDetails = () => {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    selectedRestaurant: restaurant,
    loading,
    error,
  } = useSelector((state) => state.restaurant);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        dispatch(setRestaurantLoading(true));
        const res = await apiRequest.get(`/restaurants/${restaurantId}`);
        dispatch(setSelectedRestaurant(res.data.data));
      } catch (err) {
        dispatch(setRestaurantError("Failed to load restaurant"));
      }
    };
    fetchRestaurantDetails();
  }, [restaurantId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-red-500">
        <Store size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="relative h-96 bg-gray-900">
        <img
          src={
            restaurant.image ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          }
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-bold shadow-sm backdrop-blur-md border ${
                    restaurant.isOpen
                      ? "bg-green-500/20 text-green-300 border-green-400/30"
                      : "bg-red-500/20 text-red-300 border-red-400/30"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {restaurant.isOpen ? "Open Now" : "Closed"}
                  </span>
                </span>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-white">
                    {restaurant.rating || "New"}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white shadow-sm">
                {restaurant.name}
              </h1>

              <div className="flex items-center gap-2 text-gray-300 font-medium">
                <MapPin size={18} />
                <p>
                  {restaurant.address?.street}, {restaurant.address?.city},{" "}
                  {restaurant.address?.state} - {restaurant.address?.zip}
                </p>
              </div>
            </div>

            {restaurant.owner?.username && (
              <div className="text-gray-400 text-sm hidden md:block">
                Managed by{" "}
                <span className="text-gray-300 font-medium">
                  {restaurant.owner.username}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] border border-gray-100">
          <AllMenuItems />
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
