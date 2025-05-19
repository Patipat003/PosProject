import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email, password },
      {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      }
    );
      const token = response.data.token;

      // เก็บเฉพาะ Token ใน LocalStorage
      localStorage.setItem("authToken", token);

      // แยกข้อมูลจาก token เพื่อใช้ในการตรวจสอบสิทธิ์ในภายหลัง
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);

      // ถ้าเป็น Super Admin และ branchid เป็น null ให้ไปที่หน้า Dashboard
      if (decodedToken.role === "Super Admin" && !decodedToken.branchid) {
        navigate("/select-branch");  // เปลี่ยนไปหน้า select-branch
      } else {
        navigate("/");  // ไปที่หน้า Dashboard
      }
    } catch (err) {
      setError("Login failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-20 px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-10 rounded-lg shadow-lg">
          <div className="text-center text-white">
            <img
              alt="x10"
              src="/image/x10logo.png"
              className="mx-auto h-24 w-auto"
            />
            <h2 className="mt-6 text-xl font-semibold text-gray-500">
              Sign in to your account
            </h2>
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-3 py-2 bg-white text-base text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 bg-white text-base text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn w-full border-red-600 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
