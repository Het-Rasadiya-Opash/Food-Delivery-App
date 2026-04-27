import React from "react";
import { useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { setRestaurant } from "../features/restaurantSlice";
import { useState } from "react";

const RestaurantAnalytics = () => {
  // const { restaurant } = useSelector((state) => state.restaurant);
  const [restaurantId, setRestaurantId] = useState(null);
  useEffect(() => {
    const fetchOwnRestaurant = async () => {
      const res = await apiRequest.get("/restaurants/owner");
      // setRestaurant(res.data.data);
      setRestaurantId(res.data.data._id);
    };
    fetchOwnRestaurant();
  }, []);

  console.log(restaurantId)

  useEffect(() => {
    const fetchRestaurantAnalyticsData = async () => {
      const res = await apiRequest.get(
        `/restaurants/analytics/${restaurantId}`,
      );
      console.log(res);
    };
    fetchRestaurantAnalyticsData();
  }, [restaurantId]);

  return <div>RestaurantAnalytics</div>;
};

export default RestaurantAnalytics;
