import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductForm = ({ onProductAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // เก็บ URL ของรูปภาพ
  const [categories, setCategories] = useState([]); // เก็บข้อมูล category
  const [selectedCategory, setSelectedCategory] = useState(""); // เก็บ ID ของ category ที่เลือก

  // ฟังก์ชันสำหรับดึงข้อมูล categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/categories", config); // ดึงข้อมูล categories จาก API
      setCategories(response.data.Data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddProduct = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // สร้างข้อมูลสินค้า
      const productData = {
        productname: productName,
        description,
        price: numericPrice,
        unitsperbox: 30, // ค่า fix
        imageurl: imageUrl,
        categoryid: selectedCategory, // ส่ง category ID ไปกับข้อมูลสินค้า
      };

      // ส่งข้อมูลสินค้าไปยัง backend
      const response = await axios.post(
        "http://localhost:5050/products",
        productData,
        config
      );

      if (response.data) {
        onProductAdded(); // แจ้งให้รู้ว่าเพิ่มสินค้าสำเร็จ
      }

      handleCloseModal();
    } catch (err) {
      console.error("Error adding product:", err);
      if (err.response) {
        console.error("Server responded with error:", err.response.data);
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleAddProduct}
        className="btn bg-teal-500 text-white px-6 py-3 border-none rounded hover:bg-teal-600 transition duration-300 mt-4"
      >
        Add Product
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          onClick={handleCloseModal} // คลิกที่ Backdrop เพื่อปิด
        >
          <div
            className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full relative z-60 overflow-y-auto max-h-screen mt-10"
            onClick={(e) => e.stopPropagation()} // ป้องกันการปิด Modal เมื่อคลิกใน Modal
          >
            <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">
              Add Product
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col w-full">
                <label className="block text-gray-700 font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full p-4 border text-gray-600 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="block text-gray-700 font-medium mb-2">
                  Price
                </label>
                <input
                  type="text"
                  className="w-full p-4 border text-gray-600 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="block text-gray-700 font-medium mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  className="w-full p-4 border text-gray-600 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="block text-gray-700 font-medium mb-2">
                  Category
                </label>
                <select
                  className="w-full p-4 border text-gray-600 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <div className="flex flex-col w-full sm:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-4 border text-gray-600 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4} // เพิ่มจำนวนแถวของช่อง description
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  className="btn border-none w-full bg-teal-500 text-white font-medium py-3 rounded hover:bg-teal-600 transition duration-300"
                >
                  Add Product
                </button>
              </div>
            </form>
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 text-2xl mr-2"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
