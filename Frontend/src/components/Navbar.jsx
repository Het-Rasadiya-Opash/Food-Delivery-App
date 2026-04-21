import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = async () => {
    const res = await apiRequest.post("/users/logout");
    dispatch(logout());
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex justify-between items-center p-4 shadow-md bg-white">
      <Link to="/">
        <h1 className="text-xl font-bold">Food App</h1>
      </Link>

      {currentUser ? (
        <div className="relative" ref={dropdownRef}>
          <img
            src={
              currentUser?.avatar ||
              "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png"
            }
            alt="profile"
            className="w-10 h-10 rounded-full cursor-pointer object-cover"
            onClick={() => setOpen(!open)}
          />

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg border z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4">
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
