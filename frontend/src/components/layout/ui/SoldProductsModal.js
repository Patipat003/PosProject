import React from "react";

const SoldProductsModal = ({ show, closeModal, products }) => {
  if (!show) return null;

  const sortedProducts = products.sort((a, b) => b.quantity - a.quantity);

  const handleBackgroundClick = (e) => {
    // ตรวจสอบว่าคลิกในพื้นที่นอก modal
    if (e.target.id === "modal-overlay") {
      closeModal();
    }
  };

  return (
    <div
      id="modal-overlay"
      onClick={handleBackgroundClick}
      className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50"
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้คลิกภายใน modal ปิด modal
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-600">Top Sale Products</h2>
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600">
              <th className="border border-gray-300 p-1 text-left">Product Name</th>
              <th className="border border-gray-300 p-1 text-left">Quantity Sold</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product, index) => (
              <tr key={index} className="text-gray-600">
                <td className="border border-gray-300 p-1">{product.productname}</td>
                <td className="border border-gray-300 p-1">{product.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SoldProductsModal;
