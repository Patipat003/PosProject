import React from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {show && (
        <motion.div
          id="modal-overlay"
          onClick={handleBackgroundClick}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}  // เริ่มต้นที่ opacity = 0
          animate={{ opacity: 1 }}   // เมื่อแสดงให้ opacity = 1
          exit={{ opacity: 0 }}      // เมื่อปิดให้ opacity กลับไปที่ 0
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้คลิกภายใน modal ปิด modal
            initial={{ y: -50, opacity: 0 }}  // เริ่มต้นที่ y=-50 และ opacity=0
            animate={{ y: 0, opacity: 1 }}   // เมื่อแสดงให้ y=0 และ opacity=1
            exit={{ y: 50, opacity: 0 }}     // เมื่อปิดให้ y=50 และ opacity=0
            transition={{ duration: 0.3 }}   // กำหนดระยะเวลาในการเคลื่อนที่
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-600">Top Sale Products</h2>
            <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="border text-sm px-4 py-2">Product Name</th>
                  <th className="border text-sm px-4 py-2">Quantity Sold</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{product.productname}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoldProductsModal;
