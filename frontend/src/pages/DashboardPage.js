import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardPage = () => {
  const [salesSummary, setSalesSummary] = useState([]);
  const [keyMetrics, setKeyMetrics] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch sales data
        const salesResponse = await axios.get("http://localhost:5050/sales", config);
        const salesData = salesResponse.data.Data;

        // Fetch branches data
        const branchesResponse = await axios.get("http://localhost:5050/branches", config);
        const branchesData = branchesResponse.data.Data;

        // Calculate sales summary by branch
        const branchSales = salesData.reduce((acc, sale) => {
          const branch = acc.find((b) => b.branchid === sale.branchid);
          if (branch) {
            branch.sales += sale.totalamount;
          } else {
            acc.push({ branchid: sale.branchid, sales: sale.totalamount });
          }
          return acc;
        }, []);

        // Merge branch names with sales summary and include all branches
        const salesWithBranchNames = branchesData.map((branch) => {
          const sale = branchSales.find((b) => b.branchid === branch.branchid);
          return {
            branchid: branch.branchid,
            bname: branch.bname,
            sales: sale ? sale.sales : 0, // Include branches with zero sales
          };
        });

        // Calculate key metrics
        const totalSales = salesData.reduce((sum, sale) => sum + sale.totalamount, 0);
        const activeUsers = new Set(salesData.map((sale) => sale.userid)).size; // Example: Count unique users
        const lowStockAlerts = 10; // Replace this with dynamic data if available

        setSalesSummary(salesWithBranchNames);
        setKeyMetrics([
          { label: "Total Sales", value: totalSales },
          { label: "Active Users", value: activeUsers },
          { label: "Low Stock Alerts", value: lowStockAlerts },
        ]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Data for Pie Chart
  const pieData = {
    labels: salesSummary.map((data) => data.bname),
    datasets: [
      {
        data: salesSummary.map((data) => data.sales),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  // Data for Bar Chart
  const barData = {
    labels: keyMetrics.map((metric) => metric.label),
    datasets: [
      {
        label: "Metrics",
        data: keyMetrics.map((metric) => metric.value),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-black">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {keyMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white shadow rounded-lg p-3 flex flex-col items-center justify-center text-center text-sm"
          >
            <h2 className="font-semibold">{metric.label}</h2>
            <p className="text-blue-500 font-bold">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h2 className="text-sm font-semibold mb-2">Sales Summary (Pie Chart)</h2>
        <div className="w-200 mx-auto">
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h2 className="text-sm font-semibold mb-2">Key Metrics (Bar Chart)</h2>
        <div className="w-60 mx-auto">
          <Bar data={barData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Sales Summary Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-2">Sales Summary (Table)</h2>
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-1 text-left">Branch Name</th>
              <th className="border border-gray-300 p-1 text-left">Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {salesSummary.map((data, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{data.bname}</td>
                <td className="border border-gray-300 p-1">
                  ${data.sales.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
