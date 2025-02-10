import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const ProductDetailModal = ({ product, onClose }) => {
  const [categoryName, setCategoryName] = useState("");

  // ✅ โหลดข้อมูลหมวดหมู่จาก API
  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const response = await axios.get("http://localhost:5050/categories", config);
        const categories = response.data.Data;

        // 🔎 ค้นหา categoryname ที่ตรงกับ product.categoryid
        const matchedCategory = categories.find(
          (cat) => cat.categoryid === product.categoryid
        );

        setCategoryName(matchedCategory ? matchedCategory.categoryname : "Unknown Category");
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };

    if (product?.categoryid) {
      fetchCategoryName();
    }
  }, [product?.categoryid]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-5xl h-full md:h-auto relative flex flex-col md:flex-row border border-gray-300 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* 🔹 ปุ่มปิดโมดอล */}
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-all"
            onClick={onClose}
          >
            <FaTimes size={24} />
          </button>

          {/* 🔹 รูปภาพสินค้า (อยู่ซ้าย) */}
          <div className="w-full md:w-1/3 flex justify-center items-center p-4">
            <img
              src={product.imageurl}
              alt={product.productname}
              className="w-64 h-64 object-cover"
            />
          </div>

          {/* 🔹 รายละเอียดสินค้า (อยู่ขวา) */}
          <div className="w-full md:w-2/3 p-4">
            <h2 className="text-3xl font-bold text-teal-600 mb-4">{product.productname}</h2>

            <table className="w-full text-left border-collapse">
              <tbody>
                <tr>
                  <td className="font-semibold text-gray-700 py-2 w-1/3">Product Code:</td>
                  <td className="text-gray-600">{product.productcode}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-700 py-2">Category:</td>
                  <td className="text-gray-600">{categoryName}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-700 py-2">Price:</td>
                  <td className="text-green-600 font-bold">฿{product.price.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-700 py-2">Description:</td>
                  <td className="text-gray-600">{product.description}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
