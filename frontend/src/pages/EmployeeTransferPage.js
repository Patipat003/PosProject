import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // นำเข้า jwt-decode เพื่อนำข้อมูลจาก token

const EmployeeTransferPage = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    currentBranch: "",
    newBranch: "",
    date: "",
    time: "",
  });
  const [error, setError] = useState(null);

  // Decode token เพื่อนำข้อมูลสาขาของผู้ใช้
  const getCurrentBranchFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.branchid;  // สมมติว่าใน token มีข้อมูล branchid
    }
    return null;
  };

  const fetchEmployeesAndBranches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const [employeeResponse, branchResponse] = await Promise.all([
        axios.get("http://localhost:5050/employees", config),
        axios.get("http://localhost:5050/branches", config),
      ]);
      setEmployees(employeeResponse.data.Data);
      setBranches(branchResponse.data.Data);
    } catch (err) {
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    fetchEmployeesAndBranches();
  }, []);

  useEffect(() => {
    const branchid = getCurrentBranchFromToken();
    setFormData((prevData) => ({
      ...prevData,
      currentBranch: branchid,
    }));
  }, []);

  // ฟังก์ชันการกรองพนักงานจากสาขาของผู้ใช้
  const filterEmployeesByBranch = (branchid) => {
    return employees.filter((employee) => employee.branchid === branchid);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id || !formData.newBranch || !formData.date || !formData.time) {
      alert("All fields are required.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        branchid: formData.newBranch,
        transferDate: formData.date,
        transferTime: formData.time,
      };

      const response = await axios.patch(
        `http://localhost:5050/employees/${formData.id}`,
        payload,
        config
      );

      if (response.status === 200) {
        // Update employee list to reflect the new branch assignment
        const updatedEmployees = employees.map((employee) =>
          employee.employeeid === formData.id
            ? { ...employee, branchid: formData.newBranch }
            : employee
        );

        setEmployees(updatedEmployees);
        setFormData({
          id: "",
          currentBranch: "",
          newBranch: "",
          date: "",
          time: "",
        });

        alert("Employee transfer completed successfully.");
      } else {
        alert("Transfer failed. Please check the data and try again.");
      }
    } catch (err) {
      console.error("Error during transfer:", err);
      alert("Failed to transfer employee. Please check your data and try again.");
    }
  };

  // Function to get branch name by branchid
  const getBranchName = (branchid) => {
    const branch = branches.find((branch) => branch.branchid === branchid);
    return branch ? branch.bname : "Unknown Branch";
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-4xl font-bold text-teal-600 mb-6">Employee Branch Transfer</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Transfer Details</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Select Employee</label>
            <select
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Employee</option>
              {filterEmployeesByBranch(formData.currentBranch).map((employee) => (
                <option key={employee.employeeid} value={employee.employeeid}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Current Branch</label>
            <input
              type="text"
              value={getBranchName(formData.currentBranch)}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">New Branch</label>
            <select
              name="newBranch"
              value={formData.newBranch}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select New Branch</option>
              {branches.map((branch) => (
                <option key={branch.branchid} value={branch.branchid}>
                  {branch.bname}
                </option>
              ))}
            </select>
          </div>

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

          <button
            type="submit"
            className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 col-span-2"
          >
            Submit Transfer
          </button>
        </form>
      </div>



      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Employees in Your Branch</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-gray-700">Employee Name</th>
              <th className="px-6 py-3 text-left text-gray-700">Current Branch</th>
            </tr>
          </thead>
          <tbody>
            {filterEmployeesByBranch(formData.currentBranch).map((employee) => (
              <tr key={employee.employeeid}>
                <td className="px-6 py-3 border-b">{employee.name}</td>
                <td className="px-6 py-3 border-b">{getBranchName(employee.branchid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTransferPage;
