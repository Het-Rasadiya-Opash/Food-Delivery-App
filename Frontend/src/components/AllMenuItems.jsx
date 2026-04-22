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
import { Plus, Edit2, Trash2, UtensilsCrossed } from "lucide-react";

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
    if (!window.confirm("Are you sure you want to delete this item?")) return;
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <UtensilsCrossed size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (!menuItems?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <UtensilsCrossed size={48} className="mb-4 opacity-50" />
        <p className="text-lg">No menu items found</p>
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
    <div className="bg-white px-4 sm:px-6 lg:px-8 py-10">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-12 last:mb-0">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="group flex bg-white rounded-2xl border border-gray-100 hover:border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="w-1/3 relative overflow-hidden">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    }
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-orange-600 font-bold text-lg">
                      ₹{item.price}
                    </span>
                    {item.isAvailable && (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white rounded-full transition-colors active:scale-95"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>

                  {isOwner && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/edit-menuItem/${item._id}`)}
                        className="flex items-center justify-center gap-1 flex-1 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors text-xs font-medium"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(item._id)}
                        className="flex items-center justify-center gap-1 flex-1 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors text-xs font-medium"
                      >
                        <Trash2 size={14} /> Delete
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
