import React from "react";

const SellProductPage = () => {
  return (
    <div className="p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-black font-bold">Sell Product</h1>
      </div>

      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search for products"
          className="border border-gray-300 p-2 rounded w-full mr-2"
        />
        <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          Search
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {[...Array(20)].map((_, index) => (
          <div
            key={index}
            className="border border-gray-300 p-4 rounded flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-gray-200 mb-2 rounded">
              {/* ที่สำหรับใส่รูป */}
              <img
                src="https://via.placeholder.com/150"
                alt="Product"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="text-black text-lg font-bold">Product Code</div>
            <div className="text-black text-sm mb-2">Product Name</div>
            <div className="text-black text-sm">Stock: 10</div>
            <div className="text-black text-sm">Reserve: 2</div>
            <div className="text-black text-sm">Remaining: 8</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellProductPage;
