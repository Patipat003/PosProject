import React, { useState, useEffect, useCallback } from "react";
import { HiChevronDown, HiUser, HiMail, HiLogout, HiUserGroup, HiOfficeBuilding, HiBell } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const [branchName, setBranchName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [salesNotifications, setSalesNotifications] = useState([]);
  const navigate = useNavigate();

  // ฟังก์ชันเพื่อดึงข้อมูลจาก token
  const getUserDataFromToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserData(decodedToken);
    }
  }, []);

  // ฟังก์ชันเพื่อดึงข้อมูลสาขาจาก API
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

  // ฟังก์ชันเพื่อดึงข้อมูลการร้องขอจาก API /requests
  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Extract branchid from token
      const decodedToken = jwtDecode(token);
      const branchid = decodedToken.branchid;

      const response = await axios.get(
        `http://localhost:5050/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const requests = response.data.Data;

      // Check for requests with matching frombranchid and pending status
      const notifications = requests.filter(request => request.frombranchid === branchid && request.status === "pending");
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
      fetchBranchName(userData.branchid);
      fetchRequests();
    }
  }, [userData, fetchBranchName, fetchRequests]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  // ฟังก์ชันเมื่อคลิกไอคอนแจ้งเตือน
  const handleNotificationClick = () => {
    navigate("/inventory", { state: { openModal: true } }); // ส่ง state ให้หน้า inventory ว่าต้องการเปิด modal
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-teal-600 text-white shadow-md">
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

      {/* Right: User Dropdown and Notification */}
      <div className="relative ml-auto">
        {/* Notification Icon */}
        {salesNotifications.length > 0 && (
          <button
            onClick={handleNotificationClick}  // เมื่อคลิกที่ไอคอนจะนำทางไปหน้า /inventory
            className="absolute top-0 right-16 flex items-center p-2 text-white bg-red-500 rounded-full shadow-md"
          >
            <HiBell />
          </button>
        )}

        {/* User Dropdown */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-700 rounded-lg text-white"
        >
          <HiUser />
          <HiChevronDown
            className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
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
    </header>
  );
};

export default Header;
