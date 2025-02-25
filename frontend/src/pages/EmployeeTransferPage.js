import React, { useState, useEffect } from "react"; 
import axios from "axios"; 
import { jwtDecode } from "jwt-decode";
import { FaCalendarAlt } from "react-icons/fa";

const EmployeeTransferPage = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    currentBranch: "",
    newBranch: "",
    date: "",
    time: "",
  });
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const getUserDetailsFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = jwtDecode(token);
      return { branchid: decoded.branchid, role: decoded.role };
    }
    return { branchid: null, role: "" };
  };

  const fetchEmployeesAndBranches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } };
      const [employeeResponse, branchResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/employees`, config),
        axios.get(`${API_BASE_URL}/branches`, config),
      ]);
      setEmployees(employeeResponse.data.Data);
      setBranches(branchResponse.data.Data);
    } catch (err) {
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    fetchEmployeesAndBranches();
    const { branchid, role } = getUserDetailsFromToken();
    setUserRole(role);
    setFormData((prev) => ({
      ...prev,
      currentBranch: role === "Super Admin" ? "" : branchid,
    }));
  }, []);

  // ฟังก์ชันกรองพนักงานที่ตรงกับสาขา
  const filterEmployeesByBranch = (branchid) => {
    return employees.filter((employee) => employee.branchid === branchid);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, currentBranch: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.newBranch || !formData.date || !formData.time) {
      alert("All fields are required.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } };
      const payload = { branchid: formData.newBranch, transferDate: formData.date, transferTime: formData.time };

      const response = await axios.patch(
        `${API_BASE_URL}/employees/${formData.id}`,
        payload,
        config
      );

      if (response.status === 200) {
        setEmployees((prevEmployees) =>
          prevEmployees.map((employee) =>
            employee.employeeid === formData.id
              ? { ...employee, branchid: formData.newBranch }
              : employee
          )
        );
        setFormData({ id: "", currentBranch: userRole === "Super Admin" ? "" : formData.currentBranch, newBranch: "", date: "", time: "" });
        alert("Employee transfer completed successfully.");
      } else {
        alert("Transfer failed. Please try again.");
      }
    } catch (err) {
      alert("Failed to transfer employee.");
    }
  };

  const getBranchName = (branchid) => {
    const branch = branches.find((branch) => branch.branchid === branchid);
    return branch ? branch.bname : "Unknown Branch";
  };

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Employee Branch Transfer</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userRole === "Super Admin" && (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Select Branch</label>
              <select
                name="currentBranch"
                value={formData.currentBranch}
                onChange={handleBranchChange}
                className="select bg-white text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.branchid} value={branch.branchid}>
                    {branch.bname}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Select Employee</label>
            <select
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className="select bg-white text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Employee</option>
              {formData.currentBranch && 
                filterEmployeesByBranch(formData.currentBranch).map((employee) => (
                  <option key={employee.employeeid} value={employee.employeeid}>
                    {employee.name}
                  </option>
                ))
              }
            </select>
          </div>

          {userRole !== "Super Admin" && (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Current Branch</label>
              <input
                type="text"
                value={getBranchName(formData.currentBranch)}
                readOnly
                className="select bg-white text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">New Branch</label>
            <select
              name="newBranch"
              value={formData.newBranch}
              onChange={handleInputChange}
              className="select bg-white text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="px-4 py-2 text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Transfer Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="px-4 py-2 text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button type="submit" className="btn border-none bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 col-span-2">
            Submit Transfer
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-600 mb-4">Employees List</h2>
        <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="border text-sm px-4 py-2">Employee Name</th>
              <th className="border text-sm px-4 py-2">Current Branch</th>
            </tr>
          </thead>
          <tbody>
            {filterEmployeesByBranch(formData.currentBranch).map((employee) => (
              <tr key={employee.employeeid} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{employee.name}</td>
                <td className="border border-gray-300 px-4 py-2">{getBranchName(employee.branchid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTransferPage;
