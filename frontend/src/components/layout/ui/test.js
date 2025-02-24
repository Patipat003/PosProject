import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const RequestShipment = ({ selectedBranchId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [shipments, setShipments] = useState([]); // ✅ เก็บรายการ Shipments
  const [selectedShipment, setSelectedShipment] = useState(null); // ✅ Shipment ที่เลือกสำหรับดู Items
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false); // ✅ เปิด/ปิด Items Modal
  const [shipmentItems, setShipmentItems] = useState([]);
  const [userBranchId, setUserBranchId] = useState("");

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return;

    axios
      .get("http://localhost:5050/products", { headers: { Authorization: `Bearer ${authToken}` } })
      .then((res) => setProducts(res.data.Data || []))
      .catch(() => setProducts([]));

    try {
      const decodedToken = jwtDecode(authToken);
      if (decodedToken.branchid) {
        setUserBranchId(decodedToken.branchid);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  // ✅ ดึงข้อมูล Shipments เฉพาะ branch ของผู้ใช้
  useEffect(() => {
    if (!userBranchId) return;
    const authToken = localStorage.getItem("authToken");

    axios
      .get(`http://localhost:5050/shipments?branchid=${userBranchId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setShipments(res.data.Data || []))
      .catch(() => setShipments([]));
  }, [userBranchId]);

  // ✅ เปิด Items Modal และโหลดรายการสินค้าใน Shipment นั้น
  const handleViewItems = (shipment) => {
    setSelectedShipment(shipment);
    setShipmentItems(shipment.items || []);
    setIsItemsModalOpen(true);
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
      >
        Request Shipment
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full relative z-60 overflow-y-auto max-h-screen"
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Request Shipment</h2>

              {/* ✅ ตารางแสดง Shipments */}
              <h3 className="text-lg font-semibold text-gray-600 mt-4">Shipments</h3>
              <table className="w-full border-collapse border border-gray-300 mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Shipment ID</th>
                    <th className="border border-gray-300 px-4 py-2">Status</th>
                    <th className="border border-gray-300 px-4 py-2">Updated At</th>
                    <th className="border border-gray-300 px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => (
                    <tr key={shipment.shipmentid} className="border border-gray-300">
                      <td className="px-4 py-2">{shipment.shipmentid}</td>
                      <td className="px-4 py-2">{shipment.status}</td>
                      <td className="px-4 py-2">{new Date(shipment.updatedat).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          onClick={() => handleViewItems(shipment)}
                        >
                          View Items
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ปุ่มปิด modal */}
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 mt-4"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Modal สำหรับแสดงรายการสินค้าใน Shipment */}
      <AnimatePresence>
        {isItemsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full relative z-60 overflow-y-auto max-h-screen"
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Shipment Items</h2>
              <p className="text-gray-600 mb-2">Shipment ID: {selectedShipment?.shipmentid}</p>

              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Product Name</th>
                    <th className="border border-gray-300 px-4 py-2">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentItems.map((item, index) => {
                    const product = products.find((p) => p.productid === item.productid);
                    return (
                      <tr key={index} className="border border-gray-300">
                        <td className="px-4 py-2">{product?.productname || "Unknown"}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 mt-4"
                onClick={() => setIsItemsModalOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestShipment;
