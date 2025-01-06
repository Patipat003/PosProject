import React, { useState } from "react";
import axios from "axios";

const ProductForm = ({ onProductAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // ใช้ string สำหรับราคา แต่จะต้องแปลงเป็น number ก่อนส่งไปเซิร์ฟเวอร์

  const handleAddProduct = () => {
    setIsModalOpen(true); // เปิด modal เมื่อกด "Add Product"
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // ปิด modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // แปลงราคาเป็นตัวเลข (หากผู้ใช้กรอกเป็น string)
    const numericPrice = parseFloat(price);

    if (isNaN(numericPrice)) {
      console.error("Price must be a valid number");
      return;
    }

    try {
      // ส่งข้อมูลสินค้าไปยัง backend
      const response = await axios.post("http://localhost:5050/products", {
        productname: productName,
        description: description,
        price: numericPrice, // ส่งราคาเป็นตัวเลข
        unitsperbox: 30, // เพิ่ม unitsperbox โดยค่า default เป็น 30
      });

      if (response.data) {
        // หากการเพิ่มสินค้าสำเร็จ เรียก onProductAdded เพื่อรีเฟรชข้อมูล
        onProductAdded();
      }

      handleCloseModal(); // ปิด modal หลังจากบันทึกข้อมูล
    } catch (err) {
      console.error("Error adding product:", err);
      if (err.response) {
        // คำตอบจากเซิร์ฟเวอร์
        console.error("Server responded with error:", err.response.data);
      } else if (err.request) {
        // คำขอที่ส่งไปไม่ถูกตอบกลับ
        console.error("No response received:", err.request);
      } else {
        // ปัญหาจากการตั้งค่าของ axios
        console.error("Error with axios setup:", err.message);
      }
    }
  };

  return (
    <div>
      {/* ปุ่ม Add Product */}
      <button
        onClick={handleAddProduct}
        className="bg-base-200 text-white px-6 py-3 rounded hover:bg-gray-700 transition duration-300 mt-4"
      >
        Add Product
      </button>

      {/* Modal สำหรับเพิ่มสินค้า */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative z-60">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
              Add Product
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Product Name Input */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              {/* Description Input */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Price Input */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Price
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              {/* ปุ่ม Save */}
              <button
                type="submit"
                className="w-full bg-base-200 text-white font-medium py-3 rounded hover:bg-gray-700 transition duration-300"
              >
                Add Product
              </button>
            </form>
            {/* ปุ่ม Close (กากบาท) */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
            >
              &times; {/* เครื่องหมาย X */}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
