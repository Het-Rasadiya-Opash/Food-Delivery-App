import React from "react";
import { useSelector } from "react-redux";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.users);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-lg text-gray-500">Please login to view profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-6 border-b pb-6">
          <img
            src={
              currentUser?.avatar ||
              "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png"
            }
            alt="profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div>
            <h2 className="text-2xl font-bold">{currentUser.username}</h2>
            <p className="text-gray-500">{currentUser.email}</p>
             <p className=" mt-2 text-gray-500 bg-red-300 text-center rounded-full font-bold ">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
