import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import {
  updateMenuItem,
  setMenuItemError,
  setMenuItemLoading,
} from "../features/menuItemSlice";

const EditMenuItem = () => {
  const { menuId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, menuItems } = useSelector((state) => state.menuItem);

  const menuItem = menuItems.find((item) => item._id === menuId);

  const [formData, setFormData] = useState({
    name: menuItem?.name || "",
    description: menuItem?.description || "",
    price: menuItem?.price || "",
    category: menuItem?.category || "",
    isAvailable: menuItem?.isAvailable ?? true,
    image: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setMenuItemLoading(true));

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("isAvailable", formData.isAvailable);
      if (formData.image) data.append("image", formData.image);

      const res = await apiRequest.put(`/menuItems/${menuId}`, data);
      dispatch(updateMenuItem(res.data.data));
      navigate("/profile");
    } catch (err) {
      dispatch(setMenuItemError(err.response?.data?.message || "Failed to update menu item"));
    }
  };

  if (!menuItem) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Menu item not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-gray-800">Edit Menu Item</h2>

        {error && (
          <div className="text-sm text-red-500 bg-red-100 p-2 rounded">{error}</div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            min={0}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Is Available</label>
          <input
            type="checkbox"
            checked={formData.isAvailable}
            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            className="w-5 h-5 accent-indigo-600"
          />
        </div>

        <div>
          {menuItem.image && (
            <img
              src={menuItem.image}
              alt="current"
              className="h-24 w-24 object-cover rounded-lg mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            className="w-full"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMenuItem;
