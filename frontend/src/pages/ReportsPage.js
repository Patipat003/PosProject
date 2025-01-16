import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

const formatMonthYear = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) {
    console.error("Invalid date:", dateString);
    return "Invalid Date";
  }
  return format(date, "MMMM yyyy");
};

const ReportsPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Group the data by month and branch
  const groupedSales = salesData.reduce((groups, item) => {
    const monthYear = formatMonthYear(item.createdat);
    const branchId = item.branchid;

    if (!groups[monthYear]) {
      groups[monthYear] = {};
    }

    if (!groups[monthYear][branchId]) {
      groups[monthYear][branchId] = { totalAmount: 0, count: 0 };
    }

    groups[monthYear][branchId].totalAmount += item.totalamount;
    groups[monthYear][branchId].count += 1;

    return groups;
  }, {});

  // Filter sales data dynamically based on the search query
  const filteredSales = Object.keys(groupedSales).reduce((result, monthYear) => {
    const branchesData = Object.keys(groupedSales[monthYear]).filter((branchId) => {
      const { totalAmount, count } = groupedSales[monthYear][branchId];
      const branchName = getBranchName(branchId);

      // Check if any column matches the search query
      return (
        monthYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        totalAmount.toFixed(2).includes(searchQuery) ||
        count.toString().includes(searchQuery)
      );
    });

    if (branchesData.length > 0) {
      result[monthYear] = branchesData;
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

      {/* Search input */}
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Month, Branch, Amount, or Items Sold"
          className="border p-2 rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Table for displaying the data */}
      <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
        <thead className="bg-teal-600 text-white">
          <tr>
            <th className="border-b-2 p-2 text-left">Month</th>
            <th className="border-b-2 p-2 text-left">Branch</th>
            <th className="border-b-2 p-2 text-left">Total Amount</th>
            <th className="border-b-2 p-2 text-left">Items Sold</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(filteredSales).map((monthYear) => (
            <React.Fragment key={monthYear}>
              {filteredSales[monthYear].map((branchId) => {
                const { totalAmount, count } = groupedSales[monthYear][branchId];
                return (
                  <tr key={branchId} className="hover:bg-gray-100">
                    <td className="border-b p-2">{monthYear}</td>
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
