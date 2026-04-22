import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import { useDispatch } from "react-redux";
import { setCurrentUser, setCheckingAuth } from "./features/usersSlice";
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
import RestaurantOrderQueue from "./pages/RestaurantOrderQueue";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest.get("/users");

        dispatch(setCurrentUser(response.data.data));
      } catch (err) {
        dispatch(setCheckingAuth(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/restaurants/:restaurantId"
          element={<RestaurantDetails />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

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
          <Route path="/restaurant/orders" element={<RestaurantOrderQueue />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
