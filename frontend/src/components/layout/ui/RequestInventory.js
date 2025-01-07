import React, { useState, useEffect } from "react";
import axios from "axios";

const RequestInventory = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]); // Add state for inventory
    const [newRequest, setNewRequest] = useState({
      frombranchid: "",
      tobranchid: "",
      productid: "",
      quantity: 0,
      status: "pending",
    });
  
    // Fetch data from API
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5050/Requests");
        setRequests(response.data.Data || []);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };
  
    const fetchBranches = async () => {
      try {
        const response = await axios.get("http://localhost:5050/branches");
        setBranches(response.data.Data || []);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };
  
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5050/products");
        setProducts(response.data.Data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
  
    const fetchInventory = async () => {
      try {
        const response = await axios.get("http://localhost:5050/inventory");
        setInventory(response.data.Data || []); // Set inventory data
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    };
  
    useEffect(() => {
      fetchBranches();
      fetchProducts();
      fetchRequests();
      fetchInventory(); // Call fetchInventory to load inventory data
    }, []);
  
    // Add new request
    const handleAddRequest = async () => {
      try {
        await axios.post("http://localhost:5050/Requests", newRequest);
        fetchRequests();
        setNewRequest({
          frombranchid: "",
          tobranchid: "",
          productid: "",
          quantity: 0,
          status: "pending",
        });
      } catch (err) {
        console.error("Error adding request:", err);
      }
    };
  
    // Update request status
    const handleUpdateStatus = async (requestId) => {
      try {
        await axios.put(`http://localhost:5050/Requests/${requestId}`, {
          status: "complete",
        });
        fetchRequests();
      } catch (err) {
        console.error("Error updating status:", err);
      }
    };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition duration-300 mt-4"
      >
        Request Inventory
      </button>

      {/* Add Request Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-7xl w-full relative z-60 overflow-y-auto max-h-screen mt-10">
            <h2 className="text-3xl font-bold text-center text-teal-600 mb-6">
              Request Inventory Management
            </h2>

            {/* Add Request Form */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Add New Request
              </h3>
              <form>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      From Branch
                    </label>
                    <select
                      className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={newRequest.frombranchid}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, frombranchid: e.target.value })
                      }
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.branchid} value={branch.branchid}>
                          {branch.bname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      To Branch (ME)
                    </label>
                    <select
                      className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={newRequest.tobranchid}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, tobranchid: e.target.value })
                      }
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.branchid} value={branch.branchid}>
                          {branch.bname}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Product
                    </label>
                    <select
                      className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={newRequest.productid}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, productid: e.target.value })
                      }
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.productid} value={product.productid}>
                          {product.productname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={newRequest.quantity}
                      onChange={(e) =>
                        setNewRequest({
                          ...newRequest,
                          quantity: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="bg-teal-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-teal-600 transition duration-300"
                  onClick={handleAddRequest}
                >
                  Add Request
                </button>
              </form>
            </div>

            {/* Tables Section */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-teal-600 mb-4">Requests</h3>
                <table className="table-auto w-full border-collapse border border-gray-300 mb-4 text-gray-800">
                    <thead className="bg-teal-600 text-white">
                    <tr>
                        <th className="border px-4 py-2">From Branch</th>
                        <th className="border px-4 py-2">To Branch</th>
                        <th className="border px-4 py-2">Product Name</th>
                        <th className="border px-4 py-2">Quantity</th>
                        <th className="border px-4 py-2">Created At</th>
                        <th className="border px-4 py-2">Status</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {requests.map((request) => {
                        // Finding the product name from the list of products based on productid
                        const product = products.find(
                        (product) => product.productid === request.productid
                        );
                        const fromBranch = branches.find(
                        (branch) => branch.branchid === request.frombranchid
                        );
                        const toBranch = branches.find(
                        (branch) => branch.branchid === request.tobranchid
                        );

                        return (
                        <tr key={request.requestid} className="hover:bg-teal-50">
                            <td className="border px-4 py-2">{fromBranch ? fromBranch.bname : 'N/A'}</td>
                            <td className="border px-4 py-2">{toBranch ? toBranch.bname : 'N/A'}</td>
                            <td className="border px-4 py-2">
                            {product ? product.productname : 'N/A'}
                            </td>
                            <td className="border px-4 py-2">{request.quantity}</td>
                            <td className="border px-4 py-2">{new Date(request.createdat).toLocaleString()}</td>
                            <td className="border px-4 py-2">{request.status}</td>
                            <td className="border px-4 py-2">
                            {request.status === "pending" && (
                                <button
                                onClick={() => handleUpdateStatus(request.requestid)}
                                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
                                >
                                Mark as Complete
                                </button>
                            )}
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Branches Table */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-teal-600 mb-4">Inventory Branches</h3>
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead className="bg-teal-600 text-white">
                    <tr>
                        <th className="border px-4 py-2">Branch Name</th>
                        <th className="border px-4 py-2">Product Name</th>
                        <th className="border px-4 py-2">Quantity</th>
                    </tr>
                    </thead>
                    <tbody>
                    {branches.map((branch) => {
                        // Finding all products for this branch from the inventory
                        const branchInventory = inventory.filter(
                        (item) => item.branchid === branch.branchid
                        );

                        return branchInventory.map((inventoryItem) => {
                        const product = products.find(
                            (product) => product.productid === inventoryItem.productid
                        );

                        return (
                            <tr key={inventoryItem.inventoryid} className="hover:bg-teal-50">
                            <td className="border px-4 py-2 text-black">{branch.bname}</td>
                            <td className="border px-4 py-2 text-black">
                                {product ? product.productname : 'N/A'}
                            </td>
                            <td className="border px-4 py-2 text-black">{inventoryItem.quantity}</td>
                            </tr>
                        );
                        });
                    })}
                    </tbody>
                </table>
                </div>


              {/* Products Table */}
              <div>
                <h3 className="text-xl font-semibold text-teal-600 mb-4">Products</h3>
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="border px-4 py-2">Product Name</th>
                      <th className="border px-4 py-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.productid} className="hover:bg-teal-50">
                        <td className="border px-4 py-2 text-black">{product.productname}</td>
                        <td className="border px-4 py-2 text-black">{product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-3xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestInventory;
