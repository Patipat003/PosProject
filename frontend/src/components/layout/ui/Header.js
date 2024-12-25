import React from "react";

const Header = ({ user }) => {
  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* ข้อความ title หรือ logo */}
      <div className="text-lg font-bold">POS System</div>

      {/* ข้อมูลผู้ใช้ */}
      <div className="flex items-center">
        {/* รูปโปรไฟล์ */}
        <img
          src={user.profilePicture}
          alt="User"
          className="w-10 h-10 rounded-full mr-2"
        />
        {/* ชื่อผู้ใช้และตำแหน่ง */}
        <div className="flex flex-col text-right">
          <span>{user.name}</span>
          <span className="text-sm text-gray-400">({user.role})</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
