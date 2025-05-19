import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPencilAlt } from "react-icons/fa";

const InputField = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500"
    />
  </div>
);


const EditedProduct = ({ productId, onProductUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const config = { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } };

    const API_BASE_URL = process.env.REACT_APP_API_URL;

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`, config);
        setCategories(response.data.Data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/Products/${productId}`, config);
        const product = response.data.Data;
        setProductCode(product.productcode);
        setProductName(product.productname);
        setDescription(product.description);
        setPrice(product.price);
        setImageUrl(product.imageurl);
        setSelectedCategory(product.categoryid);
      } catch (err) {
        console.error("Error fetching product data:", err);
      }
    };

    fetchCategories();
    if (productId) fetchProduct();
  }, [productId]);

  // อัปโหลดรูปภาพไปยัง ImgBB
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true); // แสดงสถานะกำลังอัปโหลด

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=e71bdf3bd6dc220c4ddaf2fd9d9db287`,
        formData
      );

      if (response.data.success) {
        setImageUrl(response.data.data.url); // อัปเดตรูปภาพใหม่
      } else {
        console.error("Upload failed:", response.data);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setIsUploading(false); // ซ่อนสถานะกำลังอัปโหลด
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      console.error("Price must be a valid number");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } };
      const response = await axios.put(
        `${API_BASE_URL}/products/${productId}`,
        {
          productcode: productCode,
          productname: productName,
          description,
          price: numericPrice,
          imageurl: imageUrl,
          categoryid: selectedCategory,
        },
        config
      );

      if (response.status === 200) onProductUpdated();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn btn-xs border-red-600 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center w-20"
      >
        <FaPencilAlt />Edit
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
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
              <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
                Edit Product
              </h2>

              {/* แสดงรูป Preview */}
              {isUploading ? (
                <div className="flex justify-center">
                  <img
                    src="https://loading.io/assets/mod/spinner/rolling/lg.gif " // เปลี่ยน URL นี้ให้เป็นที่ตั้งของ GIF ที่คุณต้องการ
                    alt="Loading..."
                    className="w-30 h-20" // ขนาด GIF
                  />
                </div>
              ) : imageUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={imageUrl}
                    alt="Product Preview"
                    className="w-40 h-40 object-cover rounded-lg"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <InputField label="Product Name" value={productName} onChange={setProductName} />
                <InputField label="Price" value={price} onChange={setPrice} type="number" />

                {/* กล่องอัปโหลดรูปและใส่ URL */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Upload Image or Paste URL</label>
                    <div className="border border-gray-300 p-4 rounded-lg">
                    {/* Input อัปโหลดไฟล์ */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    />

                    {/* หรือ กรอก URL รูปภาพ */}
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2 mt-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500"
                      placeholder="Paste image URL here..."
                    />

                    {/* แสดงสถานะอัปโหลด */}
                    {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                  </div>
                </div>


                <div>
                  <label className="block text-gray-700 font-medium mb-1">Category</label>
                  <select
                    className="w-full p-3 border text-gray-600 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500"
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
                    className="w-full p-3 border text-gray-600 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <button
                    type="submit"
                    className="w-full btn border-red-600 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600"
                  >
                    Update Product
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

export default EditedProduct;
