import React, { useState } from "react";

const ReportsPage = () => {
  const initialData = [
    {
      product: "Product A",
      monthlySales: [10, 20, 15, 30, 25, 40, 35, 50, 45, 60, 55, 70],
    },
    {
      product: "Product B",
      monthlySales: [5, 10, 8, 12, 20, 25, 22, 18, 24, 30, 28, 35],
    },
    {
      product: "Product C",
      monthlySales: [8, 12, 10, 15, 18, 20, 25, 30, 35, 40, 38, 45],
    },
  ];

  const [data, setData] = useState(initialData);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Monthly Sales Report</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Summary</h2>
        <p className="text-gray-600">
          This Year's Total Sales (All Products):{" "}
          <span className="font-bold">
            {data
              .map((item) => item.monthlySales.reduce((sum, val) => sum + val, 0))
              .reduce((total, yearly) => total + yearly, 0)}
          </span>{" "}
          units
        </p>
        <p className="text-gray-500 mt-4 text-right">Year: 2024</p>
      </div>

      <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-lg">
        <table className="table-auto w-full border-collapse border border-gray-200 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Product</th>
              {[
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
              <th className="border border-gray-300 px-4 py-2">Yearly Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.product}
                className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  {row.product}
                </td>
                {row.monthlySales.map((value, index) => (
                  <td
                    key={index}
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    {value}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                  {row.monthlySales.reduce((sum, val) => sum + val, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
