import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearRestaurant,
  setRestaurant,
  setRestaurantError,
  setRestaurantLoading,
} from "../features/restaurantSlice";
import apiRequest from "../utils/apiRequest";

const OwnerRestaurant = () => {
  const dispatch = useDispatch();
  const { restaurant, loading, error } = useSelector(
    (state) => state.restaurant,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnerRestaurant = async () => {
      try {
        dispatch(setRestaurantLoading(true));
        const res = await apiRequest.get("/restaurants/owner");
        dispatch(setRestaurant(res.data.data));
      } catch (err) {
        dispatch(setRestaurantError("Failed to load restaurant"));
      }
    };
    fetchOwnerRestaurant();
  }, [dispatch]);

  const handleDelete = async (restaurantId) => {
    try {
      await apiRequest.delete(`/restaurants/${restaurantId}`);
      dispatch(clearRestaurant());
      navigate("/profile");
    } catch (err) {
      dispatch(setRestaurantError("Failed to delete restaurant"));
    }
  };

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

  if (!restaurant) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        No restaurant found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <img
          src={restaurant.images?.[0]}
          alt={restaurant.name}
          className="w-full h-72 object-cover"
        />

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
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

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-yellow-500 font-semibold text-lg">
              ⭐ {restaurant.rating || 0}
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(restaurant.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate("/edit-restaurant")}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Edit
            </button>
            <button
              className="px-5 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
              onClick={() => handleDelete(restaurant._id)}
            >
              Delete
            </button>
          </div>

          <div>
            <button
              onClick={() => navigate(`/add-new-menuItem/${restaurant._id}`)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Add MenuItem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerRestaurant;
