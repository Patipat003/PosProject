import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const ProductForm = ({ onProductAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get("http://localhost:5050/categories", config);
        setCategories(response.data.Data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return console.error("Price must be a valid number");

    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const productData = {
        productname: productName,
        description,
        price: numericPrice,
        unitsperbox: 30,
        imageurl: imageUrl,
        categoryid: selectedCategory,
      };

      const response = await axios.post("http://localhost:5050/products", productData, config);
      if (response.data) onProductAdded();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn bg-teal-500 text-white px-6 py-3 border-none rounded hover:bg-teal-600 transition duration-300 mt-4"
      >
        Add Product
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl relative"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">Add Product</h2>

              {/* Preview รูปภาพ */}
              {imageUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={imageUrl}
                    alt="Product Preview"
                    className="w-40 h-40 object-cover rounded-lg shadow-lg border border-gray-200"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <InputField label="Product Name" value={productName} onChange={setProductName} />
                <InputField label="Price" value={price} onChange={setPrice} type="number" />
                
                {/* ช่องใส่ URL ที่แสดงรูปอัตโนมัติ */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Image URL</label>
                  <input
                    type="text"
                    className="w-full p-3 border text-gray-600 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Category</label>
                  <select
                    className="w-full p-3 border text-gray-600 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.categoryid} value={category.categoryid}>
                        {category.categoryname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-3 border text-gray-600 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-teal-500 text-white font-medium py-3 rounded-lg hover:bg-teal-600 transition duration-300"
                  >
                    Add Product
                  </button>
                </div>
              </form>

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-4 text-gray-500 text-xl"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      type={type}
      className="w-full p-3 border text-gray-600 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
      placeholder={`Enter ${label.toLowerCase()}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default ProductForm;
