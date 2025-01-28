import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const KeyMetrics = ({ metricsData }) => {
  const { totalSales, activeUsers, lowStockAlerts } = metricsData;

  const barData = (label, value) => ({
    labels: [label],
    datasets: [
      {
        label: label,
        data: [value],
        backgroundColor: "#36A2EB",
        borderColor: "#36A2EB",
        borderWidth: 1,
      },
    ],
  });

  const options = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Total Sales Bar */}
      <div className="bg-white shadow rounded-lg p-4 text-center">
        <h3 className="text-lg font-semibold text-teal-600 mb-2">Total Sales</h3>
        <Bar data={barData("Total Sales", totalSales)} options={options} />
        <p className="text-blue-500 text-xl font-bold mt-4">
          ฿{totalSales.toLocaleString()}
        </p>
      </div>

      {/* Active Users Bar */}
      <div className="bg-white shadow rounded-lg p-4 text-center">
        <h3 className="text-lg font-semibold text-teal-600 mb-2">Active Users</h3>
        <Bar data={barData("Active Users", activeUsers)} options={options} />
        <p className="text-blue-500 text-xl font-bold mt-4">{activeUsers}</p>
      </div>

      {/* Low Stock Alerts Bar */}
      <div className="bg-white shadow rounded-lg p-4 text-center">
        <h3 className="text-lg font-semibold text-teal-600 mb-2">Low Stock Alerts</h3>
        <Bar data={barData("Low Stock Alerts", lowStockAlerts)} options={options} />
        <p className="text-red-500 text-xl font-bold mt-4">{lowStockAlerts}</p>
      </div>
    </div>
  );
};

export default KeyMetrics;
