import React, { useState, useEffect } from "react";
import axios from "axios";
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

  const fetchInventory = async () => {
    try {
      const [inventoryResponse, productResponse, branchResponse] = await Promise.all([
        axios.get("http://localhost:5050/inventory"),
        axios.get("http://localhost:5050/products"),
        axios.get("http://localhost:5050/branches"),
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

  // รีเฟรชข้อมูลสินค้าเมื่อมีการเพิ่มสินค้าใหม่
  const handleProductAdded = () => {
    fetchProducts();
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
      <h1 className="text-3xl font-bold text-black mb-4">Inventory</h1>
      <p className="text-black mb-4">Manage your Inventory here.</p>

      <div className="flex space-x-4 mb-4">
        <RequestInventory onProductAdded={handleProductAdded} />
        <ExportButtons filteredTables={inventory} columns={columns} filename="inventory.pdf" />
      </div>

      <SortByDropdown
        onSortChange={handleSortChange}
        currentSortKey={sortKey}
        currentSortDirection={sortDirection}
        sortOptions={sortOptions}
      />

      <div className="overflow-x-auto">
        <table className="table w-full table-striped">
          <thead>
            <tr>
              <th className="text-black">Product Name</th>
              <th className="text-black">Branch Name</th>
              <th className="text-black">Quantity</th>
              <th className="text-black">Updated At</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.inventoryid}>
                <td className="text-black">{products[item.productid]}</td>
                <td className="text-black">{branches[item.branchid]?.bname}</td>
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

      {/* Popup สำหรับแสดงรายละเอียด */}
      {selectedInventory && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
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
              className="w-full bg-base-200 text-white font-medium px-6 py-3 mt-6 rounded-md hover:bg-gray-700 transition duration-300"
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
