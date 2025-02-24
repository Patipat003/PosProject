import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FaEye, FaTrash } from "react-icons/fa"; // Import receipt and print icons
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; // ✅ Import jwt-decode


const RequestShipment = ({ selectedBranchId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [shipmentItems, setShipmentItems] = useState([]);
  const [userBranchId, setUserBranchId] = useState(""); // ✅ เก็บ branchid ของผู้ใช้
  const [shipments, setShipments] = useState([]); // ✅ เก็บรายการ Shipments
  const [selectedShipment, setSelectedShipment] = useState(null); // ✅ Shipment ที่เลือกสำหรับดู Items
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false); // ✅ เปิด/ปิด Items Modal
  const [searchTerm, setSearchTerm] = useState(""); // ✅ State สำหรับช่องค้นหา
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // จำนวน shipments ต่อหน้า

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShipments = [...shipments]
    .sort((a, b) => new Date(b.updatedat) - new Date(a.updatedat)) // เรียงจากใหม่ไปเก่า
    .slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
  
    axios.get("http://localhost:5050/products", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        console.log("Fetched products:", res.data); // ✅ Debug ดูข้อมูลจาก API
        if (res.data && res.data.Data && Array.isArray(res.data.Data)) {
          setProducts(res.data.Data); // ✅ ดึง products จาก res.data.Data
        } else {
          console.error("Unexpected response format:", res.data);
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      });
  }, []);
  
  useEffect(() => {
    const Token = localStorage.getItem("authToken");
  
    if (Token) {
      try {
        const decodedToken = jwtDecode(Token); // ✅ ถอดรหัส token
        console.log("Decoded Token:", decodedToken); // ✅ Debug ดูข้อมูล token
  
        if (decodedToken.branchid) {
          setUserBranchId(decodedToken.branchid); // ✅ ตั้งค่า branchid ของผู้ใช้
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchShipments = () => {
    const authToken = localStorage.getItem("authToken");
    axios.get(`http://localhost:5050/shipments?branchid=${userBranchId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setShipments(res.data.Data || []))
      .catch(() => setShipments([]));
  };
  
  useEffect(() => {
    if (!userBranchId) return;
    fetchShipments(); // เรียก fetchShipments ครั้งแรก
    const interval = setInterval(fetchShipments, 2000);
    return () => clearInterval(interval);
  }, [userBranchId]);
  

  // ✅ ดึงข้อมูล Shipments เฉพาะ branch ของผู้ใช้
  useEffect(() => {
    if (!userBranchId) return;
    const authToken = localStorage.getItem("authToken");
  
    const fetchShipments = () => {
      axios
        .get(`http://localhost:5050/shipments?branchid=${userBranchId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((res) => setShipments(res.data.Data || []))
        .catch(() => setShipments([]));
    };
  
    // ✅ เรียก API ครั้งแรก
    fetchShipments();
  
    // ✅ ตั้ง interval ให้ polling ทุก 2 วินาที
    const interval = setInterval(fetchShipments, 2000);
  
    // ✅ Cleanup function ล้าง interval เมื่อ component unmount หรือ userBranchId เปลี่ยน
    return () => clearInterval(interval);
  }, [userBranchId]);
  
  // กรองรายการสินค้าตาม searchTerm ที่ค้นหาด้วย productcode
  const filteredProducts = products.filter((product) =>
    product.productcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ เปิด Items Modal และโหลดรายการสินค้าใน Shipment นั้น
  const handleViewItems = (shipment) => {
    setSelectedShipment(shipment);
    setShipmentItems(shipment.items || []);
    setIsItemsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity!");
      return;
    }

    setShipmentItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productid === selectedProduct);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productid === selectedProduct ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { productid: selectedProduct, quantity }];
    });

    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveItem = (productid) => {
    setShipmentItems((prevItems) => prevItems.filter((item) => item.productid !== productid));
  };

  const handleQuantityChange = (productid, newQuantity) => {
    if (newQuantity < 1) return;
    setShipmentItems((prevItems) =>
      prevItems.map((item) =>
        item.productid === productid ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleDeleteShipment = (shipmentId) => {
    const authToken = localStorage.getItem("authToken");
  
    axios.delete(`http://localhost:5050/shipments/${shipmentId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then(() => {
        toast.success("Shipment deleted successfully!");
        setShipments((prevShipments) => prevShipments.filter(s => s.shipmentid !== shipmentId));
      })
      .catch(() => {
        toast.error("Failed to delete shipment.");
      });
  };
  
  const handleSubmit = () => {
    if (!userBranchId) {
      toast.error("Please select a branch before submitting.");
      return;
    }
  
    if (shipmentItems.length === 0) {
      toast.error("Please add at least one product!");
      return;
    }
  
    const requestData = {
      branchid: userBranchId,
      items: shipmentItems.map(item => ({
        productid: item.productid,
        quantity: item.quantity,
      })),
    };
  
    const authToken = localStorage.getItem("authToken");
  
    axios.post("http://localhost:5050/shipments", requestData, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then(() => {
        toast.success("Shipment request created successfully!");
        setShipmentItems([]); 
        fetchShipments(); // ✅ รีเฟรชข้อมูลหลังจากสร้าง shipment สำเร็จ
      })
      .catch(() => {
        toast.error("Failed to create shipment.");
      });
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
            onClick={() => setIsModalOpen(false)} // ✅ ปิด modal เมื่อคลิกนอก modal
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-lg max-w-7xl w-full relative z-60 overflow-y-auto max-h-screen mt-10"
              onClick={(e) => e.stopPropagation()} // ✅ ป้องกัน modal ปิดเมื่อคลิกด้านใน
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Request Shipment from Warehouse
              </h3>

              <div className="flex gap-4 mb-4">

                {/* ✅ ช่องค้นหาตาม productcode */}
                <input
                  type="text"
                  placeholder="🔍 Search by Product Code"
                  className="w-1/3 p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">Select a product</option>
                  {filteredProducts.map((product) => (
                    <option key={product.productid} value={product.productid}>
                       {product.productcode} - {product.productname}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  className="w-1/6 p-3 border text-black text-center border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />

                <button
                  onClick={handleAddItem}
                  className="btn border-none bg-teal-500 text-white font-medium py-3 px-6 rounded hover:bg-teal-600 transition duration-300"
                >
                  Add
                </button>
              </div>

              <table className="table-auto table-xs w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="border text-sm px-4 py-2">Product Code</th>
                    <th className="border text-sm px-4 py-2">Product Name</th>
                    <th className="border text-sm px-4 py-2">Quantity</th>
                    <th className="border text-sm px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentItems.map((item) => {
                    const product = products.find((p) => p.productid === item.productid);
                    return (
                      <tr key={item.productid} className="bg-gray-80 ">
                        <td className="border px-4 py-2">{product?.productcode || "Unknown"}</td>
                        <td className="border px-4 py-2">{product?.productname || "Unknown"}</td>
                        <td className="border px-4 py-2 text-center">
                          <input
                            type="number"
                            min="1"
                            className="border bg-white p-1 rounded w-20 text-center"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.productid, Number(e.target.value))
                            }
                          />
                        </td>
                        <td className="px-4 py-2 flex items-center justify-center space-x-4">
                          <button
                            onClick={() => handleRemoveItem(item.productid)}
                            className="btn btn-xs bg-red-500 text-white border-none hover:bg-red-800 rounded flex items-center"
                            >
                              <FaTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex justify-end items-center mt-6">
                <div className="flex gap-3">
                  <button
                    className="btn border-none bg-teal-500 text-white font-medium py-3 px-6 rounded hover:bg-teal-600 transition duration-300"
                    onClick={handleSubmit}
                  >
                    Submit Request
                  </button>
                  <button
                    onClick={() => setShipmentItems([])}
                    className="btn border-none bg-red-500 text-white font-medium py-3 px-6 rounded hover:bg-red-800 transition duration-300"
                  >
                    <FaTrash />
                  Clear All
                </button>       
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-600 my-4">Shipments Table</h3>
              <table className="table-auto table-xs min-w-full border-4 border-gray-300 mb-4 text-gray-800">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="border py-2 px-4 text-sm">Shipment Number</th>
                    <th className="border py-2 px-4 text-sm">Status</th>
                    <th className="border py-2 px-4 text-sm">Updated At</th>
                    <th className="border py-2 px-4 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentShipments.map((shipment) => (
                    <tr key={shipment.shipmentid} className="hover:bg-gray-100">
                      <td className="border py-2 px-4 border-gray-300 text-black">{shipment.shipmentnumber}</td>
                      <td className="border py-2 px-4 border-gray-300 text-black">{shipment.status}</td>
                      <td className="border py-2 px-4 border-gray-300 text-black">
                        {new Date(shipment.updatedat).toISOString().slice(0, 16).replace("T", " ")}
                      </td>
                      <td className="border px-4 py-2 flex items-center justify-center space-x-4">
                        <button
                          onClick={() => handleViewItems(shipment)}
                          className="btn btn-xs w-20 bg-teal-500 text-white border-none hover:bg-teal-600 rounded flex items-center"
                          >
                            <FaEye /> View
                        </button>
                        <button
                            onClick={() => handleDeleteShipment(shipment.shipmentid)}
                            className="btn btn-xs bg-red-500 text-white border-none hover:bg-red-800 rounded flex items-center"
                          >
                            <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>

                <div className="flex items-center">Page {currentPage} of {Math.ceil(shipments.length / itemsPerPage)}</div>

                <button
                  className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                  disabled={currentPage === Math.ceil(shipments.length / itemsPerPage)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className="bg-white p-8 rounded-lg shadow-lg w-3/4 relative z-60 overflow-y-auto max-h-screen"
          >
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Shipment Items</h2>
            <p className="text-gray-600 mb-4">Shipment Number - {selectedShipment?.shipmentnumber}</p>

            {/* ตารางรายการสินค้า */}
            <table className="table-auto table-xs min-w-full border-4 border-gray-300 mb-4 text-gray-800">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="border py-2 px-4 text-sm">Image</th>
                  <th className="border py-2 px-4 text-sm">Product Code</th>
                  <th className="border py-2 px-4 text-sm">Product Name</th>
                  <th className="border py-2 px-4 text-sm">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {shipmentItems.map((item, index) => {
                  const product = products.find((p) => p.productid === item.productid);
                  return (
                    <tr key={index} className="border border-gray-300">
                      {/* รูปสินค้า */}
                      <td className="px-4 py-2 text-center">
                        {product?.imageurl ? (
                          <img src={product.imageurl} alt={product.productname} className="w-12 h-12 object-cover rounded-md mx-auto" />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      {/* รหัสสินค้า */}
                      <td className="border py-2 px-4 border-gray-300 text-black">{product?.productcode || "N/A"}</td>
                      {/* ชื่อสินค้า */}
                      <td className="border py-2 px-4 border-gray-300 text-black">{product?.productname || "Unknown"}</td>
                      {/* จำนวนสินค้า */}
                      <td className="border py-2 px-4 border-gray-300 text-black">{item.quantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* ปุ่มปิด */}
            <div className="flex justify-end">
              <button
                className="btn border-none bg-teal-500 text-white font-medium px-6 py-3 mt-6 rounded-md hover:bg-teal-600 transition duration-300"
                onClick={() => setIsItemsModalOpen(false)}
              >
                Close
              </button>
            </div> 
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default RequestShipment;
