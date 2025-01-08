import React, { useState } from "react";

const EmployeeTransferPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    currentBranch: "",
    newBranch: "",
    date: "",
    time: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTransfers([...transfers, formData]);
    setFormData({
      id: "",
      name: "",
      currentBranch: "",
      newBranch: "",
      date: "",
      time: "",
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Employee Branch Transfer</h1>

      {/* Description */}
      <p className="text-gray-600 mb-4">
        Manage employee transfers between branches.
      </p>

      {/* Form for Employee Transfer */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Transfer Details</h2>
        <form onSubmit={handleSubmit}>
          {/* Employee ID */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Employee ID</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter Employee ID"
            />
          </div>

          {/* Employee Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Employee Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter Employee Name"
            />
          </div>

          {/* Current Branch */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Current Branch</label>
            <input
              type="text"
              name="currentBranch"
              value={formData.currentBranch}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter Current Branch"
            />
          </div>

          {/* New Branch */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Branch Moved To</label>
            <input
              type="text"
              name="newBranch"
              value={formData.newBranch}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter New Branch"
            />
          </div>

          {/* Transfer Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Transfer Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Transfer Time */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Transfer Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
          >
            Submit Transfer
          </button>
        </form>
      </div>

      {/* Transfer Records Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Transfer Records</h2>
        {transfers.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Current Branch</th>
                <th className="border border-gray-300 px-4 py-2">Branch Moved To</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{transfer.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.currentBranch}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.newBranch}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{transfer.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No transfer records found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeTransferPage;
