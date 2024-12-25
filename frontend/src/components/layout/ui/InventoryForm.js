import React, { useState } from "react";

const InventoryForm = () => {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // คุณสามารถทำการส่งข้อมูลที่กรอกไปยัง backend หรือจัดการข้อมูลต่อได้ที่นี่
    console.log("Product Name:", productName);
    console.log("Quantity:", quantity);
  };

  return (
    <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700">Product Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded mt-2"
          placeholder="Enter product name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)} // จัดการค่าในฟอร์ม
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Quantity</label>
        <input
          type="number"
          className="w-full p-2 border rounded mt-2"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)} // จัดการค่าในฟอร์ม
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save
      </button>
    </form>
  );
};

export default InventoryForm;
