import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const InventoryModal = ({ selectedInventory, branches, handleCloseModal, userBranchId }) => {
  if (!selectedInventory) return null;

  // ดึงข้อมูลสินค้าที่เกี่ยวข้อง
  const branchData = selectedInventory.relatedInventory.map((item) => ({
    branch: branches[item.branchid]?.bname || "Unknown",
    quantity: item.quantity,
    isUserBranch: item.branchid === userBranchId, // เช็คว่าสาขาเป็นของผู้ใช้หรือไม่
  }));

  // ข้อมูลกราฟ
  const data = {
    labels: branchData.map((item) => item.branch),
    datasets: [
      {
        label: "Quantity",
        data: branchData.map((item) => item.quantity),
        backgroundColor: branchData.map((item) =>
          item.quantity < 100 ? "rgba(255, 99, 132, 0.6)" : "rgba(75, 192, 192, 0.6)"
        ),
        borderColor: branchData.map((item) =>
          item.quantity < 100 ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg relative">
        {/* แสดงชื่อสินค้า */}
        <h2 className="text-2xl font-bold mb-4 text-center text-teal-600">
          {selectedInventory.productname || "No Product Name Available"}
        </h2>

        {/* กราฟแสดงจำนวนสินค้า */}
        <div className="mb-6">
          <Bar data={data} options={options} />
        </div>

        {/* รายละเอียดข้อความ */}
        <div className="text-sm text-gray-700 space-y-2">
          {branchData.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center ${
                item.isUserBranch ? "font-bold text-teal-600" : ""
              }`}
            >
              <span>
                {item.branch} {item.isUserBranch && "(Your Branch)"}
              </span>
              <span
                className={`${
                  item.quantity < 100 ? "text-red-500" : "text-green-600"
                }`}
              >
                {item.quantity} pieces
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleCloseModal}
          className="btn border-none w-full bg-teal-500 text-white font-medium px-6 py-3 mt-6 rounded-md hover:bg-teal-600 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InventoryModal;
