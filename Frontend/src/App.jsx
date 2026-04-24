import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser, setCheckingAuth } from "./features/usersSlice";
import { clearCart } from "./features/cartSlice";
import apiRequest from "./utils/apiRequest";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import AddRestaurantForm from "./pages/AddRestaurantForm";
import EditRestaurantForm from "./pages/EditRestaurantForm";
import RestaurantDetails from "./components/RestaurantDetails";
import AddNewMenuItemForm from "./pages/AddNewMenuItemForm";
import EditMenuItem from "./pages/EditMenuItem";
import PlaceOrder from "./pages/PlaceOrder";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import RestaurantOrderQueue from "./pages/RestaurantOrderQueue";
import DriverDashboard from "./pages/DriverDashboard";
import CategoryResults from "./pages/CategoryResults";
import Footer from "./components/Footer";
import { ShoppingBag } from "lucide-react";

const App = () => {
  const dispatch = useDispatch();
  const { isCheckingAuth } = useSelector((state) => state.users);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest.get("/users");
        const user = response.data.data;
        // clear cart if it belongs to a different user
        const savedCart = JSON.parse(localStorage.getItem("cart") || "{}");
        if (savedCart.userId && savedCart.userId !== user._id) {
          dispatch(clearCart());
        }
        dispatch(setCurrentUser(user));
      } catch (err) {
        dispatch(setCheckingAuth(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={24} className="text-orange-500 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Setting up your kitchen...
          </h2>
          <p className="text-gray-400 text-sm font-medium animate-pulse">
            Verifying your session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/restaurants/:restaurantId"
            element={<RestaurantDetails />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/category/:categoryName"
            element={<CategoryResults />}
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/add-restaurant" element={<AddRestaurantForm />} />
            <Route path="/edit-restaurant" element={<EditRestaurantForm />} />
            <Route
              path="/add-new-menuItem/:restaurantId"
              element={<AddNewMenuItemForm />}
            />
            <Route path="/edit-menuItem/:menuId" element={<EditMenuItem />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/order/:orderId" element={<OrderTracking />} />
            <Route
              path="/restaurant/orders"
              element={<RestaurantOrderQueue />}
            />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
