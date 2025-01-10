import React, { useState } from "react";
import axios from "axios";

const ProductForm = ({ onProductAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // เก็บ URL ของรูปภาพ

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
        imageurl: imageUrl, // ใช้ URL ของรูปภาพที่ผู้ใช้กรอก
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
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative z-60">
            <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">
              Add Product
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Price
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn border-none w-full bg-teal-500 text-white font-medium py-3 rounded hover:bg-teal-600 transition duration-300"
              >
                Add Product
              </button>
            </form>
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
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
