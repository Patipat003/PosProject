import React, { useState, useEffect } from "react";
import moment from "moment";
import { FaShippingFast, FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // นำเข้าไอคอน
import { jwtDecode } from "jwt-decode";

const ReceivingShipmentTable = ({
  currentReceivedRequests,
  branches,
  products,
  handlePreviousPageReceived,
  handleUpdateStatus,
  handleNextPageReceived,
  currentReceivedPage,
  totalReceivedPages,
}) => {

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);  

  return (
    <>
        {/* Receiving Shipment Table */}
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-teal-600 mb-4">Receiving Shipment</h3>
            <table className="table-auto table-xs w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
            <thead className="bg-gray-100 text-gray-600">
                <tr>
                <th className="border text-sm px-4 py-2">From Branch</th>
                <th className="border text-sm px-4 py-2">Product Name</th>
                <th className="border text-sm px-4 py-2">Quantity</th>
                <th className="border text-sm px-4 py-2">Created At</th>
                <th className="border text-sm px-4 py-2">Status</th>
                {(userRole === "Manager" || userRole === "Super Admin") && (
                  <th className="border text-sm px-4 py-2">Actions</th>
                )}
                </tr>
            </thead>
            <tbody>
                {currentReceivedRequests.map((request) => {
                const fromBranch = branches.find(
                    (branch) => branch.branchid === request.frombranchid
                );
                const product = products.find(
                    (product) => product.productid === request.productid
                );

                // 🎯 ฟังก์ชันแปลง `status` เป็นไอคอน
                const getStatusIcon = (status) => {
                    switch (status) {
                    case "pending":
                    case "Pending":
                        return <FaShippingFast className="text-yellow-500 text-lg" title="Pending" />;
                    case "complete":
                    case "Done":
                    case "complete_synced":
                        return <FaCheckCircle className="text-green-500 text-lg" title="Complete" />;
                    case "reject":
                        return <FaTimesCircle className="text-red-500 text-lg" title="Rejected" />;
                    default:
                        return status;
                    }
                };

                return (
                    <tr key={request.requestid} className="hover:bg-teal-50">
                      <td className="border px-4 py-2">
                          {fromBranch ? fromBranch.bname : "Warehouse"}
                      </td>
                      <td className="border px-4 py-2">
                          {product ? product.productname : "-"}
                      </td>
                      <td className="border px-4 py-2">{request.quantity}</td>
                      <td className="border px-4 py-2">
                          {moment.utc(request.createdat).format("L, HH:mm")}
                      </td>
                      <td className="border px-4 py-2 flex items-center justify-center">{getStatusIcon(request.status)}</td>
                        {(userRole === "Manager" || userRole === "Super Admin") && (
                          <td className="border px-4 py-2 text-center space-x-2">
                            {fromBranch ? "" : "Warehouse" && request.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(request.requestid, "complete")}
                                  className="text-green-500 hover:text-green-700 text-xl"
                                  title="Mark as Complete"
                                >
                                  <FaCheckCircle />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(request.requestid, "reject")}
                                  className="text-red-500 hover:text-red-700 text-xl"
                                  title="Reject Request"
                                >
                                  <FaTimesCircle />
                                </button>
                              </>
                            )}
                          </td>
                        )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>

        {/* Pagination Controls for Received Requests */}
        <div className="flex justify-center mt-4 space-x-4">
            <button
                    onClick={handlePreviousPageReceived}
                    disabled={currentReceivedPage === 1}
                    className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
                >
                Previous
            </button>
            <div className="flex items-center">
                <span className="mr-2">Page</span>
                <span>{currentReceivedPage}</span>
                <span className="ml-2">of {totalReceivedPages}</span>
            </div>
            <button
                onClick={handleNextPageReceived}
                disabled={currentReceivedPage === totalReceivedPages}
                className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
            >
            Next
            </button>
        </div>
    </>
  );
};

export default ReceivingShipmentTable;
