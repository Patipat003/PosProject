import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";  // Import framer-motion
import ExportButtons from "../components/layout/ui/ExportButtons";
import { format } from "date-fns";
import { FaPencilAlt, FaUser } from "react-icons/fa"; 

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
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleToUpdate, setRoleToUpdate] = useState("");
  const [employeeid, setemployeeid] = useState("");
  const [sortKey, setSortKey] = useState("employeeid");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");  // New state for branch filter
  const [selectedRole, setSelectedRole] = useState("");      // New state for role filter
  const [sortByDate, setSortByDate] = useState(false);
  const [userBranchId, setUserBranchId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false); 
  const [newPassword, setNewPassword] = useState(""); 

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      const branchIdFromToken = decodedToken.branchid;
      const userRole = decodedToken.role;
  
      setUserBranchId(branchIdFromToken);
      setUserRole(userRole);
    
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      const employeeResponse = await axios.get("http://localhost:5050/employees", config);
      const branchResponse = await axios.get("http://localhost:5050/branches", config);
  
      if (userRole === "Super Admin") {
        setEmployees(employeeResponse.data.Data);
      } else {
        setEmployees(employeeResponse.data.Data.filter((emp) => emp.branchid === branchIdFromToken));
      }
  
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

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (!newEmployee.name || !newEmployee.email || !newEmployee.password || !newEmployee.role || !newEmployee.branched) {
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
        ...newEmployee,
        branchid: newEmployee.branched, 
      };

      const response = await axios.post("http://localhost:5050/employees", payload, config);

      setShowAddModal(false);
      setNewEmployee({ email: "", password: "", name: "", role: "", branched: "" });

      fetchData();
    } catch (err) {
      console.error("Failed to add employee:", err);
      alert("Failed to add employee. Please try again.");
    }
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
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
      return new Date(a.createdat) > new Date(b.createdat) ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="p-4 bg-white">
      {/* Your existing table and buttons */}
      
      <AnimatePresence>
        {/* Password Update Modal */}
        {showPasswordModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)} // Close on outside click
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3>Update Password</h3>
              <input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
              <button onClick={handlePasswordChange}>Update Password</button>
              <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
            </motion.div>
          </motion.div>
        )}

        {/* Add Employee Modal */}
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)} // Close on outside click
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3>Add Employee</h3>
              {/* Your Add Employee form */}
            </motion.div>
          </motion.div>
        )}

        {/* Role Update Modal */}
        {showRoleModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRoleModal(false)} // Close on outside click
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3>Change Role</h3>
              <select
                value={roleToUpdate}
                onChange={(e) => setRoleToUpdate(e.target.value)}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
              <button onClick={handleRoleChange}>Change Role</button>
              <button onClick={() => setShowRoleModal(false)}>Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagementPage;
