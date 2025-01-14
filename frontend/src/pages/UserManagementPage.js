import React, { useState, useEffect } from "react";
import axios from "axios";
import ExportButtons from "../components/layout/ui/ExportButtons";
import SortByDropdown from "../components/layout/ui/SortByDropdown";
import { format } from "date-fns";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "d/MM/yyyy, HH:mm");
};

const UserManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    email: "",
    password: "",
    name: "",
    role: "",
    branched: "",
  });
  const [sortKey, setSortKey] = useState("employeeid");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
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
      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.branchid === branchId);
    return branch ? branch.bname : "Unknown Branch";
  };

  const handleSortChange = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
    const sortedData = [...employees].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      return direction === "asc" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
    });
    setEmployees(sortedData);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddEmployee = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post("http://localhost:5050/employees", newEmployee, config);
      setShowAddModal(false);
      setNewEmployee({ email: "", password: "", name: "", role: "", branched: "" });
      fetchData();
    } catch (err) {
      console.error("Failed to add employee:", err);
    }
  };

  const filteredEmployees = employees.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">User Management</h1>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
        >
          + Add Employee
        </button>
        <ExportButtons
          filteredTables={filteredEmployees}
          columns={["employeeid", "email", "name", "role", "branched", "createdat"]}
          filename="employees.pdf"
        />
      </div>

      <div className="mb-4 space-x-6 flex">
        <div className="flex items-center space-x-4 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name"
            className="border p-2 rounded w-full"
          />
          <SortByDropdown
            onSortChange={handleSortChange}
            currentSortKey={sortKey}
            currentSortDirection={sortDirection}
            sortOptions={[
              { key: "employeeid", label: "Employee ID" },
              { key: "name", label: "Name" },
            ]}
          />
        </div>
      </div>

      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-teal-600 text-white">
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Branch</th>
            <th className="border border-gray-300 px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee, index) => (
            <tr
              key={employee.employeeid}
              className={
                index % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100"
              }
            >
              <td className="border border-gray-300 px-4 py-2 text-center">{employee.email}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{employee.name}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{employee.role}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{getBranchName(employee.branchid)}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{formatDate(employee.createdat)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-md shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">Add Employee</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="Name"
                className="border p-2 mb-2 w-full"
              />
              <input
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                placeholder="Email"
                className="border p-2 mb-2 w-full"
              />
              <input
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                placeholder="Password"
                className="border p-2 mb-2 w-full"
              />
              <select
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                className="border p-2 mb-2 w-full"
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Audit">Audit</option>
              </select>
              <select
                value={newEmployee.branched}
                onChange={(e) => setNewEmployee({ ...newEmployee, branched: e.target.value })}
                className="border p-2 mb-2 w-full"
              >
                <option value="" disabled>
                  Select Branch
                </option>
                {branches.map((branch) => (
                  <option key={branch.branchid} value={branch.branchid}>
                    {branch.bname}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddEmployee}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full"
              >
                Submit
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full mt-2"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
