import React, { useState } from "react";
import axios from "axios";
import { PencilIcon } from "@heroicons/react/outline"; // Import icon

const EditedProduct = ({ productId, onProductUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true); // เปิด modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // ปิด modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      console.error("Price must be a valid number");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5050/products/${productId}`, {
        productname: productName,
        description: description,
        price: numericPrice,
      });

      if (response.status === 200) {
        onProductUpdated(); // รีเฟรชข้อมูลหลังจากแก้ไขสำเร็จ
      }

      handleCloseModal(); // ปิด modal
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="hover:border-b-2 border-gray-400 transition duration-300"
      >
        <PencilIcon className="text-blue-600 h-6 w-6" />
        {/* <span>Edit</span> */}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative z-60">
            <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">
              Edit Product
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Price
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn border-none w-full bg-teal-500 text-white font-medium py-3 rounded hover:bg-teal-600 transition duration-300"
              >
                Update Product
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

export default EditedProduct;
