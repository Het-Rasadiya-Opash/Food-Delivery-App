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
import RestaurantDetails from "./components/RestaurantDetails";

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
        <Route path="/restaurants/:restaurantId" element={<RestaurantDetails />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-restaurant" element={<AddRestaurantForm />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
