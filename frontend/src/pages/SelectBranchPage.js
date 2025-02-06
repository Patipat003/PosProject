import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SelectBranchPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Fetch branch data from API
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Session expired. Please log in again.", { position: "top-right" });
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:5050/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data.Data)) {
        setBranches(response.data.Data);
      } else {
        console.error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleBranchSelect = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleBranchConfirmation = async () => {
    if (!selectedBranch) {
      toast.error("Please select a branch first.", { position: "top-right" });
      return;
    }

    if (!password) {
      toast.error("Please enter your password.", { position: "top-right" });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Session expired. Please log in again.", { position: "top-right" });
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      const loginData = {
        email: decodedToken.email,
        password: password,
        branchid: selectedBranch,
      };

      // Send request to API for a new token with branch ID
      const response = await axios.post("http://localhost:5050/login", loginData);

      if (response.data && response.data.token) {
        // Save new token to localStorage
        localStorage.setItem("authToken", response.data.token);

        toast.success("Branch updated successfully!", { position: "top-right" });

        // Navigate to Dashboard
        navigate("/");
      } else {
        toast.error("Failed to update branch. Please check your password.", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error updating branch:", error);
      toast.error("Incorrect password. Please try again.", { position: "top-right" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg">
        <h3 className="text-lg text-gray-600 font-semibold mb-6">
          Please select a branch and confirm your password
        </h3>

        <select
          onChange={handleBranchSelect}
          className="w-full bg-white text-gray-600 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="">Select Branch</option>
          {branches.length > 0 ? (
            branches.map((branch) => (
              <option key={branch.branchid} value={branch.branchid}>
                {branch.bname}
              </option>
            ))
          ) : (
            <option disabled>No branch data available</option>
          )}
        </select>

        {/* Password input */}
        <input
          type="password"
          placeholder="Confirm password"
          value={password}
          onChange={handlePasswordChange}
          className="w-full bg-white text-gray-600 px-3 py-2 mt-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
        />

        <div className="mt-4">
          <button
            onClick={handleBranchConfirmation}
            className="btn border-none w-full py-2 px-4 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectBranchPage;
