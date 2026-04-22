import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";
import Cart from "./Cart";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Utensils,
  ChevronDown,
  ListOrdered,
  UtensilsCrossed,
  LogIn,
  UserPlus,
} from "lucide-react";

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.users);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/users/logout");
      dispatch(logout());
      setOpen(false);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="flex items-center gap-2 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="bg-orange-500 text-white p-2 rounded-xl group-hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20">
                <Utensils size={20} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                Food App
              </h1>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all duration-300 group"
              >
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>

              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all duration-300"
                    onClick={() => setOpen(!open)}
                  >
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                      {currentUser.name || "User"}
                    </span>
                    <img
                      src={
                        currentUser?.avatar ||
                        "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png"
                      }
                      alt="profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    className={`absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 transform transition-all duration-200 origin-top-right ${open ? "scale-100 opacity-100 visible" : "scale-95 opacity-0 invisible"}`}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {currentUser.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <User size={18} />
                      Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <ListOrdered size={18} />
                      My Orders
                    </Link>

                    {currentUser?.role === "Restaurant Manager" && (
                      <Link
                        to="/restaurant/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50/50 hover:bg-orange-100 rounded-xl transition-colors mt-1"
                        onClick={() => setOpen(false)}
                      >
                        <UtensilsCrossed size={18} />
                        Manage Orders
                      </Link>
                    )}

                    <div className="h-px bg-gray-100 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 active:scale-95 rounded-xl shadow-sm shadow-orange-500/30 transition-all duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-[500px] border-b border-gray-200 shadow-lg" : "max-h-0"}`}
        >
          <div className="px-4 pt-2 pb-6 bg-white/95 backdrop-blur-md space-y-1">
            {currentUser ? (
              <>
                <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-100 mb-2">
                  <img
                    src={
                      currentUser?.avatar ||
                      "https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211467.png"
                    }
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {currentUser.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  Profile
                </Link>
                <Link
                  to="/my-orders"
                  className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListOrdered size={20} />
                  My Orders
                </Link>

                {currentUser?.role === "Restaurant Manager" && (
                  <Link
                    to="/restaurant/orders"
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-orange-600 bg-orange-50 rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UtensilsCrossed size={20} />
                    Manage Orders
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={18} />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm shadow-orange-500/30 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus size={18} />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="text-orange-500" />
                Your Cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Cart onClose={() => setCartOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
