import React from "react";

const ReportsPage = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">New Itme</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-700">#Stock</h2>
          <h2 className="text-2xl font-semibold text-gray-700">Stock Cost</h2>
          <h2 className="text-2xl font-semibold text-gray-700">Stock Value</h2>
          <h2 className="text-2xl font-semibold text-gray-700 text-right">All Online Storefront</h2>
          <h2 className="text-2xl font-semibold text-gray-700 text-right">Today's Sales</h2>
          <h2 className="text-2xl font-semibold text-gray-700 text-right">This Month</h2>
        </div>
      </div>


      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Monthly Report</h2>
        <p className="text-gray-600">
          This Year's Sales: <span className="font-bold">$0.00</span>
        </p>
        <p className="text-gray-500 mt-4 text-right">Year: 2024</p>
      </div>

      <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-lg">
        <table className="table-auto w-full border-collapse border border-gray-200 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Reports</th>
              {[ // แสดงเดือนในแนวนอน
                "JAN",
                "FEB",
                "MAR",
                "APR",
                "MAY",
                "JUN",
                "JUL",
                "AUG",
                "SEP",
                "OCT",
                "NOV",
                "DEC",
              ].map((month) => (
                <th key={month} className="border border-gray-300 px-4 py-2">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { metric: "Stock", values: Array(12).fill(10) },
              { metric: "Stock Cost", values: Array(12).fill("$1000") },
              { metric: "Stock Value", values: Array(12).fill("$1200") },
              { metric: "Online Storefront", values: Array(12).fill("Active") },
              { metric: "Today's Sales", values: Array(12).fill("$500") },
              { metric: "This Month's Sales", values: Array(12).fill("$15000") },
            ].map((row, rowIndex) => (
              <tr
                key={row.metric}
                className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  {row.metric}
                </td>
                {row.values.map((value, index) => (
                  <td
                    key={index}
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
