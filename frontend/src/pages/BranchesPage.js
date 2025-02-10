  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import { FiEdit, FiTrash, FiPlus, FiEye } from "react-icons/fi";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { motion } from "framer-motion";
  import moment from "moment";
  import BranchViewModal from "../components/layout/ui/BranchViewModal";

  const BranchesPage = () => {
    const [branches, setBranches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [newBranch, setNewBranch] = useState({ bname: "", location: "" });
    const [editBranch, setEditBranch] = useState(null);
    const [editData, setEditData] = useState({ bname: "", location: "" });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const token = localStorage.getItem("authToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchBranches = async () => {
      try {
        const response = await axios.get("http://localhost:5050/branches", config);
        setBranches(response.data.Data || []);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    useEffect(() => {
      fetchBranches();
    }, []);

    useEffect(() => {
      const fetchBranches = async () => {
        try {
          const response = await axios.get("http://localhost:5050/branches", config);
          setBranches(response.data.Data || []);
        } catch (error) {
          console.error("Error fetching branches:", error);
        }
      };
      fetchBranches();
    }, []);

    const addBranch = async () => {
      if (!newBranch.bname.trim() || !newBranch.location.trim()) {
        toast.warning("⚠️ Please fill in all fields!");
        return;
      }
      try {
        await axios.post("http://localhost:5050/branches", newBranch, config);
        toast.success("✅ Branch added successfully!");
        setNewBranch({ bname: "", location: "" });
        setIsAddModalOpen(false);
        fetchBranches();
      } catch (error) {
        console.error("Error adding branch:", error);
        toast.error("❌ Failed to add branch!");
      }
    };

    const openEditModal = (branch) => {
      setEditBranch(branch);
      setEditData({ bname: branch.bname, location: branch.location });
      setIsEditModalOpen(true);
    };

    const updateBranch = async () => {
      if (!editBranch) return;
      try {
        await axios.put(
          `http://localhost:5050/branches/${editBranch.branchid}`,
          editData,
          config
        );
        toast.success("✅ Branch updated successfully!");
        setIsEditModalOpen(false);
        fetchBranches();
      } catch (error) {
        console.error("Error updating branch:", error);
        toast.error("❌ Failed to update branch!");
      }
    };

    const deleteBranch = async (id) => {
      if (!window.confirm("⚠️ Are you sure you want to delete this branch?")) return;
      try {
        await axios.delete(`http://localhost:5050/branches/${id}`, config);
        
        // Update state immediately before refetching
        setBranches((prevBranches) => prevBranches.filter(branch => branch.branchid !== id));
    
        toast.success("🗑️ Branch deleted successfully!", { autoClose: 2000 });
        fetchBranches(); // Refetch updated list
      } catch (error) {
        console.error("Error deleting branch:", error);
        toast.error("❌ Failed to delete branch!");
      }
    };    

    const openViewModal = (branch) => {
      setSelectedBranch(branch);
      setIsViewModalOpen(true);
    };

    return (
      <div className="p-4 bg-white min-h-screen">
        <ToastContainer position="top-right" autoClose={2000} />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal-600 mb-6">Branch Management</h1>
          <button onClick={() => setIsAddModalOpen(true)} className="btn bg-teal-500 text-white px-6 py-3 border-none rounded hover:bg-teal-600 transition duration-300 mt-4">
            <FiPlus size={18} /> Add Branch
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search branch..."
          className="border text-gray-500 bg-white p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
        />

        {/* ✅ Branch Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {branches
            .filter((branch) => branch.bname.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((branch) => (
              <div key={branch.branchid} className="border p-4 rounded-lg shadow-lg bg-white">
                <p className="text-teal-700 font-semibold text-lg">{branch.bname}</p>
                <p className="text-gray-600">📍 {branch.location}</p>
                <p className="text-sm text-gray-400">
                  📅 Created on: {moment(branch.createdat).format("DD/MM/YYYY")}
                </p>
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => openViewModal(branch)} className="text-green-500 hover:text-green-700">
                    <FiEye size={20} />
                  </button>
                  <button onClick={() => openEditModal(branch)} className="text-blue-500 hover:text-blue-700">
                    <FiEdit size={20} />
                  </button>
                  <button onClick={() => deleteBranch(branch.branchid)} className="text-red-500 hover:text-red-700">
                    <FiTrash size={20} />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* ✅ Add/Edit Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center" onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}>
            <motion.div className="bg-white p-6 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl text-gray-600 font-bold mb-4">
                {isAddModalOpen ? "Add New Branch" : "Edit Branch"}
              </h2>
              <input
                type="text"
                value={isAddModalOpen ? newBranch.bname : editData.bname}
                onChange={(e) => isAddModalOpen 
                  ? setNewBranch({ ...newBranch, bname: e.target.value }) 
                  : setEditData({ ...editData, bname: e.target.value })}
                placeholder="Branch Name"
                className="border bg-white border-gray-300 p-3 mb-3 text-black rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                value={isAddModalOpen ? newBranch.location : editData.location}
                onChange={(e) => isAddModalOpen 
                  ? setNewBranch({ ...newBranch, location: e.target.value }) 
                  : setEditData({ ...editData, location: e.target.value })}
                placeholder="Location"
                className="border bg-white border-gray-300 p-3 mb-3 text-black rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex justify-end gap-2">
                <button onClick={isAddModalOpen ? addBranch : updateBranch} className="btn bg-teal-500 text-white border-none hover:bg-teal-600 rounded">
                  Save
                </button>
                <button onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }} className="btn bg-red-500 text-white border-none hover:bg-red-600 rounded">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

          {isViewModalOpen && selectedBranch && (
              <BranchViewModal branch={selectedBranch} onClose={() => setIsViewModalOpen(false)} />
          )}
      </div>
    );
  };

  export default BranchesPage;
