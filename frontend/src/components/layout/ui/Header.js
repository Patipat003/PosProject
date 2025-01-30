import React, { useState, useEffect, useCallback } from "react";
import { HiChevronDown, HiUser, HiMail, HiLogout, HiUserGroup, HiOfficeBuilding, HiBell, HiTruck  } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ModalStockLow from "./ModalStockLow"; // Import modal component

const Header = () => {
  const [branchName, setBranchName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [salesNotifications, setSalesNotifications] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // For managing modal state
  const navigate = useNavigate();

  const getUserDataFromToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserData(decodedToken);
    }
  }, []);

  const fetchBranchName = useCallback(async (branchid) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }
      const response = await axios.get(
        `http://localhost:5050/branches/${branchid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const branch = response.data.Data;
      setBranchName(branch.bname);
    } catch (err) {
      console.error("Error fetching branch:", err);
    }
  }, []);

  // ฟังก์ชันเพื่อดึงข้อมูลสินค้าในสต็อกจาก API
  const fetchInventory = useCallback(async (branchid) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(
        `http://localhost:5050/inventory?branchid=${branchid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const inventory = response.data.Data;

      // Filter products by branchid and quantity less than 100
      const lowStockItems = inventory.filter(item => item.branchid === branchid && item.quantity < 100);
      setLowStockProducts(lowStockItems); // Update state with filtered products
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
        `http://localhost:5050/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
    getUserDataFromToken();
  }, [getUserDataFromToken]);

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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleNotificationClick = () => {
    navigate("/inventory", { state: { openModal: true } });
  };

  const handleNotificationClick1 = () => {
    setIsModalOpen(true); // Open modal on notification click
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-teal-600 text-white shadow-md relative">
      {/* Left: Logo */}
      <div className="flex-shrink-0 ml-5">
        <Link to="/" className="flex items-center">
          <img
            src="https://publish-p33706-e156581.adobeaemcloud.com/content/dam/aem-cplotusonlinecommerce-project/th/images/medias/logo/lotus-logo-header.svg"
            alt="Lotus's Icon"
            className="h-6 w-40"
          />
        </Link>
      </div>

      {/* Right: Notification Icons */}
      
      <div className="flex items-center space-x-4">

        {salesNotifications.length > 0 && (
          <button
            onClick={handleNotificationClick}
            className="relative flex items-center p-2 text-white bg-red-500 rounded-full shadow-md z-20 transition duration-200 ease-in-out focus:ring-2 focus:ring-red-300 focus:outline-none"
          >
            <HiTruck className="h-6 w-6" />
            <span className="absolute top-0 right-0 bg-yellow-400 text-black rounded-full text-xs px-2 py-1">{salesNotifications.length}</span>
          </button>
        )}

        {lowStockProducts.length > 0 && (
          <button
            onClick={handleNotificationClick1}
            className="relative flex items-center p-2 text-white bg-red-500 rounded-full shadow-md z-20 transition duration-200 ease-in-out focus:ring-2 focus:ring-red-300 focus:outline-none"
          >
            <HiBell className="h-6 w-6" />
            <span className="absolute top-0 right-0 bg-yellow-400 text-black rounded-full text-xs px-2 py-1">{lowStockProducts.length}</span>
          </button>
        )}

        <p className="text-white">{branchName || "Loading branch..."}</p>
        <div className="relative ml-auto">
          {/* User Dropdown */}
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
              <div
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 cursor-pointer flex items-center space-x-2"
              >
                <HiLogout />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Low Stock Products */}
        {isModalOpen && (
          <ModalStockLow 
            products={lowStockProducts} 
            closeModal={() => setIsModalOpen(false)} 
          />
        )}
      </div>
    </header>
  );
};

export default Header;
