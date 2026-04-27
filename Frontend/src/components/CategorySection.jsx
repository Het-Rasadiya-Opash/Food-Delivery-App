import React, { useEffect, useState } from "react";
import apiRequest from "../utils/apiRequest";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get("/menuItems/categories");
        setCategories(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const scrollLeft = () => {
    const container = document.getElementById("category-scroll-container");
    container.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = document.getElementById("category-scroll-container");
    container.scrollBy({ left: 300, behavior: "smooth" });
  };

  if (error || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Order our best food options
          </h2>
        </div>
        {/* {!loading && categories.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-gray-600"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-gray-600"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )} */}
      </div>

      <div
        id="category-scroll-container"
        className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex-shrink-0 group cursor-pointer"
            onClick={() => navigate(`/category/${category.category}`)}
          >
            <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg border-2 border-transparent group-hover:border-orange-500/50 transition-colors">
                <img
                  src={
                    category.image ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                  }
                  alt={category.category}
                  className="w-full h-full object-cover"
                />
                <div className="absolute " />
              </div>
            </div>
            <h3 className="text-center font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
              {category.category}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
