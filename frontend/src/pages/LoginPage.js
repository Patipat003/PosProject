import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";  // นำเข้า jwtDecode

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("http://localhost:5050/login", {
        email,
        password,
      });
      const token = response.data.token;
  
      // เก็บ Token และข้อมูลผู้ใช้ใน LocalStorage
      localStorage.setItem("authToken", token);
  
      // แยกข้อมูลจาก token (เช่น ชื่อ, role, email, employeeId)
      const decodedToken = jwtDecode(token); // ใช้ jwtDecode
      localStorage.setItem("userData", JSON.stringify({
        email: decodedToken.email,
        name: decodedToken.name,
        role: decodedToken.role,
        branchid: decodedToken.branchid,
        employeeId: decodedToken.employeeId,
      }));
      console.log(decodedToken);
  
      // ใช้ navigate เพื่อ redirect ไปหน้า Dashboard
      navigate("/");  // เปลี่ยนจาก window.location.href
    } catch (err) {
      setError("Login failed: " + (err.response?.data?.error || err.message));
    }
  };
  
  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
