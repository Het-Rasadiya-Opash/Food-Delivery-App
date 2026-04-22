import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import OwnerRestaurant from "../components/OwnerRestaurant";
import AllMenuItems from "../components/AllMenuItems";
import RestaurantManagerOrders from "../components/RestaurantManagerOrders";
import {
  User,
  Mail,
  Shield,
  Store,
  MapPin,
  Plus,
  ListOrdered,
} from "lucide-react";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.users);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gray-50">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
          <User size={48} className="text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500">
            Please login to view profile
          </p>
          <Link
            to="/login"
            className="mt-4 px-6 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col items-center gap-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-12">
            <div className="relative">
              <img
                src={
                  currentUser?.avatar ||
                  "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png"
                }
                alt="profile"
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
              />
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                <Shield size={20} className="text-blue-500" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {currentUser.username || currentUser.name || "User"}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                <div className="flex items-center gap-1.5">
                  <Mail size={16} className="text-gray-400" />
                  {currentUser.email}
                </div>
                {currentUser.address?.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-gray-400" />
                    {currentUser.address.city}, {currentUser.address.state}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row  gap-2 lg:items-center sm:items-end">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                {currentUser.role === "Restaurant Manager" ? (
                  <Store size={14} />
                ) : (
                  <User size={14} />
                )}
                {currentUser.role}
              </span>

              {currentUser.role === "Restaurant Manager" && (
                <Link
                  to="/add-restaurant"
                  className="flex items-center gap-2 mt-1 lg:mt-0 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-black hover:scale-105 transition-all"
                >
                  <Plus size={16} />
                  Add Restaurant
                </Link>
              )}
            </div>
          </div>

          {currentUser.role !== "Restaurant Manager" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
              <Link
                to="/my-orders"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors group"
              >
                <div className="bg-white p-3 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <ListOrdered size={24} className="text-orange-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                  My Orders
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {currentUser.role === "Restaurant Manager" && (
        <div className="w-full max-w-5xl space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Store className="text-orange-500" /> My Restaurant
            </h3>
            <OwnerRestaurant />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <AllMenuItems />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ListOrdered className="text-orange-500" /> Active Orders
            </h3>
            <RestaurantManagerOrders />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
