import React, { useState, useEffect } from "react";
import axios from "axios";
import { PencilIcon } from "@heroicons/react/outline"; // Import icon

const EditedProduct = ({ productId, onProductUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // State for Image URL

  // Fetch product data from API to populate the inputs
  useEffect(() => {
    const token = localStorage.getItem("authToken"); // หยิบ token จาก localStorage
    const config = {
        headers: {
          Authorization: `Bearer ${token}`, // แนบ token ไปกับ header ของคำขอ
      },
    };
    const fetchProduct = async () => {
      if (!productId) {
        console.error("Product ID is not available.");
        return; // หยุดการทำงานหากไม่มี productId
      }
    
      try {
        
        // ตรวจสอบว่าใช้เส้นทางที่ถูกต้อง
        const response = await axios.get(`http://localhost:5050/Products/${productId}`, config);
        const product = response.data.Data;
        setProductName(product.productname);
        setDescription(product.description);
        setPrice(product.price);
        setImageUrl(product.imageurl);
      } catch (err) {
        console.error("Error fetching product data:", err);
      }
    };
    

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
        imageurl: imageUrl, // Send the image URL
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
    <div>
      <button
        onClick={handleOpenModal}
        className="hover:border-b-2 border-gray-400 transition duration-300"
      >
        <PencilIcon className="text-blue-600 h-6 w-6" />
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
                  value={productName} // Use productName state as initial value
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
                  value={description} // Use description state as initial value
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
                  value={price} // Use price state as initial value
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  value={imageUrl} // Use imageUrl state as initial value
                  onChange={(e) => setImageUrl(e.target.value)}
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
