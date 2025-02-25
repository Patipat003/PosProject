import React, { useState, useEffect, useCallback, useRef } from "react";
import { HiChevronDown, HiUser, HiMail, HiLogout, HiUserGroup, HiOfficeBuilding, HiBell, HiTruck } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Ensure jwtEncode is imported for updating the token
import ModalStockLow from "./ModalStockLow";

const Header = () => {
  const [branchName, setBranchName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [salesNotifications, setSalesNotifications] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const dropdownRef = useRef(null);  // Reference to the dropdown container

  const getUserDataFromToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserData(decodedToken);
      setIsSuperAdmin(decodedToken.role === "Super Admin");
    }
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" }
      });
      setBranches(response.data);
      console.log("API Response:", response.data);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchBranchName = useCallback(async (branchid) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/branches/${branchid}`, {
        headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" }
      });
      setBranchName(response.data.Data.bname);
    } catch (err) {
      console.error("Error fetching branch:", err);
    }
  }, []);

  const handleBranchSelect = (branchid) => {
    setSelectedBranch(branchid);
  };

  const handleBranchConfirmation = () => {
    if (!selectedBranch) {
      alert("Please select a branch.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      decodedToken.branchid = selectedBranch;
      const newToken = jwtEncode(decodedToken, "yourSecretKey");
      localStorage.setItem("authToken", newToken);
      fetchBranchName(selectedBranch);
      setIsBranchModalOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const fetchInventory = useCallback(async (branchid) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/inventory?branchid=${branchid}`, {
        headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" }
      });
      const inventory = response.data.Data;
      const lowStockItems = inventory.filter(item => item.branchid === branchid && item.quantity < 100);
      setLowStockProducts(lowStockItems);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const branchid = decodedToken.branchid;

      const response = await axios.get(
        `${API_BASE_URL}/requests`,
        {
          headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" }
        }
      );

      const requests = response.data.Data;
      const notifications = requests.filter(request => request.frombranchid === branchid && request.status === "pending" || request.tobranchid === branchid && request.status === "Pending");
      setSalesNotifications(notifications);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  }, []);

  useEffect(() => {
    if (userData && userData.branchid) {
      fetchBranchName(userData.branchid);  // ดึงชื่อสาขา
      fetchRequests();  // ดึงข้อมูลการร้องขอ
    }
  }, [userData, fetchBranchName, fetchRequests]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userData && userData.branchid) {
        fetchRequests();
        fetchInventory(userData.branchid);
      }
    }, 2000); // Polling every 2 seconds

    return () => clearInterval(intervalId);
  }, [userData, fetchRequests, fetchInventory]);

  useEffect(() => {
    getUserDataFromToken();
    if (isSuperAdmin) fetchBranches();
  }, [getUserDataFromToken, isSuperAdmin]);

  useEffect(() => {
    if (userData?.branchid) fetchBranchName(userData.branchid);
  }, [userData, fetchBranchName]);

  useEffect(() => {
    if (userData?.branchid) fetchInventory(userData.branchid);
  }, [userData, fetchInventory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = () => {
    navigate("/inventory", { state: { openModal: true } });
  };

  const handleNotificationClick1 = () => {
    setIsModalOpen(true);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-teal-600 text-white shadow-md relative">
      {/* โลโก้ อยู่ตรงกลาง */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link to="/">
          <img src="/image/x10logo.png" alt="x10" className="h-10 w-auto" />
        </Link>
      </div>

      {/* แจ้งเตือน + User Info (อยู่ขวา) */}
      <div className="flex items-center space-x-4 ml-auto">
        {salesNotifications.length > 0 && (
          <button
            onClick={handleNotificationClick}
            className="relative flex items-center p-2 bg-red-500 rounded-full shadow-md z-20 transition duration-200 ease-in-out focus:ring-2 focus:ring-red-300 focus:outline-none"
          >
            <HiTruck className="h-6 w-6" />
            <span className="absolute top-0 right-0 bg-yellow-400 text-black rounded-full text-xs px-2 py-1">
              {salesNotifications.length}
            </span>
          </button>
        )}

        {lowStockProducts.length > 0 && (
          <button
            onClick={handleNotificationClick1}
            className="relative flex items-center p-2 bg-red-500 rounded-full shadow-md z-20 transition duration-200 ease-in-out focus:ring-2 focus:ring-red-300 focus:outline-none"
          >
            <HiBell className="h-6 w-6" />
            <span className="absolute top-0 right-0 bg-yellow-400 text-black rounded-full text-xs px-2 py-1">
              {lowStockProducts.length}
            </span>
          </button>
        )}

        {/* ชื่อสาขา */}
        <Link to="/sales">
          <p className="text-white">{branchName || "Loading branch..."}</p>
        </Link>

        {/* Dropdown ของ User */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-700 rounded-lg text-white"
          >
            <HiUser />
            <HiChevronDown className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && userData && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 text-black">
              <div className="px-4 py-2 text-sm flex items-center">
                <HiUser className="text-teal-600 mr-2" />
                {userData?.name || "Loading name..."}
              </div>
              <div className="px-4 py-2 text-sm flex items-center">
                <HiMail className="text-teal-600 mr-2" />
                {userData?.email || "Loading email..."}
              </div>
              <div className="px-4 py-2 text-sm flex items-center">
                <HiUserGroup className="text-teal-600 mr-2" />
                {userData?.role || "Loading role..."}
              </div>
              <div className="px-4 py-2 text-sm flex items-center">
                <HiOfficeBuilding className="text-teal-600 mr-2" />
                {branchName || "Loading branch..."}
              </div>
              
              {/* New Dropdown Option for Changing Branch */}
              {isSuperAdmin && (
                <Link to="/select-branch" className="text-red-600 px-4 py-2 text-sm flex items-center hover:bg-red-100">
                  <HiOfficeBuilding className="text-red-600 mr-2" />
                  Change Branch
                </Link>
              )}

              <div
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 cursor-pointer flex items-center space-x-2 hover:bg-red-100"
              >
                <HiLogout />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isBranchModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Select Branch</h3>
            <select
              onChange={(e) => handleBranchSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Please select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <div className="mt-4">
              <button
                onClick={handleBranchConfirmation}
                className="w-full py-2 px-4 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isModalOpen && (
        <ModalStockLow 
          products={lowStockProducts} 
          closeModal={() => setIsModalOpen(false)} 
        />
      )}
    </header>
  );
};

export default Header;
