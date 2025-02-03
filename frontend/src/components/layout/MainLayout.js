import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiChevronDown,
  HiHome,
  HiShoppingCart,
  HiDocumentText,
  HiUser,
  HiArrowLeft,
  HiCube,
} from "react-icons/hi";
import { HiMiniSquare3Stack3D, HiMiniUserGroup  } from "react-icons/hi2";
import { jwtDecode } from "jwt-decode"; // Import the jwt-decode library
import Header from "./ui/Header";

// SidebarDropdown Component
const SidebarDropdown = ({ label, children, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isActive = children.some((child) => child.link === location.pathname);
    setIsOpen(isActive);
  }, [location.pathname, children]);

  return (
    <li className="my-2">
      <div
        className="flex justify-between items-center w-full p-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white cursor-pointer text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span>{label}</span>
        </div>
        <HiChevronDown
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } text-lg`}
        />
      </div>
      <div
        className={`transition-all duration-200 overflow-hidden ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="bg-teal-600 rounded-lg p-2 list-none ml-4">
          {children.map((child, index) => (
            <li key={index}>
              <Link
                to={child.link}
                className={`block w-full p-3 hover:bg-teal-700 text-white rounded-lg text-sm ${
                  location.pathname === child.link ? "bg-teal-700" : ""
                }`}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

// SidebarItem Component
const SidebarItem = ({ label, link, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === link;

  return (
    <li className="my-2">
      <Link
        to={link}
        className={`block w-full p-3 rounded-lg text-sm ${
          isActive ? "bg-teal-700" : "bg-teal-600"
        } hover:bg-teal-700 text-white`}
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span>{label}</span>
        </div>
      </Link>
    </li>
  );
};

// MainLayout Component
const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
      const token = localStorage.getItem("authToken"); // Retrieve the token from local storage
      if (token) {
        const decoded = jwtDecode(token); // Decode the JWT token
        setUserRole(decoded.role); // Set the user role from the decoded token
      }
    }, []);
  
  // Check if the user has access based on their role
  const isCashier = userRole === "Cashier"; // Only Cashier can access Sales pages
  const isManager = userRole === "Manager"; // Manager can access everything
  
  // Check if the user is on the /sales page
  const isSalesProductPage = location.pathname === "/sales";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Header />
        {/* Show the back button only on /sales */}
        {isSalesProductPage && (
          <div className="bg-white shadow-sm p-4 border-t">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-teal-600 font-semibold"
            >
              <HiArrowLeft className="text-lg" />
              <span>Back</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 pt-6">
        {/* Sidebar */}
        {!isSalesProductPage && (
        <aside className="w-64 bg-teal-600 shadow-md h-full fixed top-16 left-0 overflow-y-auto">
          <nav className="p-5 list-none">
            <SidebarItem label="Dashboard" link="/" icon={<HiHome />} />
            {(isManager || isCashier) && (
              <SidebarDropdown label="Sales Management" icon={<HiShoppingCart />}>
                {[
                  { label: "Sales Product", link: "/sales" },
                  { label: "Sales History", link: "/salesHistory" },
                  // { label: "Payment", link: "/payment" },
                  //{ label: "Receipts", link: "/receipts" },
                ]}
              </SidebarDropdown>
            )}
            {(isManager || isCashier) && (
              <SidebarItem
                label="Product Management"
                link="/product"
                icon={<HiCube />}
              />
            )}
            {(isManager || isCashier) && (
              <SidebarItem
                label="Inventory Magagement"
                link="/inventory"
                icon={<HiMiniSquare3Stack3D />}
              />
            )}
            {(isManager)&& ( 
              <SidebarDropdown label="Reports" icon={<HiDocumentText />}>
                {[
                  { label: "Sales Reports", link: "/reports" },
                  { label: "Detail Report", link: "/detailReport" },              
                ]}
              </SidebarDropdown>
            )}
            {(isManager)&& (
              <SidebarDropdown label="User Management" icon={<HiMiniUserGroup />}>
                {[
                  { label: "User", link: "/userManagement", icon: (<HiUser />)},
                  { label: "Employee Transfer", link: "/employeeTransfer" },
                ]}
              </SidebarDropdown>
            )}  
          </nav>
        </aside>
        )}
      </div>

      {/* Main Content */}
      <main className={`flex-1 p-6 bg-white ${isSalesProductPage ? "pt-28" : "ml-64 pt-16"}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
