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
        <ul className="menu bg-bla-200 w-56">


          <li>
          <h1 className="my-5 text-2xl font-bold text-center">
            POS SYSTEM
          </h1>

          </li>
          <li className="menu-item m-1">
            <Link to="/">Dashboard</Link>
          </li>
          <li className="dropdown dropdown-right m-1">
            <Link to="/sellProduct">Sell product</Link>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                <li>
                  <Link to="/productList">Product List</Link>
                </li>
            </ul>
          </li>
          {/* Sales Dropdown */}
          <div className="dropdown dropdown-right">
            <div
              tabIndex={0}
              role="button"
              className="menu-item rounded-box m-5"
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
                  <Link to="/payment">Payment</Link>
                </li>
              </ul>

          </div>

          <li className="menu-item m-1">
            <Link to="/product">Product management</Link>
          </li>
          <li className="menu-item m-1">
            <Link to="/inventory">Inventory</Link>
          </li>
          <li className="dropdown dropdown-right m-1">
            <Link to="/reports">Reports</Link>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li>
                  <Link to="/detailReport">Datail Report</Link>
                </li>
                <li>
                  <Link to="/customerRank">Customer Rank</Link>
                </li>
                <li>
                  <Link to="/cashFlow">Cash Flow</Link>
                </li>
            </ul>
          </li>
          <li className="dropdown dropdown-right m-1">
          <Link to="/userManagement">User management</Link>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li>
                  <Link to="/accessRights">Access Rights</Link>
                </li>
                <li>
                  <Link to="/employeeTransfer">Employee Transfer</Link>
                </li>
            </ul>
          </li>

          
        </ul>
        

        {/* Main Content */}
        <div className="flex-1 bg-gray-100 p-6">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
