import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa"; // Pencil icon for edit

const EmployeeTransferPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    currentBranch: "",
    newBranch: "",
    date: "",
    time: "",
  });
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const employeeResponse = await axios.get("http://localhost:5050/employees", config);
      const branchResponse = await axios.get("http://localhost:5050/branches", config);
      setEmployees(employeeResponse.data.Data);
      setBranches(branchResponse.data.Data);
    } catch (err) {
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post("http://localhost:5050/employee-transfer", formData, config);
      setTransfers([...transfers, formData]); // Update the local transfers state
      setFormData({
        id: "",
        name: "",
        currentBranch: "",
        newBranch: "",
        date: "",
        time: "",
      });
    } catch (err) {
      console.error("Failed to submit transfer", err);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-teal-600 mb-6">Employee Branch Transfer</h1>
      <p className="text-gray-600 mb-4">Manage employee transfers between branches.</p>

      {/* Transfer Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Transfer Details</h2>
        <form onSubmit={handleSubmit}>
          {/* Employee Selector */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Select Employee</label>
            <select
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Employee</option>
              {Array.isArray(employees) &&
                employees.map((employee) => (
                  <option key={employee.employeeid} value={employee.employeeid}>
                    {employee.name} - {employee.role} - {employee.branchid}
                  </option>
                ))}
            </select>
          </div>

          {/* Current Branch */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Current Branch</label>
            <select
              name="currentBranch"
              value={formData.currentBranch}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Current Branch</option>
              {branches.map((branch, index) => (
                <option key={index} value={branch.bname}>
                  {branch.bname}
                </option>
              ))}
            </select>
          </div>

          {/* New Branch */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">New Branch</label>
            <select
              name="newBranch"
              value={formData.newBranch}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select New Branch</option>
              {branches.map((branch, index) => (
                <option key={index} value={branch.bname}>
                  {branch.bname}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Transfer Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Transfer Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600"
          >
            Submit Transfer
          </button>
        </form>
      </div>

      {/* Transfer Records */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Transfer Records</h2>
        {transfers.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Current Branch</th>
                <th className="border border-gray-300 px-4 py-2">New Branch</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Time</th>
                <th className="border border-gray-300 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100"
                  }
                >
                  <td className="border border-gray-300 px-4 py-2">{transfer.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.currentBranch}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.newBranch}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.time}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <FaPencilAlt className="text-teal-500 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No transfer records found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeTransferPage;
