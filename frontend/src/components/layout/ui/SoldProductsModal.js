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
          className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoldProductsModal;
