import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { jwtDecode } from "jwt-decode"; // Import the jwt-decode library
import AddRequestModal from "./AddRequestModal";
import SendingShipmentTable from "./SendingShipmentTable";
import ReceivingShipmentTable from "./ReceivingShipmentTable";
import ProductsTable from "./ProductsTable";

const RequestInventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [newRequest, setNewRequest] = useState({
    frombranchid: "",
    tobranchid: "",
    productid: "",
    quantity: 0,
    status: "pending",
  });
  const [branchName, setBranchName] = useState("");
  const [warehouse, setWarehouse] = useState([]);
  const [error, setError] = useState("");
  const [itemsPerPage] = useState(10);
  const location = useLocation();
  const [toBranch, setToBranch] = useState('');
  const [activeSection, setActiveSection] = useState("products");
  const [userRole, setUserRole] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "d/MM/yyyy, HH:mm");
  };

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
    } catch (err) {
      console.error("Error fetching warehouse:", err);
    }
  };

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

  const updateProductOptionsWithInventory = () => {
    const updatedProducts = products.map((product) => {
      const inventoryItem = inventory.find(
        (item) => item.productid === product.productid
      );
      const quantity = inventoryItem ? inventoryItem.quantity : 0;
      return {
        ...product,
        displayName: `${product.productname} (${quantity})`,
      };
    });
    setProducts(updatedProducts);
  };

  useEffect(() => {
    fetchBranches();
    fetchProducts();
    fetchRequests();
    fetchInventory();
    fetchWarehouse();
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

  const getBranchFromToken = () => {
    const token = localStorage.getItem("authToken");
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.branchid;
  };

  useEffect(() => {
        const token = localStorage.getItem("authToken"); // Retrieve the token from local storage
        if (token) {
          const decoded = jwtDecode(token); // Decode the JWT token
          setUserRole(decoded.role); // Set the user role from the decoded token
        }
  }, []);

  const isAudit = userRole === "Audit"; // Audit can access only views

  useEffect(() => {
    const branchid = getBranchFromToken();
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      tobranchid: branchid,
    }));

    const branch = branches.find((branch) => branch.branchid === branchid);
    if (branch) {
      setBranchName(branch.bname);
    }
  }, [branches]);

  const handleAddRequest = async () => {
    if (newRequest.frombranchid === newRequest.tobranchid) {
      toast.error("From branch and To branch cannot be the same!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post("http://localhost:5050/Requests", newRequest, config);
      toast.success("Request successfully added!");
      fetchRequests();
      setNewRequest({
        frombranchid: "",
        tobranchid: "",
        productid: "",
        quantity: 0,
        status: "pending",
      });
      setError("");
    } catch (err) {
      console.error("Error adding request:", err);
      if (err.response && err.response.status === 400) {
        toast.error("Failed to create request: Bad Request");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

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

      toast.success(`Quantity updated completed!`);
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const branchid = getBranchFromToken();
  const filteredInventory = inventory.filter(
    (item) => item.branchid === branchid
  );

  const [currentSentPage, setCurrentSentPage] = useState(1);
  const [currentReceivedPage, setCurrentReceivedPage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);

  const sentRequests = requests
    .filter(request => request.frombranchid === branchid)
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat));

  const receivedRequests = requests
    .filter(request => request.tobranchid === branchid)
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat));

  const getPaginatedRequests = (requests, currentPage) => {
    const indexOfLastRequest = currentPage * itemsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
    return requests.slice(indexOfFirstRequest, indexOfLastRequest);
  };

  const currentSentRequests = getPaginatedRequests(sentRequests, currentSentPage);
  const currentReceivedRequests = getPaginatedRequests(receivedRequests, currentReceivedPage);
  const currentProductRequests = getPaginatedRequests(filteredInventory, currentProductPage);

  const totalSentPages = Math.ceil(sentRequests.length / itemsPerPage);
  const totalReceivedPages = Math.ceil(receivedRequests.length / itemsPerPage);
  const totalProductPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const handlePreviousPageSent = () => {
    if (currentSentPage > 1) {
      setCurrentSentPage(currentSentPage - 1);
    }
  };

  const handlePreviousPageReceived = () => {
    if (currentReceivedPage > 1) {
      setCurrentReceivedPage(currentReceivedPage - 1);
    }
  };

  const handleNextPageSent = () => {
    if (currentSentPage < totalSentPages) {
      setCurrentSentPage(currentSentPage + 1);
    }
  };

  const handleNextPageReceived = () => {
    if (currentReceivedPage < totalReceivedPages) {
      setCurrentReceivedPage(currentReceivedPage + 1);
    }
  };

  const handlePreviousPageProduct = () => {
    if (currentProductPage > 1) {
      setCurrentProductPage(currentProductPage - 1);
    }
  };

  const handleNextPageProduct = () => {
    if (currentProductPage < totalProductPages) {
      setCurrentProductPage(currentProductPage + 1);
    }
  };

  const userBranchId = getBranchFromToken();

  const pendingSentRequestsCount = requests.filter(
    (request) =>
      request.frombranchid === userBranchId &&
      request.status === "pending"
  ).length;

  const pendingReceivedRequestsCount = requests.filter(
    (request) =>
      request.tobranchid === userBranchId &&
      request.status === "Pending"
  ).length;

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!branchid) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchRequests();
      fetchInventory();
    }, 2000);

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

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-lg max-w-7xl w-full relative z-60 overflow-y-auto max-h-screen mt-10"
              onClick={(e) => e.stopPropagation()}
            >
              {( !isAudit ) && (
                <AddRequestModal
                  newRequest={newRequest}
                  setNewRequest={setNewRequest}
                  branches={branches}
                  products={products}
                  inventory={inventory}
                  branchid={branchid}
                  branchName={branchName}
                  handleAddRequest={handleAddRequest}
                />
              )}

              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={() => setActiveSection("products")}
                  className={`btn border-none ${
                    activeSection === "products" ? "bg-teal-600" : "bg-teal-500"
                  } text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300`}
                >
                  Products
                </button>

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
              </div>

              {activeSection === "sending" && (
                <SendingShipmentTable
                  currentSentRequests={currentSentRequests}
                  branches={branches}
                  products={products}
                  handleUpdateStatus={handleUpdateStatus}
                  handlePreviousPageSent={handlePreviousPageSent}
                  handleNextPageSent={handleNextPageSent}
                  currentSentPage={currentSentPage}
                  totalSentPages={totalSentPages}
                />
              )}

              {activeSection === "receiving" && (
                <ReceivingShipmentTable
                  currentReceivedRequests={currentReceivedRequests}
                  branches={branches}
                  products={products}
                  handleUpdateStatus={handleUpdateStatus}
                  handlePreviousPageReceived={handlePreviousPageReceived}
                  handleNextPageReceived={handleNextPageReceived}
                  currentReceivedPage={currentReceivedPage}
                  totalReceivedPages={totalReceivedPages}
                />
              )}

              {activeSection === "products" && (
                <ProductsTable
                  currentProductRequests={currentProductRequests}
                  products={products}
                  branchName={branchName}
                  handlePreviousPageProduct={handlePreviousPageProduct}
                  handleNextPageProduct={handleNextPageProduct}
                  currentProductPage={currentProductPage}
                  totalProductPages={totalProductPages}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestInventory;