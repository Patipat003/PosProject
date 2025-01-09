import React from "react";

const DashboardPage = () => {
  const salesSummary = [
    { branch: "Branch A", sales: "$5,000" },
    { branch: "Branch B", sales: "$3,000" },
    { branch: "Branch C", sales: "$4,500" },
  ];

  const keyMetrics = [
    { label: "Total Sales", value: "$12,500" },
    { label: "Active Users", value: "45" },
    { label: "Low Stock Alerts", value: "10 items" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-black ">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {keyMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white shadow rounded-lg p-4 flex flex-col items-center justify-center"
          >
            <h2 className="text-lg font-semibold">{metric.label}</h2>
            <p className="text-xl font-bold text-blue-500">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Sales Summary Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Sales Summary</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 text-left">Branch</th>
              <th className="border border-gray-300 p-2 text-left">Sales</th>
            </tr>
          </thead>
          <tbody>
            {salesSummary.map((data, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{data.branch}</td>
                <td className="border border-gray-300 p-2">{data.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
