import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMenuItem,
  setMenuItemError,
  setMenuItemLoading,
} from "../features/menuItemSlice";
import apiRequest from "../utils/apiRequest";
import { useNavigate, useParams } from "react-router-dom";

const AddNewMenuItemForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { restaurantId } = useParams();
  const { loading, error } = useSelector((state) => state.menuItem);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true,
    image: null,
  });

  const handleAddMenu = async (e) => {
    e.preventDefault();

    try {
      dispatch(setMenuItemLoading(true));

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("isAvailable", formData.isAvailable);
      if (formData.image) data.append("image", formData.image);

      const res = await apiRequest.post(
        `/menuItems/create/${restaurantId}`,
        data,
      );

      dispatch(addMenuItem(res.data.data));
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        isAvailable: true,
        image: null,
      });
      navigate(`/restaurants/${restaurantId}`);
    } catch (err) {
      dispatch(
        setMenuItemError(
          err.response?.data?.message || "Failed to add menu item",
        ),
      );
    } finally {
      dispatch(setMenuItemLoading(false));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleAddMenu}
        className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Add Menu Item
        </h2>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="3"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">Available</label>
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="w-5 h-5 accent-indigo-500"
          />
        </div>

        <input
          type="file"
          onChange={handleFileChange}
          className="w-full text-gray-600"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Item"}
        </button>
      </form>
    </div>
  );
};

export default AddNewMenuItemForm;
