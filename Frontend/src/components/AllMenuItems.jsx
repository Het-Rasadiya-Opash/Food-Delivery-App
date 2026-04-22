import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import apiRequest from "../utils/apiRequest";
import {
  setMenuItems,
  setMenuItemLoading,
  setMenuItemError,
} from "../features/menuItemSlice";

const AllMenuItems = () => {
  const dispatch = useDispatch();
  const { loading, error, menuItems } = useSelector((state) => state.menuItem);
  const { restaurant } = useSelector((state) => state.restaurant);
  const restaurantId = restaurant?._id;

  useEffect(() => {
    if (!restaurantId) return;
    const fetchAllMenus = async () => {
      try {
        dispatch(setMenuItemLoading(true));
        const res = await apiRequest.get(`/menuItems/${restaurantId}`);
        dispatch(setMenuItems(res.data.data));
      } catch (err) {
        dispatch(
          setMenuItemError(
            err.response?.data?.message || "Something went wrong",
          ),
        );
      } finally {
        dispatch(setMenuItemLoading(false));
      }
    };
    fetchAllMenus();
  }, [dispatch, restaurantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-pink-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-red-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Menu Items
      </h1>

      {menuItems?.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No menu items found
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {menuItems?.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between"
            >
              <div>
                <img src={item.image} alt="" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.name}
                </h2>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-red-600 font-bold text-lg">
                  ₹{item.price}
                </span>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg  transition">
                  Add
                </button>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMenuItems;
