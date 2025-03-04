import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import { Player } from "@lottiefiles/react-lottie-player";


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
  const [selectedEmployee, setSelectedEmployee] = useState(""); // Declare the selectedEmployee state

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true" 
        }
      };

      const salesResponse = await axios.get(`${API_BASE_URL}/sales`, config);
      const branchResponse = await axios.get(`${API_BASE_URL}/branches`, config);

      setSalesData(salesResponse.data.Data);
      setBranches(branchResponse.data.Data);
      console.log(salesResponse.data.Data);
      console.log(branchResponse.data.Data);
      setLoading(false);

      const userBranch = getUserBranch(); // Get user branch id from token
      setSelectedEmployee(userBranch); // Set the selectedEmployee to user's branch id
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

  const getUserBranch = () => {
    const token = localStorage.getItem("authToken");
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode token
    return decodedToken.branchid; // Extract branchid from token
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
        (selectedEmployee === "" || selectedEmployee === branchId) && // Check if branch matches the selectedEmployee
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

  const generateCSVData = () => {
    const csvData = [
      ["No.", "Date", "Branch", "Total Amount", "Items Sold"],
    ];
    Object.keys(filteredSales).forEach((dateKey, index) => {
      filteredSales[dateKey].forEach((branchId) => {
        const { totalAmount, count } = groupedSales[dateKey][branchId];
        csvData.push([
          index + 1,
          dateKey,
          getBranchName(branchId),
          totalAmount.toFixed(2),
          count,
        ]);
      });
    });
    return csvData;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-42 flex-col">
        <Player
          autoplay
          loop
          src="https://assets3.lottiefiles.com/packages/lf20_z4cshyhf.json"
          style={{ height: "200px", width: "200px" }}
        />
        <span className="text-red-500 text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Sales Reports</h1>

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setFilterType("day")}
          className={`p-2 rounded-md ${filterType === "day" ? "bg-red-800 text-white" : "bg-gray-200"}`}
        >
          Day
        </button>
        <button
          onClick={() => setFilterType("month")}
          className={`p-2 rounded-md ${filterType === "month" ? "bg-red-800 text-white" : "bg-gray-200"}`}
        >
          Month
        </button>
        <button
          onClick={() => setFilterType("year")}
          className={`p-2 rounded-md ${filterType === "year" ? "bg-red-800 text-white" : "bg-gray-200"}`}
        >
          Year
        </button>
        <button
          onClick={() => setFilterType("time")}
          className={`p-2 rounded-md ${filterType === "time" ? "bg-red-800 text-white" : "bg-gray-200"}`}
        >
          Time
        </button>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Date, Branch, Amount, or Items Sold"
          className="border bg-white border-gray-300 p-3 pr-10 text-gray-600 rounded-md w-full min-w-[200px] focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <select
          value={selectedEmployee} // Use the selectedEmployee state
          onChange={(e) => setSelectedEmployee(e.target.value)} // Update the state on change
          className="border bg-white border-gray-300 p-3 pr-10 text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="">All Branches</option>
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
          className="border bg-white border-gray-300 p-3 pr-10 text-gray-600 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-400 text-lg flex items-center"
          dateFormat={filterType === "day" ? "dd MMMM yyyy" : "MMMM yyyy"}
          showMonthYearPicker={filterType === "month"}
          showYearPicker={filterType === "year"}
          todayButton="Today"
          isClearable
          clearButtonClassName="absolute right-2 top-2 bg-red-400 text-white rounded-full p-1"
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
                  <tr key={branchId} className="hover:bg-gray-100 text-gray-600">
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
      <CSVLink
        data={generateCSVData()}
        filename={"Sales_Report.csv"}
        className="btn border-none bg-red-800 text-white px-6 py-3 rounded hover:bg-red-900 transition duration-300 mt-4"
      >
        Export to CSV
      </CSVLink>
    </div>
  );
};

export default ReportsPage;
