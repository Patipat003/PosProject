import React, { useState } from "react";
import axios from "axios";

const ProductForm = ({ onProductAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // ใช้ string สำหรับราคา
  const [image, setImage] = useState(null); // state สำหรับเก็บไฟล์รูปภาพ

  const handleAddProduct = () => {
    setIsModalOpen(true); // เปิด modal เมื่อกด "Add Product"
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // ปิด modal
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // เก็บไฟล์รูปภาพที่ผู้ใช้อัปโหลด
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // แปลงราคาเป็นตัวเลข
    const numericPrice = parseFloat(price);

    if (isNaN(numericPrice)) {
      console.error("Price must be a valid number");
      return;
    }

    try {
      // สร้าง form data สำหรับส่งข้อมูลพร้อมไฟล์รูปภาพ
      const formData = new FormData();
      formData.append("productname", productName);
      formData.append("description", description);
      formData.append("price", numericPrice);
      formData.append("unitsperbox", 30); // ค่า default
      if (image) {
        formData.append("image", image); // เพิ่มไฟล์รูปภาพ
      }

      // ส่งข้อมูลไปยัง backend
      const response = await axios.post("http://localhost:5050/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // บอกว่าเป็น multipart/form-data
        },
      });

      if (response.data) {
        // หากเพิ่มสินค้าสำเร็จ
        onProductAdded();
      }

      handleCloseModal(); // ปิด modal
    } catch (err) {
      console.error("Error adding product:", err);
      if (err.response) {
        console.error("Server responded with error:", err.response.data);
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Error with axios setup:", err.message);
      }
    }
  };

  return (
    <div>
      {/* ปุ่ม Add Product */}
      <button
        onClick={handleAddProduct}
        className="btn bg-teal-500 text-white px-6 py-3 border-none rounded hover:bg-teal-600 transition duration-300 mt-4"
      >
        Add Product
      </button>

      {/* Modal สำหรับเพิ่มสินค้า */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative z-60">
            <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">
              Add Product
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Product Name Input */}
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

              {/* Description Input */}
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

              {/* Price Input */}
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

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Product Image
                </label>
                <input
                  type="file"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              {/* ปุ่ม Save */}
              <button
                type="submit"
                className="btn border-none w-full bg-teal-500 text-white font-medium py-3 rounded hover:bg-teal-600 transition duration-300"
              >
                Add Product
              </button>
            </form>
            {/* ปุ่ม Close */}
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
