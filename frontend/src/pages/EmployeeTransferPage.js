import React from "react";

const EmployeeTransferPage = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Employee Transfer</h1>

      {/* Description */}
      <p className="text-gray-600 mb-4">Manage employee transfers across departments or locations.</p>

      {/* Form for Employee Transfer */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Transfer Details</h2>
        <form>
          {/* Employee ID */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Employee ID</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter Employee ID"
            />
          </div>

          {/* Employee Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Employee Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter Employee Name"
            />
          </div>

          {/* Current Department */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Current Department</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter Current Department"
            />
          </div>

          {/* Transfer To Department */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Transfer To</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter New Department/Location"
            />
          </div>

          {/* Transfer Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Transfer Date</label>
            <input
              type="date"
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
    </div>
  );
};

export default EmployeeTransferPage;
