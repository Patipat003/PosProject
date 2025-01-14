import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { HiEye } from "react-icons/hi";

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "d/MM/yyyy, HH:mm");
};

const PaymentPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [branches, setBranches] = useState({});
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [receiptsResponse, branchesResponse] = await Promise.all([
          axios.get("http://localhost:5050/receipts", config),
          axios.get("http://localhost:5050/branches", config),
        ]);

        const branchMap = {};
        branchesResponse.data.Data.forEach((branch) => {
          branchMap[branch.branchid] = branch.bname;
        });

        setReceipts(receiptsResponse.data.Data);
        setBranches(branchMap);
        setFilteredReceipts(receiptsResponse.data.Data); // Set initially to all receipts
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = receipts.filter((receipt) => {
      const branchName = branches[receipt.branchid]?.toLowerCase() || "unknown";
      return branchName.includes(query);
    });

    setFilteredReceipts(filtered);
  };

  const handleViewDetails = (receipt) => {
    setSelectedReceipt(receipt);
  };

  const handleCloseModal = () => {
    setSelectedReceipt(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Receipts</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Branch Name"
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <table className="border border-collapse w-full text-left">
        <thead>
          <tr className="bg-teal-600 text-white">
            <th className="border p-2">Branch</th>
            <th className="border p-2">Receipt Number</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Receipt Date</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredReceipts.map((receipt) => (
            <tr key={receipt.receiptid}>
              <td className="border p-2">{branches[receipt.branchid] || "Unknown"}</td>
              <td className="border p-2">{receipt.receiptnumber}</td>
              <td className="border p-2">{receipt.totalamount}</td>
              <td className="border p-2">{formatDate(receipt.receiptdate)}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleViewDetails(receipt)}
                  className="text-blue-600 hover:underline"
                >
                  <HiEye className="inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedReceipt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Receipt Details</h2>
            <ul className="space-y-2">
              <li>
                <strong>Receipt ID:</strong> {selectedReceipt.receiptid}
              </li>
              <li>
                <strong>Sale ID:</strong> {selectedReceipt.saleid}
              </li>
              <li>
                <strong>Branch Name:</strong> {branches[selectedReceipt.branchid] || "Unknown"}
              </li>
              <li>
                <strong>Receipt Number:</strong> {selectedReceipt.receiptnumber}
              </li>
              <li>
                <strong>Total Amount:</strong> {selectedReceipt.totalamount}
              </li>
              <li>
                <strong>Receipt Date:</strong> {formatDate(selectedReceipt.receiptdate)}
              </li>
            </ul>
            <button
              onClick={handleCloseModal}
              className="mt-4 w-full bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
