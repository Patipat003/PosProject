import React, { useState, useEffect } from "react";
import { HiChevronDown, HiUser, HiLogout } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [branchName, setBranchName] = useState(""); // state สำหรับเก็บชื่อสาขา
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ดึงข้อมูลจาก localStorage
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUserData) {
      setUserData(storedUserData);
      fetchBranchName(storedUserData.branchid); // ใช้ branchid จากข้อมูลผู้ใช้เพื่อดึงชื่อสาขา
    }
  }, []);

  const fetchBranchName = async (branchid) => {
    try {
      // ดึง token จาก localStorage
      const token = localStorage.getItem("authToken");
  
      // ตรวจสอบว่ามี token อยู่หรือไม่
      if (!token) {
        console.error("No token found");
        return;
      }
  
      // ส่งคำขอพร้อมกับ JWT token ใน headers
      const response = await axios.get(`http://localhost:5050/branches/${branchid}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ส่ง token ใน header
        },
      });
  
      // ตรวจสอบข้อมูลที่ได้จาก API
      console.log("Fetched Branch Data:", response.data);
  
      // แก้ไขการเข้าถึงข้อมูลใน response
      const branch = response.data.Data;  // ใช้ Data แทนที่จะเป็น response.data
      setBranchName(branch.bname); // เก็บชื่อสาขาไว้ใน state
  
    } catch (err) {
      console.error("Error fetching branch:", err);
    }
  };
  

  useEffect(() => {
    console.log("Branch Name Updated:", branchName); // Log ชื่อสาขาที่อัปเดต
  }, [branchName]); // จะทำงานเมื่อ branchName ถูกอัปเดต

  const handleLogout = () => {
    // ลบข้อมูลจาก localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // นำผู้ใช้กลับไปที่หน้า login
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center p-4 bg-teal-600 text-white">
      <div className="flex items-center space-x-4">
        {/* User Info */}
        {userData && branchName && (
          <div className="flex items-center space-x-2">
            <span className="text-lg">{userData.name}</span>
            <span className="text-sm">{branchName}</span> {/* แสดงชื่อสาขา */}
          </div>
        )}
      </div>
      {/* Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-700 rounded-lg text-white"
        >
          <HiUser />
          <HiChevronDown className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 text-black">
            <div className="px-4 py-2 text-sm">{userData?.name}</div>
            <div className="px-4 py-2 text-sm">{userData?.email}</div>
            <div className="px-4 py-2 text-sm">{userData?.role}</div>
            <div className="px-4 py-2 text-sm">{branchName}</div> {/* แสดงชื่อสาขา */}
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
