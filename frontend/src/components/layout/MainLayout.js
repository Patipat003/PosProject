import React from "react";
import { Link } from "react-router-dom"; // ใช้ Link สำหรับการนำทาง
import Header from "./ui/Header";

const MainLayout = ({ children }) => {
  const user = {
    name: "John Doe",
    role: "administrator",
    profilePicture: "https://via.placeholder.com/150",
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* แสดง Header */}
      <Header user={user} />

      {/* Sidebar และ Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-4">
          <ul>
            <li className="p-4 hover:bg-gray-700">
              <Link to="/">Dashboard</Link>
            </li>

            {/* Sales product with Dropdown */}
            <li className="relative group">
              <div className="p-4 hover:bg-gray-700 cursor-pointer">
                <span>Sales product</span>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute left-0 w-48 bg-gray-700 text-white mt-2 rounded-md opacity-0 group-hover:opacity-100 group-hover:block transition-opacity">
                <ul>
                  <li className="px-4 py-2 hover:bg-gray-600">
                    <Link to="/sales">Sell Products</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-600">
                    <Link to="/product-list">Product List</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-600">
                    <Link to="/category">Category</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-600">
                    <Link to="/sales-history">Sales History</Link>
                  </li>
                </ul>
              </div>
            </li>

            <li className="p-4 hover:bg-gray-700">
              <Link to="/inventory">Inventory management</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link to="/reports">Reports</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link to="/userManagement">User management</Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-100 p-6">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
