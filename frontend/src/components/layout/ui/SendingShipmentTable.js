import React from "react";
import moment from "moment";
import { FaShippingFast, FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // นำเข้าไอคอน

const SendingShipmentTable = ({
  currentSentRequests = [],
  branches = [],
  products = [],
  handleUpdateStatus,
  handlePreviousPageSent,
  handleNextPageSent,
  currentSentPage = 1,
  totalSentPages = 1,
}) => {
  return (
    <>
      {/* Sending Shipment Table */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-teal-600 mb-4">
          Sending Shipment
        </h3>
        <table className="table-auto table-xs w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="border text-sm px-4 py-2">To Branch</th>
              <th className="border text-sm px-4 py-2">Product Name</th>
              <th className="border text-sm px-4 py-2">Quantity</th>
              <th className="border text-sm px-4 py-2">Created At</th>
              <th className="border text-sm px-4 py-2">Status</th>
              <th className="border text-sm px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSentRequests.length > 0 ? (
              currentSentRequests.map((request) => {
                const toBranch = branches.find(
                  (b) => b.branchid === request.tobranchid
                );
                const product = products.find(
                  (p) => p.productid === request.productid
                );

                // 🎯 ฟังก์ชันแปลง `status` เป็นไอคอน
                const getStatusIcon = (status) => {
                  switch (status) {
                    case "pending":
                      return <FaShippingFast className="text-yellow-500 text-lg" title="Pending" />;
                    case "complete":
                      return <FaCheckCircle className="text-green-500 text-lg" title="Complete" />;
                    case "reject":
                      return <FaTimesCircle className="text-red-500 text-lg" title="Rejected" />;
                    default:
                      return status;
                  }
                };

                return (
                  <tr key={request.requestid} className="bg-gray-80 hover:bg-gray-100">
                    <td className="border px-4 py-2">{toBranch ? toBranch.bname : "-"}</td>
                    <td className="border px-4 py-2">{product ? product.productname : "-"}</td>
                    <td className="border px-4 py-2">{request.quantity}</td>
                    <td className="border px-4 py-2">
                      {moment.utc(request.createdat).format("L, HH:mm")}
                    </td>
                    {/* 🎯 ใช้ไอคอนแทนสถานะ */}
                    <td className="border px-4 py-2 flex items-center justify-center">{getStatusIcon(request.status)}</td>
                    <td className="border px-4 py-2 text-center space-x-2">
                    {request.status === "pending" && (
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
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  No Sent Requests Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls for Sent Requests */}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={handlePreviousPageSent}
          disabled={currentSentPage === 1}
          className={`btn border-none px-6 py-3 rounded transition duration-300 ${
            currentSentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-teal-600"
          }`}
        >
          Previous
        </button>
        <div className="flex items-center">
          <span className="mr-2">Page</span>
          <span>{currentSentPage}</span>
          <span className="ml-2">of {totalSentPages}</span>
        </div>
        <button
          onClick={handleNextPageSent}
          disabled={currentSentPage === totalSentPages}
          className={`btn border-none px-6 py-3 rounded transition duration-300 ${
            currentSentPage === totalSentPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-teal-600"
          }`}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default SendingShipmentTable;
