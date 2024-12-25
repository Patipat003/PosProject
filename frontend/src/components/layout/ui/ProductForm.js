import React, { useState } from "react";

const ProductForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับการเปิด/ปิด modal
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleAddProduct = () => {
    setIsModalOpen(true); // เปิด modal เมื่อกด "Add Product"
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // ปิด modal
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // คุณสามารถทำการส่งข้อมูลที่กรอกไปยัง backend หรือจัดการข้อมูลต่อได้ที่นี่
    console.log("Product Name:", productName);
    console.log("Quantity:", quantity);
    handleCloseModal(); // ปิด modal หลังจากบันทึกข้อมูล
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

              {/* Quantity Input */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
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
