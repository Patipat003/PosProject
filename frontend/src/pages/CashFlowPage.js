import React from "react";

const CashFlowPage = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Cash Flow</h1>

      {/* Filter Section */}
      <div className="grid grid-cols-2 gap-4 bg-gray-300 p-4 rounded-lg mb-6">
        <div className="flex flex-col space-y-2">
          <label className="font-semibold">Filters</label>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-white border border-gray-400 rounded-lg">All</button>
            <button className="px-4 py-2 bg-white border border-gray-400 rounded-lg">Store Only</button>
            <button className="px-4 py-2 bg-white border border-gray-400 rounded-lg">Including Imported Goods</button>
            <button className="px-4 py-2 bg-white border border-gray-400 rounded-lg">Excluding Imported Goods</button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="font-semibold">Custom Range:</label>
          <input
            type="text"
            placeholder="Start"
            className="px-4 py-2 border border-gray-400 rounded-lg"
          />
          <input
            type="text"
            placeholder="End"
            className="px-4 py-2 border border-gray-400 rounded-lg"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">Search</button>
        </div>
      </div>

      {/* Data Sections */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-400 p-4 rounded-lg">
          <h2 className="font-bold mb-2">This Month's Cash Flow</h2>
          <div className="h-64 border border-gray-300 bg-gray-50"></div>
        </div>
        <div className="bg-white border border-gray-400 p-4 rounded-lg">
          <h2 className="font-bold mb-2">This Month's Profit</h2>
          <div className="h-64 border border-gray-300 bg-gray-50"></div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowPage;
