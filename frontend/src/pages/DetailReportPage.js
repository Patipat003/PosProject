import React, { useState } from "react";

const DetailReportPage = () => {
  // Example data
  const exampleData = [
    {
      date: "2025-01-01",
      productCode: "001",
      productName: "Example Product",
      price: 100,
      quantity: 10,
      sales: 1000,
      profit: 200,
    },
    {
      date: "2025-01-05",
      productCode: "002",
      productName: "Another Product",
      price: 200,
      quantity: 5,
      sales: 1000,
      profit: 300,
    },
    {
      date: "2025-01-15",
      productCode: "003",
      productName: "New Product",
      price: 150,
      quantity: 7,
      sales: 1050,
      profit: 250,
    },
  ];

  const [filteredData, setFilteredData] = useState(exampleData);
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Filter by predefined ranges
  const filterByRange = (range) => {
    const now = new Date();
    let startDate;
    switch (range) {
      case "Today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "This Week":
        startDate = new Date(
          now.setDate(now.getDate() - now.getDay())
        ); // Start of the week
        break;
      case "This Month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "This Year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        setFilteredData(exampleData);
        return;
    }

    const filtered = exampleData.filter(
      (item) => new Date(item.date) >= startDate
    );
    setFilteredData(filtered);
  };

  // Filter by custom date range
  const filterByCustomRange = () => {
    if (customRange.start && customRange.end) {
      const filtered = exampleData.filter(
        (item) =>
          new Date(item.date) >= new Date(customRange.start) &&
          new Date(item.date) <= new Date(customRange.end)
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Detail Report</h1>

      {/* Date Range Filter */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          {["Today", "This Week", "This Month", "This Year", "All"].map(
            (label) => (
              <button
                key={label}
                onClick={() => filterByRange(label)}
                className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                {label}
              </button>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-600">Custom Range:</span>
          <input
            type="date"
            value={customRange.start}
            onChange={(e) =>
              setCustomRange({ ...customRange, start: e.target.value })
            }
            className="border border-gray-400 rounded-lg px-2 py-1"
          />
          <span>to</span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) =>
              setCustomRange({ ...customRange, end: e.target.value })
            }
            className="border border-gray-400 rounded-lg px-2 py-1"
          />
          <button
            onClick={filterByCustomRange}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Product Summary */}
      <div className="bg-gray-200 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-2">Product Summary</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-4 py-2">Date</th>
              <th className="border border-gray-400 px-4 py-2">Product Code</th>
              <th className="border border-gray-400 px-4 py-2">Product Name</th>
              <th className="border border-gray-400 px-4 py-2">Price</th>
              <th className="border border-gray-400 px-4 py-2">Quantity</th>
              <th className="border border-gray-400 px-4 py-2">Sales</th>
              <th className="border border-gray-400 px-4 py-2">Profit</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-400 px-4 py-2">{row.date}</td>
                <td className="border border-gray-400 px-4 py-2">
                  {row.productCode}
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {row.productName}
                </td>
                <td className="border border-gray-400 px-4 py-2">${row.price}</td>
                <td className="border border-gray-400 px-4 py-2">{row.quantity}</td>
                <td className="border border-gray-400 px-4 py-2">${row.sales}</td>
                <td className="border border-gray-400 px-4 py-2">${row.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailReportPage;
