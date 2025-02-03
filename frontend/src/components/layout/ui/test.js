import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion"; // Importing AnimatePresence and motion

const RequestInventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]); // Add state for inventory
  const [newRequest, setNewRequest] = useState({
    frombranchid: "",
    tobranchid: "",
    productid: "",
    quantity: 0,
    status: "pending",
  });
  const [branchName, setBranchName] = useState("");
  const [warehouse, setWarehouse] = useState([]); // Add state for warehouse
  const [error, setError] = useState(""); // Add error state
  const [itemsPerPage] = useState(10); // จำนวนข้อมูลต่อหน้า
  const location = useLocation();  // ใช้ useLocation เพื่อดึงข้อมูลจาก state ที่ส่งมาจาก Header
  const [toBranch, setToBranch] = useState('');
  const [activeSection, setActiveSection] = useState("products"); // Default to "sending"

  // Fetch data from API
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get("http://localhost:5050/Requests", config);
      setRequests(response.data.Data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/branches", config);
      setBranches(response.data.Data || []);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/products", config);
      setProducts(response.data.Data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/inventory", config);
      setInventory(response.data.Data || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  // Fetch warehouse data
  const fetchWarehouse = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/warehouse", config);
      setWarehouse(response.data.Data || []);
      console.log("Warehouse data:", response.data);
    } catch (err) {
      console.error("Error fetching warehouse:", err);
    }
  };

  // ดึงข้อมูล Inventory ของ Branch ที่เลือก
  const fetchInventoryForBranch = async (branchid) => {
    try {
      const response = await axios.get(`http://localhost:5050/inventory?branchid=${branchid}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    }
  };

  // ฟังก์ชันในการอัปเดตชื่อสินค้าให้แสดงจำนวน
  const updateProductOptionsWithInventory = () => {
    const updatedProducts = products.map((product) => {
      const inventoryItem = inventory.find(
        (item) => item.productid === product.productid
      );
      const quantity = inventoryItem ? inventoryItem.quantity : 0;
      return {
        ...product,
        displayName: `${product.productname} (${quantity})`, // แสดงจำนวนสินค้าด้วย
      };
    });
    setProducts(updatedProducts);
  };

  useEffect(() => {
    fetchBranches();
    fetchProducts();
    fetchRequests();
    fetchInventory();
    fetchWarehouse();  // เรียกใช้ฟังก์ชัน fetchWarehouse
  }, []);

  useEffect(() => {
      if (toBranch) {
        fetchInventoryForBranch(toBranch);
      }
  }, [toBranch]);

  useEffect(() => {
    if (inventory.length > 0) {
      updateProductOptionsWithInventory();
    }
  }, [inventory]);

  // Extract the branch ID from the token (assuming it's stored in the payload)
  const getBranchFromToken = () => {
    const token = localStorage.getItem("authToken");
    const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
    return decoded.branchid; // Assuming the branch ID is in the token
  };
  

  useEffect(() => {
    const branchid = getBranchFromToken();
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      tobranchid: branchid, // Set the branch as "to branch" from token
    }));

    // Get branch name using the branch ID from token
    const branch = branches.find((branch) => branch.branchid === branchid);
    if (branch) {
      setBranchName(branch.bname);
    }
  }, [branches]);

  const handleAddRequest = async () => {
    // ตรวจสอบว่า frombranchid และ tobranchid เป็นตัวเดียวกันหรือไม่
    if (newRequest.frombranchid === newRequest.tobranchid) {
      // ถ้าเป็นตัวเดียวกันให้แสดง Toast error
      toast.error("From branch and To branch cannot be the same!");
      return; // หยุดการทำงาน
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Proceed to create request
      await axios.post("http://localhost:5050/Requests", newRequest, config);

      // แสดง toast เมื่อสำเร็จ
      toast.success("Request successfully added!");

      fetchRequests();
      setNewRequest({
        frombranchid: "",
        tobranchid: "",
        productid: "",
        quantity: 0,
        status: "pending",
      });
      setError(""); // Clear any previous error
    } catch (err) {
      console.error("Error adding request:", err);

      // แสดง toast เมื่อเกิดข้อผิดพลาด
      if (err.response && err.response.status === 400) {
        toast.error("Failed to create request: Bad Request");
      } else {
        toast.error("An error occurred. Please try again.");
      }

      if (err.response && err.response.status === 400) {
        setError("Failed to create request: Bad Request");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  // Update request status
  const handleUpdateStatus = async (requestId, status) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(
        `http://localhost:5050/Requests/${requestId}`,
        { status },
        config
      );

      toast.success(
        `Quantity updated completed!`
      );

      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Get branch ID from token and filter requests based on that branch ID
  const branchid = getBranchFromToken();

  // Filter inventory based on the branch of the user
  const filteredInventory = inventory.filter(
    (item) => item.branchid === branchid
  );

  // แยก currentPage สำหรับ Sent และ Received
  const [currentSentPage, setCurrentSentPage] = useState(1);
  const [currentReceivedPage, setCurrentReceivedPage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);

  // Filter and sort requests for Sent and Received Requests
  const sentRequests = requests
    .filter(request => request.frombranchid === branchid)
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat)); // เรียงลำดับใหม่ก่อน

  const receivedRequests = requests
    .filter(request => request.tobranchid === branchid)
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat)); // เรียงลำดับใหม่ก่อน

  // Pagination logic
  const getPaginatedRequests = (requests, currentPage) => {
    const indexOfLastRequest = currentPage * itemsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
    return requests.slice(indexOfFirstRequest, indexOfLastRequest);
  };

  // Get paginated data
  const currentSentRequests = getPaginatedRequests(sentRequests, currentSentPage);
  const currentReceivedRequests = getPaginatedRequests(receivedRequests, currentReceivedPage);
  const currentProductRequests = getPaginatedRequests(filteredInventory, currentProductPage);

  // Calculate total pages
  const totalSentPages = Math.ceil(sentRequests.length / itemsPerPage);
  const totalReceivedPages = Math.ceil(receivedRequests.length / itemsPerPage);
  const totalProductPages = Math.ceil(filteredInventory.length / itemsPerPage);

  // Handle Previous Page for Sent Requests
  const handlePreviousPageSent = () => {
    if (currentSentPage > 1) {
      setCurrentSentPage(currentSentPage - 1);
    }
  };

  // Handle Previous Page for Received Requests
  const handlePreviousPageReceived = () => {
    if (currentReceivedPage > 1) {
      setCurrentReceivedPage(currentReceivedPage - 1);
    }
  };

  // Handle Next Page for Sent Requests
  const handleNextPageSent = () => {
    if (currentSentPage < totalSentPages) {
      setCurrentSentPage(currentSentPage + 1);
    }
  };

  // Handle Next Page for Received Requests
  const handleNextPageReceived = () => {
    if (currentReceivedPage < totalReceivedPages) {
      setCurrentReceivedPage(currentReceivedPage + 1);
    }
  };

  // Handle Previous Page for Products
  const handlePreviousPageProduct = () => {
    if (currentProductPage > 1) {
      setCurrentProductPage(currentProductPage - 1);
    }
  };

  // Handle Next Page for Products
  const handleNextPageProduct = () => {
    if (currentProductPage < totalProductPages) {
      setCurrentProductPage(currentProductPage + 1);
    }
  };

  /// ดึง branchid ของผู้ใช้ปัจจุบัน
  const userBranchId = getBranchFromToken();

  // นับจำนวน pending requests ใน Sending Shipment (กรองเฉพาะ frombranchid เป็นของตัวเอง)
  const pendingSentRequestsCount = requests.filter(
    (request) =>
      request.frombranchid === userBranchId && // กรองเฉพาะ frombranchid เป็นของตัวเอง
      request.status === "pending" // กรองเฉพาะสถานะ pending
  ).length;

  // นับจำนวน pending requests ใน Receiving Shipment (กรองเฉพาะ tobranchid เป็นของตัวเอง)
  const pendingReceivedRequestsCount = requests.filter(
    (request) =>
      request.tobranchid === userBranchId && // กรองเฉพาะ tobranchid เป็นของตัวเอง
      request.status === "Pending" // กรองเฉพาะสถานะ pending
  ).length;

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);  // ถ้ามี openModal ใน state ให้เปิด modal ทันที
    }
  }, [location.state]);

  useEffect(() => {
    if (!branchid) {
      return; // ถ้าไม่มีข้อมูลของ user หรือ branchid ก็ไม่ทำการ polling
    }
  
    const intervalId = setInterval(() => {
      fetchRequests();
      fetchInventory();
    }, 2000); // Polling ทุกๆ 2 วินาที
  
    // Cleanup function เพื่อหยุดการ Polling เมื่อ Component ถูก unmount
    return () => clearInterval(intervalId);
  }, [fetchRequests],{fetchInventory});
  
  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
      >
        Request Inventory
      </button>
  
      {/* Add Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={() => setIsModalOpen(false)} // Close modal when clicking background
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-lg max-w-7xl w-full relative z-60 overflow-y-auto max-h-screen mt-10"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Add New Request
                </h3>
                <form>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        From Branch ({branchName})
                      </label>
                      <select
                        className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={newRequest.tobranchid}
                        disabled
                      >
                        <option value="">Your Branch</option>
                      </select>
                    </div>
  
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        To Branch
                      </label>
                      <select
                        className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={newRequest.frombranchid}
                        onChange={(e) =>
                          setNewRequest({ ...newRequest, frombranchid: e.target.value })
                        }
                      >
                        <option value="">Select Branch</option>
                        {branches
                          .filter((branch) => branch.branchid !== branchid) // Filter out our own branch
                          .map((branch) => (
                            <option key={branch.branchid} value={branch.branchid}>
                              {branch.bname}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Product
                      </label>
                      <select
                        className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={newRequest.productid}
                        onChange={(e) =>
                          setNewRequest({ ...newRequest, productid: e.target.value })
                        }
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => {
                          // Find the inventory for this product in the selected "To Branch"
                          const branchInventory = inventory.find(
                            (item) => item.productid === product.productid && item.branchid === newRequest.frombranchid
                          );
                          const quantity = branchInventory ? branchInventory.quantity : 0;
  
                          return (
                            <option key={product.productid} value={product.productid}>
                              {product.productname} ({quantity})
                            </option>
                          );
                        })}
                      </select>
                    </div>
  
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={newRequest.quantity}
                        onChange={(e) =>
                          setNewRequest({
                            ...newRequest,
                            quantity: parseInt(e.target.value),
                          })
                        }
                        min="0"
                      />
                    </div>
                  </div>
  
                  <button
                    className="btn border-none bg-teal-500 text-white font-medium py-3 px-6 rounded hover:bg-teal-600 transition duration-300"
                    onClick={handleAddRequest}
                  >
                    Add Request
                  </button>
                </form>
              </div>
  
              {/* Buttons to switch between sections */}
              <div className="flex justify-center space-x-4 mb-6">
                {/* ปุ่ม Sending Shipment */}
                <button
                  onClick={() => setActiveSection("sending")}
                  className={`btn border-none ${
                    activeSection === "sending" ? "bg-teal-600" : "bg-teal-500"
                  } text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 relative`}
                >
                  Sending Shipment
                  {pendingSentRequestsCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1 transform translate-x-1/2 -translate-y-1/2">
                      {pendingSentRequestsCount}
                    </span>
                  )}
                </button>
  
                {/* ปุ่ม Receiving Shipment */}
                <button
                  onClick={() => setActiveSection("receiving")}
                  className={`btn border-none ${
                    activeSection === "receiving" ? "bg-teal-600" : "bg-teal-500"
                  } text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 relative`}
                >
                  Receiving Shipment
                  {pendingReceivedRequestsCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1 transform translate-x-1/2 -translate-y-1/2">
                      {pendingReceivedRequestsCount}
                    </span>
                  )}
                </button>
  
                {/* ปุ่ม Products */}
                <button
                  onClick={() => setActiveSection("products")}
                  className={`btn border-none ${
                    activeSection === "products" ? "bg-teal-600" : "bg-teal-500"
                  } text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300`}
                >
                  Products
                </button>
              </div>       
              
              {/* Conditionally render the active section */}
              {activeSection === "sending" && (
                <>
                  {/* Sending Shipment Table */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-teal-600 mb-4">Sending Shipment</h3>
                    <table className="table-auto table-xs w-full border-separate border-4 border-gray-300 mb-4 text-gray-800">
                      <thead className="bg-gray-100 text-gray-600">
                        <tr>
                          <th className="border text-sm px-4 py-2">To Branch</th>
                          <th className="border text-sm px-4 py-2">Product Name</th>
                          <th className="border text-sm px-4 py-2">Quantity</th>
                          <th className="border text-sm px-4 py-2">Created At</th>
                          <th className="border text-sm px-4 py-2">Status</th>
                          <th className="border text-sm px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSentRequests.map((request) => {
                          const toBranch = branches.find(
                            (branch) => branch.branchid === request.tobranchid
                          );
                          const product = products.find(
                            (product) => product.productid === request.productid
                          );
  
                          return (
                            <tr key={request.requestid} className="bg-gray-80 hover:bg-gray-50">
                              <td className="border text-sm px-4 py-2">
                                {toBranch ? toBranch.bname : "-"}
                              </td>
                              <td className="border text-sm px-4 py-2">
                                {product ? product.productname : "-"}
                              </td>
                              <td className="border text-sm px-4 py-2">{request.quantity}</td>
                              <td className="border text-sm px-4 py-2">
                                {moment(request.createdat).format("L, HH:mm")}
                              </td>
                              <td className="border text-sm px-4 py-2">{request.status}</td>
                              <td className="border text-sm px-4 py-2">
                                {request.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(request.requestid, "complete")
                                      }
                                      className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition duration-300"
                                    >
                                      Complete
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(request.requestid, "reject")
                                      }
                                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 ml-2"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
  
                  {/* Pagination Controls for Sent Requests */}
                  <div className="flex justify-center mt-4 space-x-4">
                    <button
                      onClick={handlePreviousPageSent}
                      disabled={currentSentPage === 1}
                      className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                    >
                      Previous
                    </button>
                    <div className="flex items-center">
                      <span className="mr-2">Page</span>
                      <span>{currentSentPage}</span>
                      <span className="ml-2">of {totalSentPages}</span>
                    </div>
                    <button
                      onClick={handleNextPageSent}
                      disabled={currentSentPage === totalSentPages}
                      className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
  
              {activeSection === "receiving" && (
                  <>
                    {/* Receiving Shipment Table */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-teal-600 mb-4">Receiving Shipment</h3>
                      <table className="table-auto table-xs w-full border-separate border-4 border-gray-300 mb-4 text-gray-800">
                        <thead className="bg-gray-100 text-gray-600">
                          <tr>
                            <th className="border text-sm px-4 py-2">From Branch</th>
                            <th className="border text-sm px-4 py-2">Product Name</th>
                            <th className="border text-sm px-4 py-2">Quantity</th>
                            <th className="border text-sm px-4 py-2">Created At</th>
                            <th className="border text-sm px-4 py-2">Status</th>
                            <th className="border text-sm px-4 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentReceivedRequests.map((request) => {
                            const fromBranch = branches.find(
                              (branch) => branch.branchid === request.frombranchid
                            );
                            const product = products.find(
                              (product) => product.productid === request.productid
                            );
  
                            return (
                              <tr key={request.requestid} className="hover:bg-teal-50">
                                <td className="border text-sm px-4 py-2">
                                  {fromBranch ? fromBranch.bname : "Warehouse"}
                                </td>
                                <td className="border text-sm px-4 py-2">
                                  {product ? product.productname : "-"}
                                </td>
                                <td className="border text-sm px-4 py-2">{request.quantity}</td>
                                <td className="border text-sm px-4 py-2">
                                  {moment(request.createdat).format("L, HH:mm")}
                                </td>
                                <td className="border text-sm px-4 py-2">{request.status}</td>
                                {fromBranch ? "" : "Warehouse" && request.status === "Pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(request.requestid, "complete")
                                      }
                                      className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition duration-300"
                                    >
                                      Complete
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(request.requestid, "reject")
                                      }
                                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 ml-2"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
  
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
  
                    {/* Pagination Controls for Received Requests */}
                    <div className="flex justify-center mt-4 space-x-4">
                      <button
                        onClick={handlePreviousPageReceived}
                        disabled={currentReceivedPage === 1}
                        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                      >
                        Previous
                      </button>
                      <div className="flex items-center">
                        <span className="mr-2">Page</span>
                        <span>{currentReceivedPage}</span>
                        <span className="ml-2">of {totalReceivedPages}</span>
                      </div>
                      <button
                        onClick={handleNextPageReceived}
                        disabled={currentReceivedPage === totalReceivedPages}
                        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
  
                {activeSection === "products" && (
                  <>
                    {/* Products Table */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-teal-600 my-4">
                        Products ({branchName})
                      </h3>
                      <table className="table-auto table-xs w-full border-separate border-4 border-gray-300 mb-4 text-gray-800">
                        <thead className="bg-gray-100 text-gray-600">
                          <tr>
                            <th className="border text-sm px-4 py-2">Product Name</th>
                            <th className="border text-sm px-4 py-2">Price</th>
                            <th className="border text-sm px-4 py-2">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentProductRequests.map((item) => {
                            const product = products.find(
                              (product) => product.productid === item.productid
                            );
                            return (
                              <tr key={item.inventoryid}>
                                <td className="border px-4 py-2">
                                  {product ? product.productname : "-"}
                                </td>
                                <td className="border px-4 py-2">
                                  {product ? product.price : "-"}
                                </td>
                                <td className="border px-4 py-2">{item.quantity}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>           
                    </div>
  
                    {/* Pagination Controls for Products */}
                    <div className="flex justify-center mt-4 space-x-4">
                      <button
                        onClick={handlePreviousPageProduct}
                        disabled={currentProductPage === 1}
                        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                      >
                        Previous
                      </button>
                      <div className="flex items-center">
                        <span className="mr-2">Page</span>
                        <span>{currentProductPage}</span>
                        <span className="ml-2">of {totalProductPages}</span>
                      </div>
                      <button
                        onClick={handleNextPageProduct}
                        disabled={currentProductPage === totalProductPages}
                        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestInventory;