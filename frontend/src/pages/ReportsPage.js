import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

const formatDate = (dateString, type) => {
  const date = new Date(dateString);
  if (isNaN(date)) {
    console.error("Invalid date:", dateString);
    return "Invalid Date";
  }

  switch (type) {
    case "day":
      return format(date, "dd MMMM yyyy");
    case "month":
      return format(date, "MMMM yyyy");
    case "year":
      return format(date, "yyyy");
    case "time":
      return format(date, "HH:mm:ss");
    default:
      return format(date, "MMMM yyyy");
  }
};

const ReportsPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("month"); // Default filter by month
  const [selectedBranch, setSelectedBranch] = useState(""); // State for selected branch filter

  // Fetch sales and branch data
  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const salesResponse = await axios.get("http://localhost:5050/sales", config);
      const branchResponse = await axios.get("http://localhost:5050/branches", config);

      setSalesData(salesResponse.data.Data);
      setBranches(branchResponse.data.Data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load sales data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  // Get branch name by branchid
  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.branchid === branchId);
    return branch ? branch.bname : "Unknown Branch";
  };

  // Group the data based on the selected filter type
  const groupedSales = salesData.reduce((groups, item) => {
    const formattedDate = formatDate(item.createdat, filterType);
    const branchId = item.branchid;

    if (!groups[formattedDate]) {
      groups[formattedDate] = {};
    }

    if (!groups[formattedDate][branchId]) {
      groups[formattedDate][branchId] = { totalAmount: 0, count: 0 };
    }

    groups[formattedDate][branchId].totalAmount += item.totalamount;
    groups[formattedDate][branchId].count += 1;

    return groups;
  }, {});

  // Filter sales data dynamically based on the search query and selected branch
  const filteredSales = Object.keys(groupedSales).reduce((result, dateKey) => {
    const branchesData = Object.keys(groupedSales[dateKey]).filter((branchId) => {
      const { totalAmount, count } = groupedSales[dateKey][branchId];
      const branchName = getBranchName(branchId);

      // Check if the branch matches the selected filter and if any column matches the search query
      return (
        (selectedBranch === "" || selectedBranch === branchId) && // Branch filter check
        (dateKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        totalAmount.toFixed(2).includes(searchQuery) ||
        count.toString().includes(searchQuery))
      );
    });

    if (branchesData.length > 0) {
      result[dateKey] = branchesData;
    }

    return result;
  }, {});

  if (loading) {
    return <div className="text-center text-xl py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Sales Reports</h1>

      {/* Filter buttons */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setFilterType("day")}
          className={`p-2 rounded-md ${filterType === "day" ? "bg-teal-500 text-white" : "bg-gray-200"}`}
        >
          Day
        </button>
        <button
          onClick={() => setFilterType("month")}
          className={`p-2 rounded-md ${filterType === "month" ? "bg-teal-500 text-white" : "bg-gray-200"}`}
        >
          Month
        </button>
        <button
          onClick={() => setFilterType("year")}
          className={`p-2 rounded-md ${filterType === "year" ? "bg-teal-500 text-white" : "bg-gray-200"}`}
        >
          Year
        </button>
        <button
          onClick={() => setFilterType("time")}
          className={`p-2 rounded-md ${filterType === "time" ? "bg-teal-500 text-white" : "bg-gray-200"}`}
        >
          Time
        </button>
      </div>

      {/* Branch filter */}
      <div className="mb-4">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="border p-2 rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.branchid} value={branch.branchid}>
              {branch.bname}
            </option>
          ))}
        </select>
      </div>

      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Date, Branch, Amount, or Items Sold"
          className="border p-2 rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Table for displaying the data */}
      <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
        <thead className="bg-teal-600 text-white">
          <tr>
            <th className="border-b-2 p-2 text-left">Date</th>
            <th className="border-b-2 p-2 text-left">Branch</th>
            <th className="border-b-2 p-2 text-left">Total Amount</th>
            <th className="border-b-2 p-2 text-left">Items Sold</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(filteredSales).map((dateKey) => (
            <React.Fragment key={dateKey}>
              {filteredSales[dateKey].map((branchId) => {
                const { totalAmount, count } = groupedSales[dateKey][branchId];
                return (
                  <tr key={branchId} className="hover:bg-gray-100">
                    <td className="border-b p-2">{dateKey}</td>
                    <td className="border-b p-2">{getBranchName(branchId)}</td>
                    <td className="border-b p-2">${totalAmount.toFixed(2)}</td>
                    <td className="border-b p-2">{count}</td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsPage;
