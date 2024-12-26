import React, { useState } from "react";
import { Link } from "react-router-dom"; // ใช้ Link สำหรับการนำทาง
import Header from "./ui/Header";

const MainLayout = ({ children }) => {
 

  const user = {
    name: "John Doe",
    role: "administrator",
    profilePicture: "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg",
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      

      {/* Sidebar and Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <ul className="menu bg-base-200 w-56">


          <li>
          <h1 className="my-5 text-2xl font-bold text-center">
            POS SYSTEM
          </h1>

          </li>
          <li className="menu-item m-1">
            <Link to="/">Dashboard</Link>
          </li>

          {/* Sales Dropdown */}
          <div className="dropdown dropdown-right">
            <div
              tabIndex={0}
              role="button"
              className="menu-item bg-base-200 rounded-box m-5"
            >
              Sales Management
            </div>
          
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-200 z-[1] w-52 p-2 shadow mt-4"
              >
                <li>
                  <Link to="/sales">Sales Product</Link>
                </li>
                <li>
                  <Link to="/salesHistory">Sales History</Link>
                </li>
                <li>
                  <Link to="/#">3</Link>
                </li>
              </ul>

          </div>

          <li className="menu-item m-1">
            <Link to="/product">Product management</Link>
          </li>
          <li className="menu-item m-1 mt-4">
            <Link to="/reports">Reports</Link>
          </li>
          <li className="menu-item m-1 mt-4">
            <Link to="/userManagement">User management</Link>
          </li>

          
        </ul>
        

        {/* Main Content */}
        <div className="flex-1 bg-gray-100 p-6">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
