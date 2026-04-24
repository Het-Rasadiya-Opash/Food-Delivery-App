import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import {
  setMenuItems,
  setMenuItemLoading,
  setMenuItemError,
  removeMenuItem,
  clearMenuItems,
} from "../features/menuItemSlice";
import { addToCart } from "../features/cartSlice";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  UtensilsCrossed, 
  ShoppingBag,
  Info,
  ChevronRight,
  Clock
} from "lucide-react";

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
        dispatch(clearMenuItems());
        dispatch(setMenuItemLoading(true));
        const res = await apiRequest.get(`/menuItems/${restaurantId}`);
        console.log(res.data.data)
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

  console.log(menuItems)

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        restaurantId,
        restaurantName,
        userId: currentUser?._id,
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
      <div className="flex items-center justify-center py-24">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100 border-t-orange-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <Info size={40} className="text-red-400 mb-4" />
        <p className="text-gray-900 font-bold text-lg mb-1">{error}</p>
        <p className="text-gray-500 text-sm">Please refresh or try again later.</p>
      </div>
    );
  }

  if (!menuItems?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <UtensilsCrossed size={48} className="text-gray-200 mb-4" />
        <p className="text-gray-900 font-bold text-xl mb-2">Menu is empty</p>
        <p className="text-gray-500 max-w-xs mb-8">This restaurant hasn't listed any items yet.</p>
        {isOwner && (
          <button 
            onClick={() => navigate(`/add-new-menuItem/${restaurantId}`)}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
          >
            Add Menu Item
          </button>
        )}
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{category}</h2>
            <div className="flex-1 h-[2px] bg-gray-50"></div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {items.map((item) => (
              <div
                key={item._id}
                className="group flex bg-white rounded-3xl border border-gray-100 p-4 hover:border-orange-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 relative overflow-hidden"
              >
                {/* Left: Image Container */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-2xl overflow-hidden">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    }
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 px-2 py-1 bg-white rounded-full shadow-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Content Container */}
                <div className="ml-4 sm:ml-6 flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="text-lg font-black text-gray-900 ml-4 shrink-0">
                        ₹{item.price}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-md">
                      {item.description || "Freshly prepared with authentic ingredients and flavors."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      {item.isAvailable ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all active:scale-95 group/btn"
                        >
                          <Plus size={18} className="group-hover/btn:rotate-90 transition-transform" />
                          <span className="text-sm">Add</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 italic">Unavailable</span>
                      )}
                      
                      <div className="hidden sm:flex items-center gap-1.5 text-gray-400">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">15 MINS</span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/edit-menuItem/${item._id}`)}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(item._id)}
                          className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtle Hover Element */}
                <div className="absolute right-0 top-0 h-full w-1 bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllMenuItems;
