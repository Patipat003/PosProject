import React, { useState } from "react";

const RequestTable = ({ filteredRequests, filteredInventory, branches, products }) => {
  const [showSentRequests, setShowSentRequests] = useState(true);

  const toggleRequestView = () => {
    setShowSentRequests(!showSentRequests);
  };

  return (
    <div>
      {/* Toggle Button */}
      <div className="mb-4">
        <button
          className="btn border-none bg-teal-500 text-white font-medium py-2 px-4 rounded hover:bg-teal-600 transition duration-300"
          onClick={toggleRequestView}
        >
          {showSentRequests ? "View Received Requests" : "View Sent Requests"}
        </button>
      </div>

      {/* Sent Requests Table */}
      {showSentRequests && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-teal-600 mb-4">Sent Requests</h3>
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
              {filteredRequests.map((request) => {
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
                    <td className="border px-4 py-2">{request.createdat}</td>
                    <td className="border px-4 py-2">{request.status}</td>
                    <td className="border px-4 py-2">
                      {/* Action buttons */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Received Requests Table */}
      {!showSentRequests && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-teal-600 mb-4">Received Requests</h3>
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
              {filteredRequests
                .filter((request) => request.tobranchid === request.frombranchid) // Filter to show received requests
                .map((request) => {
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
                      <td className="border px-4 py-2">{request.createdat}</td>
                      <td className="border px-4 py-2">{request.status}</td>
                      <td className="border px-4 py-2">
                        {/* Action buttons */}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inventory Table */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-teal-600 mb-4">Products</h3>
        <table className="table-auto w-full border-collapse border border-gray-300 mb-4 text-gray-800">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="border px-4 py-2">Product Name</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const product = products.find(
                (product) => product.productid === item.productid
              );
              return (
                <tr key={item.inventoryid}>
                  <td className="border px-4 py-2">
                    {product ? product.productname : "-"}
                  </td>
                  <td className="border px-4 py-2">{product ? product.price : "-"}</td>
                  <td className="border px-4 py-2">{item.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestTable;
