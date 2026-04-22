import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import OwnerRestaurant from "../components/OwnerRestaurant";
import AllMenuItems from "../components/AllMenuItems";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.users);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-gradient-to-br from-gray-100 to-gray-200">
        <p className="text-lg text-gray-500">Please login to view profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex flex-col items-center gap-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6">
          <img
            src={
              currentUser?.avatar ||
              "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png"
            }
            alt="profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow-md"
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-3xl font-bold text-gray-800">
              {currentUser.username}
            </h2>
            <p className="text-gray-500 mt-1">{currentUser.email}</p>
            <span className="inline-block mt-3 px-4 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-600">
              {currentUser.role}
            </span>
          </div>

          {currentUser.role === "Restaurant Manager" && (
            <Link to="/add-restaurant">
              <button className="mt-4 sm:mt-0 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-300">
                Add Restaurant
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <OwnerRestaurant />
      </div>
      <div className="w-full max-w-4xl">
        <AllMenuItems />
      </div>
    </div>
  );
};

export default Profile;
