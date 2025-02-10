import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import axios from "axios";
import { toZonedTime, format } from 'date-fns-tz';
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Player } from "@lottiefiles/react-lottie-player";
import moment from "moment";
import SoldProductsModal from "../components/layout/ui/SoldProductsModal";
import { HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineCube } from 'react-icons/hi';

const POLLING_INTERVAL = 5000;

// Utility function to format date
const formatDate = (dateString) => {
  const zonedDate = toZonedTime(dateString, 'UTC');
  return format(zonedDate, "d/MM/yyyy, HH:mm");
};

// Utility function to calculate sales by time range (day, month, year)
const calculateSalesByTime = (salesData, range) => {
  const salesByTime = {};

  salesData.forEach(sale => {
    const date = new Date(sale.createdat);
    let key;

    if (range === "day") {
      key = format(date, "yyyy-MM-dd");
    } else if (range === "month") {
      key = format(date, "yyyy-MM");
    } else if (range === "year") {
      key = format(date, "yyyy");
    }

    if (!salesByTime[key]) {
      salesByTime[key] = 0;
    }
    salesByTime[key] += sale.totalamount;
  });

  return Object.entries(salesByTime).map(([time, sales]) => ({ time, sales }));
};

// Fetch data function
const fetchData = async (token, selectedBranch, branchid, timeRange = "day") => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const endpoints = ["saleitems", "sales", "products", "branches", "inventory", "receipts", "employees"];
  const responses = await Promise.all(endpoints.map(endpoint => axios.get(`http://localhost:5050/${endpoint}`, config)));
  const [saleItemsData, salesData] = responses.map(res => res.data.Data);

  const filteredSales = selectedBranch === "all"
    ? salesData
    : salesData.filter(sale => sale.branchid === branchid);

  const salesByTime = calculateSalesByTime(filteredSales, timeRange);

  return { salesByTime };
};

const DashboardPage = () => {
  const [salesByTime, setSalesByTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [userBranchId, setUserBranchId] = useState(null);
  const [timeRange, setTimeRange] = useState("day");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const branchid = decodedToken.branchid;
    setUserBranchId(branchid);

    const loadData = async () => {
      try {
        const { salesByTime } = await fetchData(token, selectedBranch, branchid, timeRange);
        setSalesByTime(salesByTime);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    loadData();
    const intervalId = setInterval(loadData, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [selectedBranch, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-42 flex-col">
        <Player autoplay loop src="https://assets3.lottiefiles.com/packages/lf20_z4cshyhf.json" style={{ height: "200px", width: "200px" }} />
        <span className="text-teal-500 text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-42 flex-col">
        <AiOutlineExclamationCircle className="text-red-500 text-6xl mb-4" />
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  // Sales Graph Data (ApexCharts)
  const salesGraphOptions = {
    chart: { type: "line", height: 350 },
    xaxis: { categories: salesByTime.map(data => moment(data.time).format("D/M/YY")) },
    stroke: { curve: "smooth" },
    markers: { size: 4 },
    tooltip: { theme: "dark" },
    colors: ["#FF6384"],
    yaxis: { title: { text: "Total Sales (THB)" } },
  };

  const salesGraphSeries = [{ name: "Sales", data: salesByTime.map(data => data.sales) }];

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Dashboard</h1>

      {/* Sales Trend Chart */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-4">Sales Trend</h2>
        <div className="flex space-x-2 mb-4">
          <button onClick={() => setTimeRange("day")} className={`btn ${timeRange === "day" ? "bg-teal-500 text-white" : "bg-gray-200"}`}>Daily</button>
          <button onClick={() => setTimeRange("month")} className={`btn ${timeRange === "month" ? "bg-teal-500 text-white" : "bg-gray-200"}`}>Monthly</button>
          <button onClick={() => setTimeRange("year")} className={`btn ${timeRange === "year" ? "bg-teal-500 text-white" : "bg-gray-200"}`}>Yearly</button>
        </div>
        <ApexCharts options={salesGraphOptions} series={salesGraphSeries} type="line" height={350} />
      </div>
    </div>
  );
};

export default DashboardPage;
