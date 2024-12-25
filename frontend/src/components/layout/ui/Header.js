import React from "react";

const Header = ({ user, toggleSidebar }) => {
  return (
    <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
      {/* Title or Logo */}
      <div className="text-2xl">
        <a href="/" className="btn btn-ghost text-white">
          POS SYSTEM
        </a>
      </div>

      {/* Hamburger Icon (for mobile) */}
      <button onClick={toggleSidebar} className="lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* User Info */}
      <div className="flex items-center">
        <div className="flex flex-col text-right mr-4">
          <span className="font-medium">{user.name}</span>
          <span className="text-sm text-gray-400">({user.role})</span>
        </div>

        {/* Profile Picture */}
        <div className="avatar">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img src={user.profilePicture} alt="User" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
