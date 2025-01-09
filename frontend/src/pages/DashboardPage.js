import React from "react";
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardPage = () => {
  const salesSummary = [
    { branch: "Branch A", sales: 5000 },
    { branch: "Branch B", sales: 3000 },
    { branch: "Branch C", sales: 4500 },
  ];

  const keyMetrics = [
    { label: "Total Sales", value: 12500 },
    { label: "Active Users", value: 45 },
    { label: "Low Stock Alerts", value: 10 },
  ];

  // Data for Pie Chart
  const pieData = {
    labels: salesSummary.map((data) => data.branch),
    datasets: [
      {
        data: salesSummary.map((data) => data.sales),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
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
    <div className="p-6 bg-gray-100 min-h-screen text-black ">
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
        <div className="w-40 mx-auto">
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
              <th className="border border-gray-300 p-1 text-left">Branch</th>
              <th className="border border-gray-300 p-1 text-left">Sales</th>
            </tr>
          </thead>
          <tbody>
            {salesSummary.map((data, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{data.branch}</td>
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
