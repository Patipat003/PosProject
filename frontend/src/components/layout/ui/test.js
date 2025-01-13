import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

const RequestInventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [newRequest, setNewRequest] = useState({
    frombranchid: "",
    tobranchid: "",
    productid: "",
    quantity: 0,
    status: "pending",
  });
  const [branchName, setBranchName] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/Requests", config);
      setRequests(response.data.Data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/branches", config);
      setBranches(response.data.Data || []);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/products", config);
      setProducts(response.data.Data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("http://localhost:5050/inventory", config);
      setInventory(response.data.Data || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchProducts();
    fetchRequests();
    fetchInventory();
  }, []);

  const getBranchFromToken = () => {
    const token = localStorage.getItem("authToken");
    const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
    return decoded.branchid;
  };

  useEffect(() => {
    const branchid = getBranchFromToken();
    setNewRequest((prevRequest) => ({
      ...prevRequest,
      tobranchid: branchid,
    }));
    const branch = branches.find((branch) => branch.branchid === branchid);
    if (branch) {
      setBranchName(branch.bname);
    }
  }, [branches]);

  const branchid = getBranchFromToken();
  const filteredRequests = requests.filter(
    (request) =>
      request.frombranchid === branchid || request.tobranchid === branchid
  );

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
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
            {/* Other content */}

            {/* Sending Shipment */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-teal-600 mb-4">Sending Shipment</h3>
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
                  {currentRequests.map((request) => {
                    const fromBranch = branches.find(
                      (branch) => branch.branchid === request.frombranchid
                    );
                    const toBranch = branches.find(
                      (branch) => branch.branchid === request.tobranchid
                    );
                    const product = products.find(
                      (product) => product.productid === request.productid
                    );

                    return (
                      <tr key={request.requestid} className="hover:bg-teal-50">
                        <td className="border px-4 py-2">
                          {fromBranch ? fromBranch.bname : "-"}
                        </td>
                        <td className="border px-4 py-2">
                          {toBranch ? toBranch.bname : "-"}
                        </td>
                        <td className="border px-4 py-2">
                          {product ? product.productname : "-"}
                        </td>
                        <td className="border px-4 py-2">{request.quantity}</td>
                        <td className="border px-4 py-2">
                          {moment(request.createdat).format("L, HH:mm")}
                        </td>
                        <td className="border px-4 py-2">{request.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
              >
                Previous
              </button>
              <div className="flex items-center">
                <span className="mr-2">Page</span>
                <span>{currentPage}</span>
                <span className="ml-2">of {totalPages}</span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
              >
                Next
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-0 right-0 m-4 text-white"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestInventory;
