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
import { addToCart } from "../features/cartSlice";

const AllMenuItems = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, menuItems } = useSelector((state) => state.menuItem);
  const { restaurant, selectedRestaurant } = useSelector(
    (state) => state.restaurant,
  );
  const { currentUser } = useSelector((state) => state.users);

  const restaurantId = restaurant?._id || selectedRestaurant?._id;
  const restaurantName = restaurant?.name || selectedRestaurant?.name;
  const isOwner =
    currentUser?._id === (restaurant?.owner || selectedRestaurant?.owner);

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

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        restaurantId,
        restaurantName,
        item: {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
        },
      }),
    );
  };

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
      <div className="flex items-center justify-center h-40">
        <div className="w-10 h-10 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-red-500 text-lg">
        {error}
      </div>
    );
  }

  if (!menuItems?.length) {
    return (
      <div className="text-center text-gray-500 text-lg py-10">
        No menu items found
      </div>
    );
  }

  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-gray-50 px-4 py-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-10">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">
            {category}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-red-600 font-bold text-lg">
                      ₹{item.price}
                    </span>
                    {item.isAvailable ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        Add
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">
                        Unavailable
                      </span>
                    )}
                  </div>

                  {isOwner && (
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
        </div>
      ))}
    </div>
  );
};

export default AllMenuItems;
