import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import library สำหรับ decode token
import ExportButtons from "../components/layout/ui/ExportButtons";
import RequestInventory from "../components/layout/ui/RequestInventory";
import SortByDropdown from "../components/layout/ui/SortByDropdown";
import { format } from "date-fns";
import { HiEye } from "react-icons/hi";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "d/MM/yyyy, HH:mm");
};

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState({});
  const [branches, setBranches] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [sortKey, setSortKey] = useState("productid");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewAllBranches, setViewAllBranches] = useState(false); // State สำหรับ Toggle ระหว่างทุกสาขาและเฉพาะสาขาตัวเอง
  const [userRole, setUserRole] = useState(""); // Role ของ user
  const [userBranchId, setUserBranchId] = useState(""); // Branch ID ของ user

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("authToken"); // หยิบ token จาก localStorage
      const decodedToken = jwtDecode(token); // Decode token เพื่อดึง role และ branchid
      setUserRole(decodedToken.role);
      setUserBranchId(decodedToken.branchid);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // แนบ token ไปกับ header ของคำขอ
        },
      };

      const [inventoryResponse, productResponse, branchResponse] = await Promise.all([
        axios.get("http://localhost:5050/inventory", config), // ส่ง token ไปด้วย
        axios.get("http://localhost:5050/products", config),
        axios.get("http://localhost:5050/branches", config),
      ]);

      const productMap = {};
      productResponse.data.Data.forEach((product) => {
        productMap[product.productid] = product.productname;
      });

      const branchMap = {};
      branchResponse.data.Data.forEach((branch) => {
        branchMap[branch.branchid] = {
          bname: branch.bname,
          location: branch.location,
        };
      });

      setInventory(inventoryResponse.data.Data);
      setProducts(productMap);
      setBranches(branchMap);
      setLoading(false);
    } catch (err) {
      setError("Failed to load inventory data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSortChange = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);

    const sortedData = [...inventory].sort((a, b) => {
      const aValue =
        key === "productid" ? products[a[key]] : key === "branchid" ? branches[a[key]]?.bname : a[key];
      const bValue =
        key === "productid" ? products[b[key]] : key === "branchid" ? branches[b[key]]?.bname : b[key];

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setInventory(sortedData);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleView = () => {
    setViewAllBranches(!viewAllBranches); // Toggle สถานะการดูข้อมูล
  };

  // Filter Inventory ตาม branch
  const filteredInventory = inventory.filter((item) => {
    if (userRole === "Manager" && viewAllBranches) {
      return true; // Manager ที่เลือกดูทุกสาขา
    }
    return item.branchid === userBranchId; // เฉพาะ branch ของ user
  });

  // Group by branch
  const groupedInventory = filteredInventory.reduce((groups, item) => {
    const branchName = branches[item.branchid]?.bname || "Unknown";
    if (!groups[branchName]) {
      groups[branchName] = [];
    }
    groups[branchName].push(item);
    return groups;
  }, {});

  const sortOptions = [
    { key: "productid", label: "Product Name" },
    { key: "branchid", label: "Branch Name" },
    { key: "quantity", label: "Quantity" },
    { key: "updatedat", label: "Updated At" },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleViewDetails = (inventory) => {
    setSelectedInventory(inventory);
  };

  const handleCloseModal = () => {
    setSelectedInventory(null);
  };

  const columns = ["inventoryid", "productid", "branchid", "quantity", "updatedat"]; // Define columns for export

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Inventory</h1>
      <p className="text-black mb-4">Manage your Inventory here.</p>

      

      <div className="flex space-x-4 mb-4">
        <RequestInventory onProductAdded={fetchInventory} />
        <ExportButtons filteredTables={filteredInventory} columns={columns} filename="inventory.pdf" />
      </div>

      <div className="mb-4 space-x-6 flex">
        <div className="flex items-center space-x-4 m-2 w-full">
          <label htmlFor="searchInput" className=" text-black font-semibold w-1/2">
            Search by Product Name
          </label>
          <input
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by product name"
            className="border bg-white border-gray-700 p-3 m-2 text-black rounded-md w-full mr-2 items-center"
          />
        </div>

        <SortByDropdown
          onSortChange={handleSortChange}
          currentSortKey={sortKey}
          currentSortDirection={sortDirection}
          sortOptions={sortOptions}
        />
      </div>

      <div className="overflow-x-auto space-y-6">

        {userRole === "Manager" && (
          <div>
            <div className="mb-4 text-blue-500">
              <h2>Manager Privileges</h2>
            </div>

            <button
              onClick={handleToggleView}
              className="btn bg-blue-500 text-white font-medium px-6 py-3 mb-4 rounded-md border-none hover:bg-blue-600 transition duration-300"
            >
              {viewAllBranches ? "View My Branch Only" : "View All Branches"}
            </button>
        </div>
        )}

        {Object.keys(groupedInventory).map((branchName) => (
          <div key={branchName} className="mb-6">
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">{branchName}</h2>
            <table className="table w-full table-striped">
              <thead>
                <tr>
                  <th className="text-black">Product Name</th>
                  <th className="text-black">Quantity</th>
                  <th className="text-black">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {groupedInventory[branchName].map((item) => (
                  <tr key={item.inventoryid}>
                    <td className="text-black">{products[item.productid]}</td>
                    <td className="text-black">{item.quantity}</td>
                    <td className="text-black">{formatDate(item.updatedat)}</td>
                    <td className="text-black">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="hover:border-b-2 border-gray-400 transition duration-30"
                      >
                        <HiEye className="text-blue-600 h-6 w-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Popup สำหรับแสดงรายละเอียด */}
      {selectedInventory && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative">
            <h2 className="text-3xl font-bold mb-6 text-teal-600 text-center">
              Inventory Details
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                <span className="font-semibold">Product Name:</span> {products[selectedInventory.productid]}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Branch Name:</span> {branches[selectedInventory.branchid]?.bname}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Location:</span> {branches[selectedInventory.branchid]?.location}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Quantity:</span> {selectedInventory.quantity}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Updated At:</span> {formatDate(selectedInventory.updatedat)}
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="btn w-full bg-teal-500 text-white font-medium px-6 py-3 mt-6 rounded-md border-none hover:bg-teal-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
