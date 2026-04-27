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
import RestaurantAnalytics from "../components/RestaurantAnalytics";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.users);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gray-50">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="bg-orange-50 p-6 rounded-full mb-6">
            <User size={48} className="text-orange-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">
            Session Required
          </p>
          <p className="text-gray-500 mb-8 text-center max-w-xs">
            Please login to your account to view and manage your profile.
          </p>
          <Link
            to="/login"
            className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        {/* Header Gradient */}
        <div className="h-48 sm:h-64 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <div className="px-6 sm:px-12 pb-10 relative">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 -mt-20 sm:-mt-24">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-white">
                <img
                  src={
                    currentUser?.avatar ||
                    "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png"
                  }
                  alt="profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-orange-500 p-2 sm:p-3 rounded-2xl shadow-lg border-4 border-white">
                <Shield size={20} className="text-white" />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center lg:text-left space-y-3 lg:mb-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {currentUser.username || currentUser.name || "User"}
                </h2>
                <span className="inline-flex items-center px-4 py-1 text-sm font-bold rounded-full bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wide">
                  {currentUser.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-orange-400" />
                  {currentUser.email}
                </div>
                {currentUser.address?.city && (
                  <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                    <MapPin size={18} className="text-orange-400" />
                    {currentUser.address.city}, {currentUser.address.state}
                  </div>
                )}
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col gap-3 lg:mb-4">
              {currentUser.role === "Restaurant Manager" && (
                <Link
                  to="/add-restaurant"
                  className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:-translate-y-1 transition-all active:scale-95"
                >
                  <Plus size={20} strokeWidth={3} />
                  Add Restaurant
                </Link>
              )}
            </div>
          </div>

          {currentUser.role !== "Restaurant Manager" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-gray-100">
              <Link
                to="/my-orders"
                className="flex flex-col items-center p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
              >
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                  <ListOrdered size={28} className="text-orange-500" />
                </div>
                <span className="font-bold text-gray-700 group-hover:text-orange-600">
                  My Orders
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {currentUser.role === "Restaurant Manager" && (
        <div className="w-full max-w-6xl mx-auto space-y-12 mt-12">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden p-8 sm:p-12">
            <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Store size={24} className="text-orange-600" />
              </div>
              My Restaurant
            </h3>
            <OwnerRestaurant />
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
            <AllMenuItems />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
