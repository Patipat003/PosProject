import React from "react";

const DetailReportPage = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Detail Report</h1>

      {/* Date Range Filter */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          {["Today", "This Week", "This Month", "This Year", "All"].map((label) => (
            <button
              key={label}
              className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-600">Custom Range:</span>
          <input type="date" className="border border-gray-400 rounded-lg px-2 py-1" />
          <span>to</span>
          <input type="date" className="border border-gray-400 rounded-lg px-2 py-1" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Search
          </button>
        </div>
      </div>

      {/* Product Summary */}
      <div className="bg-gray-200 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-2">Product Summary</h2>
        <div className="flex gap-4 mb-4">
          <select className="px-4 py-2 border border-gray-400 rounded-lg">
            <option>Add Product Category</option>
          </select>
          <select className="px-4 py-2 border border-gray-400 rounded-lg">
            <option>Product Brand</option>
          </select>
        </div>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-4 py-2">Product Code</th>
              <th className="border border-gray-400 px-4 py-2">Product Name</th>
              <th className="border border-gray-400 px-4 py-2">Price</th>
              <th className="border border-gray-400 px-4 py-2">Quantity</th>
              <th className="border border-gray-400 px-4 py-2">Sales</th>
              <th className="border border-gray-400 px-4 py-2">Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-4 py-2">001</td>
              <td className="border border-gray-400 px-4 py-2">Example Product</td>
              <td className="border border-gray-400 px-4 py-2">$100</td>
              <td className="border border-gray-400 px-4 py-2">10</td>
              <td className="border border-gray-400 px-4 py-2">$1,000</td>
              <td className="border border-gray-400 px-4 py-2">$200</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-200 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Sales by Bank</h2>
          <div className="h-40 bg-white rounded-lg shadow-inner"></div>
        </div>
        <div className="bg-gray-200 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            Sales from Different Contact Channels
          </h2>
          <div className="h-40 bg-white rounded-lg shadow-inner"></div>
        </div>
      </div>
    </div>
  );
};

export default DetailReportPage;
