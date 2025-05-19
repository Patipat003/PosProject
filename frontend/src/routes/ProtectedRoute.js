import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ใช้เพื่อ decode token

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    // Decode token เพื่อดึงข้อมูล role ของผู้ใช้
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role; // สมมุติว่าใน token จะมี role

    // ถ้า role ไม่ตรงกับที่อนุญาต หรือไม่มีการกำหนดให้อนุญาต
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" />;
    }
  } catch (error) {
    // หากเกิดข้อผิดพลาดในการ decode token
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
