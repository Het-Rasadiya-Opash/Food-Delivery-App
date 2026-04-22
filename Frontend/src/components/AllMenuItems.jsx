import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import {
  setMenuItems,
  setMenuItemLoading,
  setMenuItemError,
  removeMenuItem,
} from "../features/menuItemSlice";

const AllMenuItems = () => {
  const dispatch = useDispatch();
  const { loading, error, menuItems } = useSelector((state) => state.menuItem);
  const { restaurant } = useSelector((state) => state.restaurant);
  const { currentUser } = useSelector((state) => state.users);
  const restaurantId = restaurant?._id;
  const navigate = useNavigate();

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

  const handleDeleteMenu = async (menuId) => {
    try {
      await apiRequest.delete(`/menuItems/${menuId}`);
      dispatch(removeMenuItem(menuId));
    } catch (err) {
      dispatch(
        setMenuItemError(
          err.response?.data?.message || "Failed to delete menu item",
        ),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
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
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-40 w-full object-cover"
              />

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    {item.name}
                  </h2>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-red-600 font-bold text-lg">
                    ₹{item.price}
                  </span>
                  <button className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    Add
                  </button>
                </div>

                {currentUser?._id === restaurant?.owner && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/edit-menuItem/${item._id}`)}
                      className="flex-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(item._id)}
                      className="flex-1 px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-black transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMenuItems;
