import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiChevronDown, HiHome, HiShoppingCart, HiDocumentText, HiUser } from "react-icons/hi"; // ไอคอนจาก react-icons

const SidebarDropdown = ({ label, children, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isActive = children.some(child => child.link === location.pathname);
    setIsOpen(isActive); 
  }, [location.pathname, children]);

  return (
    <li className="my-2">
      <div
        className="flex justify-between items-center w-full p-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white cursor-pointer text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* เพิ่มไอคอนข้างหน้า */}
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span>{label}</span>
        </div>
        <HiChevronDown
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} text-lg`}
        />
      </div>

      <div
        className={`transition-all duration-200 overflow-hidden ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <ul className="bg-teal-600 rounded-lg p-2 list-none ml-4">
          {children.map((child, index) => (
            <li key={index}>
              <Link
                to={child.link}
                className="block w-full p-3 hover:bg-teal-700 text-white rounded-lg text-sm"
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

const SidebarItem = ({ label, link, icon }) => {
  const location = useLocation();

  const isActive = location.pathname === link;

  return (
    <li className="my-2">
      <Link
        to={link}
        className={`block w-full p-3 rounded-lg text-sm ${isActive ? "bg-teal-700" : "bg-teal-600"} hover:bg-teal-700 text-white`}
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span>{label}</span>
        </div>
      </Link>
    </li>
  );
};

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-teal-600 shadow-md fixed top-0 left-0 h-full">
          <div className="py-6 text-center px-6">
            <h1 className="text-2xl font-bold text-white">
              <Link to="/">POS SYSTEM</Link>
            </h1>
          </div>
          {/* เพิ่มการเลื่อนเฉพาะในเมนู */}
          <nav className="p-5 list-none overflow-y-auto h-full">
            <SidebarItem label="Dashboard" link="/" icon={<HiHome />} />
            <SidebarDropdown label="Sales Management" icon={<HiShoppingCart />}>
              {[ 
                { label: "Sales Product", link: "/sales" },
                { label: "Sales History", link: "/salesHistory" },
                { label: "Payment", link: "/payment" },
              ]}
            </SidebarDropdown>
            <SidebarItem label="Product Management" link="/product" icon={<HiDocumentText />} />
            <SidebarItem label="Inventory" link="/inventory" icon={<HiDocumentText />} />
            <SidebarDropdown label="Reports" icon={<HiDocumentText />}>
              {[ 
                { label: "New Item", link: "/reports" },
                { label: "Detail Report", link: "/detailReport" },
                { label: "Customer Rank", link: "/customerRank" },
                { label: "Cash Flow", link: "/cashFlow" },
              ]}
            </SidebarDropdown>
            <SidebarDropdown label="User Management" icon={<HiUser />}>
              {[ 
                { label: "User", link: "/userManagement" },
                { label: "Access Rights", link: "/accessRights" },
                { label: "Employee Transfer", link: "/employeeTransfer" },
              ]}
            </SidebarDropdown>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-white ml-64">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
