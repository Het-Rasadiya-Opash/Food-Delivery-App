import {
  AlertCircle,
  FileText,
  Image as ImageIcon,
  IndianRupee,
  PlusCircle,
  Tag
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  addMenuItem,
  setMenuItemError,
  setMenuItemLoading,
} from "../features/menuItemSlice";
import apiRequest from "../utils/apiRequest";

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
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <PlusCircle size={32} className="text-orange-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Add Menu Item
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create a new dish for your restaurant menu.
          </p>
        </div>

        <form
          onSubmit={handleAddMenu}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6"
        >
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <Tag size={20} />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Item Name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute top-3 left-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <FileText size={20} />
              </div>
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <IndianRupee size={20} />
                </div>
                <input
                  type="number"
                  name="price"
                  placeholder="Price (₹)"
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <Tag size={20} />
                </div>
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Currently Available
              </span>
            </label>

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-orange-500 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none px-2"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="image"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                {formData.image && (
                  <p className="text-sm font-semibold text-green-600 mt-2">
                    {formData.image.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/3 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Add Menu Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewMenuItemForm;
