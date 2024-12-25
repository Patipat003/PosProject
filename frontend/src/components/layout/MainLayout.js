import React from "react";
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
      <Header user={user} />

      {/* Sidebar and Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <ul className="menu bg-base-200 rounded-box w-56">
          <li className="menu-item m-1">
            <Link to="/">Dashboard</Link>
          </li>

          {/* Sales Dropdown */}
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="menu-item bg-base-200 rounded-box m-5"
            >
              Sales Management
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
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

          <li className="menu-item">
            <Link to="/product">Product management</Link>
          </li>
          <li className="menu-item mt-4">
            <Link to="/reports">Reports</Link>
          </li>
          <li className="menu-item mt-4">
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
