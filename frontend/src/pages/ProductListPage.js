import React, { useState } from "react";

const ProductListPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    { id: 1, code: "P001", name: "Product 1", stock: 100, reserve: 20, remaining: 80 },
    { id: 2, code: "P002", name: "Product 2", stock: 150, reserve: 50, remaining: 100 },
    { id: 3, code: "P003", name: "Product 3", stock: 200, reserve: 100, remaining: 100 },
    { id: 4, code: "P004", name: "Product 4", stock: 300, reserve: 150, remaining: 150 },
  ];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="flex h-screen">
      {/* ส่วนรายการสินค้า */}
      <div className="w-2/3 p-4 bg-white border-r border-gray-300 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl text-black font-bold">Product List</h1>
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

        <div className="grid grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-300 p-4 rounded flex flex-col items-center cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="w-24 h-24 bg-gray-200 mb-2 rounded">
                <img
                  src="https://via.placeholder.com/150"
                  alt={product.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="text-black text-lg font-bold">{product.code}</div>
              <div className="text-black text-sm mb-2">{product.name}</div>
              <div className="text-black text-sm">Stock: {product.stock}</div>
              <div className="text-black text-sm">Reserve: {product.reserve}</div>
              <div className="text-black text-sm">Remaining: {product.remaining}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ส่วนรายละเอียดสินค้า */}
      <div className="w-1/3 p-4 bg-gray-100">
        {selectedProduct ? (
          <div>
            <h2 className="text-2xl text-black font-bold mb-4">Product Details</h2>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-300 mb-4">
                <img
                  src="https://via.placeholder.com/150"
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="text-black text-lg font-bold">
                {selectedProduct.code}
              </div>
              <div className="text-black text-md mb-4">
                {selectedProduct.name}
              </div>
              <div className="text-black text-sm">Stock: {selectedProduct.stock}</div>
              <div className="text-black text-sm">Reserve: {selectedProduct.reserve}</div>
              <div className="text-black text-sm mb-4">
                Remaining: {selectedProduct.remaining}
              </div>
              <div className="flex items-center">
                <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                  -
                </button>
                <div className="mx-2 text-black">0</div>
                <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                  +
                </button>
                <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>Select a product to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
