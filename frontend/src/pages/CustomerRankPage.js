import React from "react";

const CustomerRankPage = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Customer Rank</h1>

      {/* Dropdown */}
      <div className="flex justify-between items-center bg-gray-300 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold">Customer Rank</h2>
        <select className="px-4 py-2 border border-gray-400 rounded-lg">
          <option>Top 10</option>
          <option>Top 20</option>
          <option>Top 50</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-200 p-4 rounded-lg">
        <table className="table-auto w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 px-4 py-2">Code</th>
              <th className="border border-gray-400 px-4 py-2">Name</th>
              <th className="border border-gray-400 px-4 py-2">Contact Channel</th>
              <th className="border border-gray-400 px-4 py-2">Phone Number</th>
              <th className="border border-gray-400 px-4 py-2">Province</th>
              <th className="border border-gray-400 px-4 py-2">Sales</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="border border-gray-400 px-4 py-2">-</td>
                <td className="border border-gray-400 px-4 py-2">-</td>
                <td className="border border-gray-400 px-4 py-2">-</td>
                <td className="border border-gray-400 px-4 py-2">-</td>
                <td className="border border-gray-400 px-4 py-2">-</td>
                <td className="border border-gray-400 px-4 py-2">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerRankPage;
