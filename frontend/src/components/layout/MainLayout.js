import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiChevronDown,
  HiHome,
  HiShoppingCart,
  HiDocumentText,
  HiUser,
  HiOfficeBuilding,
  HiCube,
  HiMenu,
  HiX,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

  useEffect(() => {
      const token = localStorage.getItem("authToken"); // Retrieve the token from local storage
      if (token) {
        const decoded = jwtDecode(token); // Decode the JWT token
        setUserRole(decoded.role); // Set the user role from the decoded token
      }
  }, []);
  
  // Check if the user has access based on their role
  const isSuperAdmin = userRole === "Super Admin"; // Super Admin can access everything
  const isCashier = userRole === "Cashier"; // Only Cashier can access Sales pages
  const isManager = userRole === "Manager"; // Manager can access everything
  const isAudit = userRole === "Audit"; // Audit can access only views

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Burger Icon */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed ml-4 z-20 text-white bg-teal-600 py-4"
      >
        {isSidebarOpen ? <HiX size={32} /> : <HiMenu size={32} />}
      </button>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Header />
        {/* Show the back button only on /sales */}
        
      </div>

      <div className="flex flex-1 pt-6">
        {/* Sidebar */}
        <aside
          className={`fixed top-16 left-0 w-64 bg-teal-600 shadow-md h-full overflow-y-auto transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="p-5 list-none">
            <SidebarItem label="Dashboard" link="/" icon={<HiHome />} />
            {(isSuperAdmin || isManager || isCashier || isAudit) && (
              <SidebarDropdown label="Sales Management" icon={<HiShoppingCart />}>
                {[
                  !isAudit && { label: "Sales Product", link: "/sales" },
                  { label: "Sales History", link: "/salesHistory" },
                  
                  // { label: "Payment", link: "/payment" },
                  // { label: "Receipts", link: "/receipts" },
                ].filter(Boolean)}
              </SidebarDropdown>
            )}
            {(isSuperAdmin || isManager || isCashier || isAudit) && (
              <SidebarItem label="Product Management" link="/product" icon={<HiCube />} />
            )}
            {(isSuperAdmin || isManager || isCashier || isAudit) && (
              <SidebarItem label="Inventory Management" link="/inventory" icon={<HiMiniSquare3Stack3D />} />
            )}
            {(isSuperAdmin || isManager || isAudit) && (
              <SidebarDropdown label="Reports" icon={<HiDocumentText />}>
                {[
                  { label: "Sales Reports", link: "/reports" },
                  { label: "Detail Report", link: "/detailReport" },
                  { label: "Employee Report", link: "/employeeReports" },              
                ]}
              </SidebarDropdown>
            )}
            {(isSuperAdmin || isManager) && (
              <SidebarDropdown label="User Management" icon={<HiMiniUserGroup />}>
                {[
                  { label: "User Lists", link: "/userManagement", icon: (<HiUser />)},
                  { label: "Employee Transfer", link: "/employeeTransfer" },
                ]}
              </SidebarDropdown>
            )}
            {( isSuperAdmin ) && (
              <SidebarItem label="Branches Management" link="/branchesManagement" icon={<HiOfficeBuilding />} />
            )}
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <main
        onClick={() => isSidebarOpen && setIsSidebarOpen(false)} 
        className={`flex-1 p-6 bg-white transition-all duration-300 ${
         isSidebarOpen ? "ml-64 pt-16" : "ml-0 pt-16"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
