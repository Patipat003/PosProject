import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // ดึงข้อมูล Category ทั้งหมด
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } };
      const response = await axios.get(`${API_BASE_URL}/categories`, config);
      setCategories(response.data.Data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // ลบ Category พร้อมแจ้งเตือน
  const handleDeleteCategory = async (categoryID) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } };
      await axios.delete(`${API_BASE_URL}/categories/${categoryID}`, config);
      fetchCategories();
      toast.success("Category deleted successfully!", { theme: "colored" });
    } catch (error) {
      console.error("Error deleting category", error);
      toast.error("Failed to delete category!", { theme: "colored" });
    }
  };

  // ดึงข้อมูลเมื่อโมดอลเปิด
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // เพิ่ม Category ใหม่ พร้อมแจ้งเตือน
  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      toast.warn("Please enter a category name!", { theme: "colored" });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } };
      await axios.post(`${API_BASE_URL}/categories`, { categoryname: categoryName }, config);
      setCategoryName("");
      fetchCategories();
      onCategoryAdded();
      toast.success("Category added successfully!", { theme: "colored" });
    } catch (error) {
      console.error("Error adding category", error);
      toast.error("Failed to add category!", { theme: "colored" });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white p-8 rounded-lg shadow-lg max-w-7xl w-full relative z-60 overflow-y-auto max-h-screen mt-10"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-center text-red-600 mb-6">Manage Categories</h2>

              {/* ตาราง Category */}
              <div className="overflow-y-auto max-h-96 mb-6">
                <table className="table-auto table-xs w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="border text-center text-sm py-2">#</th>
                      <th className="border text-sm px-4 py-2">Category Name</th>
                      <th className="border text-sm px-4 py-2">Category Code</th>
                      <th className="border text-sm px-4 py-2">Created At</th>
                      <th className="border text-sm px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((category, index) => (
                        <tr key={category.categoryid} className="bg-gray-80 hover:bg-gray-100">
                          <td className="border text-sm text-center py-2">{index + 1}</td>
                          <td className="border text-sm px-4 py-2">{category.categoryname}</td>
                          <td className="border text-sm px-4 py-2">{category.categorycode}</td>
                          <td className="border text-sm px-4 py-2">{moment(category.createdat).local().format("L, HH:mm")}</td>
                          <td className="px-4 py-2 text-center flex justify-center items-center">
                            <button
                              onClick={() => handleDeleteCategory(category.categoryid)}
                              className="btn btn-xs border-red-600 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center"
                            >
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center p-3 text-gray-500">No categories found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ฟอร์มเพิ่ม Category */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Add New Category</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter Category Name"
                    className="w-full pl-6 p-3 border text-gray-600 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="btn border-red-600 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryModal;
