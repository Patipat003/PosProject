import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 
import ExportButtons from "../components/layout/ui/ExportButtons";
import { toZonedTime, format } from 'date-fns-tz';
import { AiOutlineExclamationCircle } from "react-icons/ai"; 
import { Player } from "@lottiefiles/react-lottie-player"; 
import { HiOutlineUser , HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const formatDate = (dateString) => {
  const date = toZonedTime(dateString, 'UTC');
  return format(date, "d/MM/yyyy, HH:mm");
};

const ReportsEmployeePage = () => {
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
    branchid: "",
  });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleToUpdate, setRoleToUpdate] = useState("");
  const [employeeid, setemployeeid] = useState("");
  const [sortKey, setSortKey] = useState("employeeid");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);  // New state for branch filter
  const [selectedRole, setSelectedRole] = useState("");      // New state for role filter
  const [sortByDate, setSortByDate] = useState(false);
  const [userBranchId, setUserBranchId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false); 
  const [newPassword, setNewPassword] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 10; 

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      const branchIdFromToken = decodedToken.branchid;
      const userRole = decodedToken.role;
  
      setUserBranchId(branchIdFromToken);
      setUserRole(userRole);
  
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
  
      const [employeeResponse, branchResponse, receiptsResponse] = await Promise.all([
        axios.get("http://localhost:5050/employees", config),
        axios.get("http://localhost:5050/branches", config),
        axios.get("http://localhost:5050/receipts", config),
      ]);
  
      const receiptsData = receiptsResponse.data.Data;
  
      // รวม `totalamount` ตาม `branch_id`
      const totalAmountByBranch = receiptsData.reduce((acc, receipt) => {
        acc[receipt.branchid] = (acc[receipt.branchid] || 0) + receipt.totalamount;
        return acc;
      }, {});
  
      let updatedEmployees = employeeResponse.data.Data.map((emp) => ({
        ...emp,
        totalamount: totalAmountByBranch[emp.branchid] || 0, // ถ้าไม่มีให้ใช้ 0
      }));
  
      // กรองเฉพาะพนักงานที่อยู่ในสาขาของผู้ใช้ ถ้าไม่ใช่ Super Admin
      if (userRole !== "Super Admin") {
        updatedEmployees = updatedEmployees.filter((emp) => emp.branchid === branchIdFromToken);
      }
  
      setEmployees(updatedEmployees);
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
  

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    console.log("Employees:", employees);
    console.log("Selected Branch:", selectedBranch);
  }, [employees, selectedBranch]);
  
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

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password || !newEmployee.role) {
      toast.error("All fields are required.");
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      const payload = {
        ...newEmployee,
        branchid: userRole === "Super Admin" ? newEmployee.branchid : userBranchId,
      };
  
      await axios.post("http://localhost:5050/employees", payload, config);
      setShowAddModal(false);
      fetchData();
      toast.success("Employee added successfully.");
    } catch (err) {
      console.error("Failed to add employee:", err);
      toast.error("Failed to add employee. Please try again.");
    }
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);  // Update the branch filter state
  };

  const handleRoleSort = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleRoleChange = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.patch(
        `http://localhost:5050/employees/${employeeid}`,
        { role: roleToUpdate },
        config
      );

      if (response.status === 200) {
        const updatedEmployees = employees.map((employee) =>
          employee.employeeid === employeeid ? { ...employee, role: roleToUpdate } : employee
        );
        setEmployees(updatedEmployees);
        setShowRoleModal(false);
      } else {
        console.error("Failed to update role:", response.data);
        alert("Failed to update role. Please check your permissions.");
      }
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update role. Please check your permissions.");
    }
  };

  const handleDeleteEmployee = async (employeeid) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const token = localStorage.getItem("authToken");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.delete(
          `http://localhost:5050/employees/${employeeid}`,
          config
        );
  
        if (response.status === 200) {
          setEmployees(employees.filter((employee) => employee.employeeid !== employeeid));
          toast.success("Employee deleted successfully.");
        } else {
          toast.error("Failed to delete employee.");
        }
      } catch (err) {
        console.error("Failed to delete employee:", err);
        toast.error("Failed to delete employee. Please try again.");
      }
    }
  };  

  const handlePasswordChange = async () => {
    if (!newPassword) {
      alert("Please enter a new password.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.patch(
        `http://localhost:5050/employees/${employeeid}`,
        { password: newPassword },
        config
      );

      if (response.status === 200) {
        alert("Password updated successfully.");
        setShowPasswordModal(false);
        fetchData();
      } else {
        console.error("Failed to update password:", response.data);
        alert("Failed to update password.");
      }
    } catch (err) {
      console.error("Failed to update password:", err);
      alert("Failed to update password.");
    }
  };

  const handleDateSortChange = () => {
    setSortByDate(!sortByDate);
  };

  const filteredEmployees = employees
  .filter((item) => {
    const branchName = getBranchName(item.branchid).toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = item.role.toLowerCase().includes(searchQuery.toLowerCase());
    const branchMatch = branchName.includes(searchQuery.toLowerCase());

    // Apply additional filters
    const branchFilterMatch = selectedBranch ? item.branchid === selectedBranch : true;
    const roleFilterMatch = selectedRole ? item.role === selectedRole : true;

    return (nameMatch || emailMatch || roleMatch || branchMatch) && branchFilterMatch && roleFilterMatch;
  })
  .sort((a, b) => {
    if (sortByDate) {
      const dateA = new Date(a.createdat);  // Parse createdat as Date
      const dateB = new Date(b.createdat);
  
      // Compare based on the selected sort direction (ascending or descending)
      return sortDirection === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
      return (
        <div className="flex items-center justify-center h-42 flex-col">
          <Player
            autoplay
            loop
            src="https://assets3.lottiefiles.com/packages/lf20_z4cshyhf.json"
            style={{ height: "200px", width: "200px" }}
          />
          <span className="text-teal-500 text-lg font-semibold">Loading...</span>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="flex items-center justify-center h-42 flex-col">
          <AiOutlineExclamationCircle className="text-red-500 text-6xl mb-4" />
          <p className="text-red-500 text-xl">{error}</p>
        </div>
      );
    }

  return (
    <div className="p-4 bg-white">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Employee Report</h1>
      <div className="flex justify-between mb-4">
        <ExportButtons
          filteredTables={filteredEmployees.map(employee => ({
            email: employee.email,
            name: employee.name,
            role: employee.role,
            branch: getBranchName(employee.branchid),
          }))}
          columns={["email", "name", "role", "branch"]} // Define the column headers accordingly
          filename="employees_report.pdf" // Filename for export
        />
      </div>

      <div className="mb-4 space-x-6 flex">
        <div className="flex items-center space-x-4 w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by Name or Email"
            className="text-gray-600 border bg-white border-gray-300 px-6 w-full py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          )}
        </div>
      

        <select
          value={selectedRole}
          onChange={handleRoleSort}
          className="select bg-white text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Roles</option>
          <option value="Manager">Manager</option>
          <option value="Cashier">Cashier</option>
          <option value="Audit">Audit</option>
        </select>

        <button onClick={handleDateSortChange} className="btn border-none text-white bg-teal-500 px-4 py-2 rounded hover:bg-teal-600">
          Sort by Date
        </button>
      </div>

      <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="border text-sm">#</th>
            <th className="border text-sm px-4 py-2">Name</th>
            <th className="border text-sm px-4 py-2">Role</th>
            <th className="border text-sm px-4 py-2">Branch</th>
            <th className="border text-sm px-4 py-2">Total Amount</th>
          </tr>
        </thead>
        <tbody>
        {currentEmployees.map((employee, index) => {
           const rowIndex = (currentPage - 1) * itemsPerPage + index + 1; // Calculate row index
           return (
          <tr
            key={employee.employeeid} className="hover:bg-gray-100">
            <td className="border border-gray-300 text-center">{rowIndex}</td>

            <td className="border border-gray-300 px-4 py-2">{employee.name}</td>
            <td className="border border-gray-300 px-4 py-2">{employee.role}</td>
            <td className="border border-gray-300 px-4 py-2">{getBranchName(employee.branchid)}</td>
            <td className="border border-gray-300 px-4 py-2">{employee.totalamount.toLocaleString()}</td>
          </tr>
          );
        })}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
        >
          Previous
        </button>
        <div className="flex items-center">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
        >
          Next
        </button>
      </div>
    
      
    </div>
  );
};

export default ReportsEmployeePage;
