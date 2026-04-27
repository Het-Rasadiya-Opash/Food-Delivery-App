import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import { ArrowLeft, UtensilsCrossed, Store, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/cartSlice";

const CategoryResults = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get(`/menuItems/category/${categoryName}`);
        setItems(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching category items:", err);
        setError("Failed to load results for this category.");
        setLoading(false);
      }
    };
    fetchCategoryItems();
  }, [categoryName]);

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        restaurantId: item.restaurant._id,
        restaurantName: item.restaurant.name,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight capitalize">
              {categoryName}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Showing all delicious {categoryName} items
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UtensilsCrossed size={64} className="text-gray-200 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No items found
            </h2>
            <p className="text-gray-500 max-w-sm mb-8">
              We couldn't find any items in the "{categoryName}" category at the
              moment.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95"
            >
              Explore Other Categories
            </button>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white/20 flex items-center gap-1.5">
                      <span className="text-lg font-black text-gray-900">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                      {item.description ||
                        "Freshly prepared with authentic ingredients and flavors."}
                    </p>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurants/${item.restaurant._id}`);
                    }}
                    className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between cursor-pointer group/res"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover/res:bg-orange-500 group-hover/res:text-white transition-colors">
                        <Store size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                          Available at
                        </p>
                        <p className="text-sm font-bold text-gray-900 group-hover/res:text-orange-600 transition-colors">
                          {item.restaurant.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                      <Star
                        size={12}
                        className="text-orange-500 fill-orange-500"
                      />
                      <span className="text-[10px] font-bold text-gray-600">
                        {item.restaurant.rating?.toFixed(1) || "New"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="mt-6 w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryResults;
