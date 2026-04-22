import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";
import Cart from "./Cart";

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.users);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const dropdownRef = useRef();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = async () => {
    await apiRequest.post("/users/logout");
    dispatch(logout());
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center p-4 shadow-md bg-white">
        <Link to="/">
          <h1 className="text-xl font-bold">Food App</h1>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

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
                  <Link
                    to="/my-orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    My Orders
                  </Link>
                  {currentUser?.role === "Restaurant Manager" && (
                    <Link
                      to="/restaurant/orders"
                      className="block px-4 py-2 hover:bg-gray-100 text-orange-500 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      Manage Orders
                    </Link>
                  )}
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
              <Link to="/login" className="text-blue-500">Login</Link>
              <Link to="/register" className="bg-blue-500 text-white px-3 py-1 rounded">Register</Link>
            </div>
          )}
        </div>
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col z-10">
            <button
              onClick={() => setCartOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <Cart onClose={() => setCartOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
