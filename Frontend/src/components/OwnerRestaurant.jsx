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
import {
  MapPin,
  Star,
  Calendar,
  Edit2,
  Trash2,
  PlusCircle,
  AlertCircle,
  Store,
} from "lucide-react";

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
    if (
      !window.confirm(
        "Are you sure you want to delete your restaurant? This action cannot be undone.",
      )
    )
      return;
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500 gap-3">
        <AlertCircle size={40} className="opacity-50" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
        <Store size={40} className="opacity-50" />
        <p>No restaurant found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl overflow-hidden group">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={
              restaurant.images?.[0] ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            }
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide border shadow-sm backdrop-blur-md ${
                    restaurant.isOpen
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  }`}
                >
                  {restaurant.isOpen ? "Open" : "Closed"}
                </span>
                <span className="flex items-center gap-1 text-yellow-400 font-bold bg-gray-900/50 px-2.5 py-1 rounded-full backdrop-blur-md text-sm border border-white/10">
                  <Star size={14} className="fill-current" />{" "}
                  {restaurant.rating || 0}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
                {restaurant.name}
              </h1>
              <div className="flex items-center text-gray-200 text-sm gap-1.5 font-medium">
                <MapPin size={16} className="text-orange-400 shrink-0" />
                <span className="line-clamp-1 drop-shadow-sm">
                  {restaurant.address?.street}, {restaurant.address?.city},{" "}
                  {restaurant.address?.state} {restaurant.address?.zip}
                </span>
              </div>
            </div>

            <div className="flex items-center text-gray-300 text-sm gap-1.5 font-medium shrink-0 bg-gray-900/40 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
              <Calendar size={14} />
              Since {new Date(restaurant.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/edit-restaurant")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <Edit2 size={16} /> Edit Info
            </button>
            <button
              onClick={() => handleDelete(restaurant._id)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>

          <button
            onClick={() => navigate(`/add-new-menuItem/${restaurant._id}`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm shadow-orange-500/20"
          >
            <PlusCircle size={16} /> Add Menu Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerRestaurant;
