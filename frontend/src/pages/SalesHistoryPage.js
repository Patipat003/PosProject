import React from "react";

const SalesHistoryPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl text-black font-bold mb-4">Sales History</h1>

      {/* Search Bar */}
      <div className="flex items-center mb-4">
        <select
          className="border border-gray-400 p-2 rounded mr-2"
          name="filter"
          id="filter"
        >
          <option value="products-in-orders">Products in Orders</option>
        </select>
        <input
          type="text"
          placeholder="Search"
          className="border border-gray-400 p-2 rounded mr-2"
        />
        <button className="bg-gray-300 px-4 py-2 rounded">Search</button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <button className="bg-gray-200 px-4 py-2 rounded">All Inventories</button>
        <button className="bg-gray-200 px-4 py-2 rounded">All Dates</button>
      </div>

      {/* Table */}
      <table className="border border-collapse w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Product Code</th>
            <th className="border p-2">Product</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Product Quantity</th>
            <th className="border p-2">Order Number</th>
            <th className="border p-2">Order Sales</th>
            <th className="border p-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {/* Add rows dynamically here */}
        </tbody>
      </table>
    </div>
  );
};

export default SalesHistoryPage;

