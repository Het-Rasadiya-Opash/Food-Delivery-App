import {
  AlertCircle,
  Edit3,
  FileText,
  Image as ImageIcon,
  IndianRupee,
  Tag
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  setMenuItemError,
  setMenuItemLoading,
  updateMenuItem,
} from "../features/menuItemSlice";
import apiRequest from "../utils/apiRequest";

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
      dispatch(
        setMenuItemError(
          err.response?.data?.message || "Failed to update menu item",
        ),
      );
    }
  };

  if (!menuItem) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-4">
        <AlertCircle size={48} className="opacity-50" />
        <p className="text-xl font-medium">Menu item not found</p>
        <button
          onClick={() => navigate("/profile")}
          className="mt-4 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          Return to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Edit3 size={32} className="text-orange-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Edit Menu Item
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Update details for {menuItem.name}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
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
                rows={3}
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
                  min={0}
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
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Currently Available
              </span>
            </label>

            <div className="space-y-3">
              {menuItem.image && (
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <img
                    src={menuItem.image}
                    alt="Current item"
                    className="h-16 w-16 object-cover rounded-lg shadow-sm border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      Current Image
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Will be replaced if a new image is uploaded
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-orange-500 transition-colors bg-gray-50">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none px-2"
                    >
                      <span>Upload a new file</span>
                      <input
                        id="file-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.files[0] })
                        }
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  {formData.image && (
                    <p className="text-sm font-semibold text-green-600 mt-2">
                      {formData.image.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
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
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuItem;
