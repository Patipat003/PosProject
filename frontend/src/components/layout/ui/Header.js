import React from "react";

const Header = ({ user }) => {
  return (
    <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
      {/* Title or Logo */}
      <div className="text-2xl">
        <a href="/" className="btn btn-ghost text-white">
          POS SYSTEM
        </a>
      </div>


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
