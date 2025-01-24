import React, { useState, useEffect } from "react";
import axios from "axios";
import { PencilIcon } from "@heroicons/react/outline"; // Import icon

const EditedProduct = ({ productId, onProductUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // State for Image URL
  const [categories, setCategories] = useState([]); // Categories state
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected category state

  // Fetch product data from API to populate the inputs
  useEffect(() => {
    const token = localStorage.getItem("authToken"); // หยิบ token จาก localStorage
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // แนบ token ไปกับ header ของคำขอ
      },
    };
    
    // ฟังก์ชันสำหรับดึงข้อมูล Categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5050/categories", config);
        setCategories(response.data.Data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    const fetchProduct = async () => {
      if (!productId) {
        console.error("Product ID is not available.");
        return; // หยุดการทำงานหากไม่มี productId
      }
    
      try {
        const response = await axios.get(`http://localhost:5050/Products/${productId}`, config);
        const product = response.data.Data;
        setProductName(product.productname);
        setDescription(product.description);
        setPrice(product.price);
        setImageUrl(product.imageurl);
        setSelectedCategory(product.categoryid); // Set the selected category
      } catch (err) {
        console.error("Error fetching product data:", err);
      }
    };
    
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleOpenModal = () => {
    setIsModalOpen(true); // Open modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      console.error("Price must be a valid number");
      return;
    }

    try {
      const token = localStorage.getItem("authToken"); // หยิบ token จาก localStorage
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // แนบ token ไปกับ header ของคำขอ
        },
      };
      const response = await axios.put(`http://localhost:5050/products/${productId}`, {
        productname: productName,
        description: description,
        price: numericPrice,
        imageurl: imageUrl,
        categoryid: selectedCategory, // ส่ง category ID ไปด้วย
      }, config);

      if (response.status === 200) {
        onProductUpdated(); // Refresh data after successful update
      }

      handleCloseModal(); // Close modal after updating
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  return (
    <div className="border-none">
      <button
        onClick={handleOpenModal}
        className="hover:border-b-2 border-gray-400 transition duration-300"
      >
        <PencilIcon className="text-blue-600 h-6 w-6" />
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
              Edit Product
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
                  Update Product
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

export default EditedProduct;
