import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";  // ใช้ชื่อของฟังก์ชันที่ส่งออกจาก jwt-decode

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

      // เก็บเฉพาะ Token ใน LocalStorage
      localStorage.setItem("authToken", token);

      // แยกข้อมูลจาก token เพื่อใช้ในการตรวจสอบสิทธิ์ในภายหลัง
      const decodedToken = jwtDecode(token);
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
