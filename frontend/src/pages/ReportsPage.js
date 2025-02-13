import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [filterType, setFilterType] = useState("month");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

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

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.branchid === branchId);
    return branch ? branch.bname : "Unknown Branch";
  };

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

  const filteredSales = Object.keys(groupedSales).reduce((result, dateKey) => {
    const branchesData = Object.keys(groupedSales[dateKey]).filter((branchId) => {
      const { totalAmount, count } = groupedSales[dateKey][branchId];
      const branchName = getBranchName(branchId);

      return (
        (selectedBranch === "" || selectedBranch === branchId) &&
        (!selectedDate ||
          dateKey === format(selectedDate, filterType === "day" ? "dd MMMM yyyy" : "MMMM yyyy")) &&
        (searchQuery === "" ||
          dateKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Sales Report", 14, 15);
        
        const tableColumn = ["No.", "Date", "Branch", "Total Amount", "Items Sold"];
        const tableRows = [];
      
        Object.keys(filteredSales).forEach((dateKey, index) => {
          filteredSales[dateKey].forEach((branchId) => {
            const { totalAmount, count } = groupedSales[dateKey][branchId];
            tableRows.push([
              index + 1,
              dateKey,
              getBranchName(branchId),
              `$${totalAmount.toFixed(2)}`,
              count,
            ]);
          });
        });
      
        autoTable(doc, {
          startY: 20,
          head: [tableColumn],
          body: tableRows,
        });
      
        doc.save("Sales_Report.pdf");
      };



  if (loading) {
    return <div className="text-center text-xl py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Sales Reports</h1>

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

      {/* Search input, branch dropdown, and calendar picker */}
      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Date, Branch, Amount, or Items Sold"
          className="border bg-white border-gray-300 p-3 pr-10 text-black rounded-md w-full min-w-[200px] focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="border bg-white border-gray-300 p-3 pr-10 text-black rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.branchid} value={branch.branchid}>
              {branch.bname}
            </option>
          ))}
        </select>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          placeholderText="Select Date"
          className="border bg-white border-gray-300 p-3 pr-10 text-black rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-400 text-lg flex items-center"
          dateFormat={filterType === "day" ? "dd MMMM yyyy" : "MMMM yyyy"}
          showMonthYearPicker={filterType === "month"}
          showYearPicker={filterType === "year"}
          todayButton="Today"
          isClearable
          clearButtonClassName="absolute right-2 top-2 bg-teal-400 text-white rounded-full p-1"
          style={{ position: "relative" }}
        />
      </div>
      
      
      <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="border text-sm px-4 py-2">No.</th>
            <th className="border text-sm px-4 py-2">Date</th>
            <th className="border text-sm px-4 py-2">Branch</th>
            <th className="border text-sm px-4 py-2">Total Amount</th>
            <th className="border text-sm px-4 py-2">Items Sold</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(filteredSales).map((dateKey, index) => (
            <React.Fragment key={dateKey}>
              {filteredSales[dateKey].map((branchId) => {
                const { totalAmount, count } = groupedSales[dateKey][branchId];
                return (
                  <tr key={branchId} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{dateKey}</td>
                    <td className="border border-gray-300 px-4 py-2">{getBranchName(branchId)}</td>
                    <td className="border border-gray-300 px-4 py-2">${totalAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">{count}</td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}

        </tbody>
      </table>
      <button
        onClick={exportToPDF}
        className="bg-teal-500 text-white p-2 rounded-md shadow-md hover:bg-teal-600"
        >
          Export to PDF
      </button>
    </div>
  );
};

export default ReportsPage;
