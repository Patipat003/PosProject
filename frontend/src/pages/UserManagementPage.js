import React from "react";

const UserManagementPage = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>

      {/* Add Employee Button */}
      <div className="flex justify-end mb-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
          + Add Employee
        </button>
      </div>

      {/* Info Bar */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6 flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-700">Name</span>
        <span className="text-lg font-semibold text-gray-700">Email</span>
        <span className="text-lg font-semibold text-gray-700">Phone</span>
        <span className="text-lg font-semibold text-gray-700">Access Rights</span>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <table className="table-auto w-full border-collapse border border-gray-200 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Access Rights</th>
            </tr>
          </thead>
          <tbody>
            {/* Example Data */}
            {[
              { name: "John Doe", email: "john@example.com", phone: "123-456-7890", rights: "Admin" },
              { name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210", rights: "User" },
              { name: "Mike Johnson", email: "mike@example.com", phone: "555-123-4567", rights: "Editor" },
            ].map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.phone}</td>
                <td className="border border-gray-300 px-4 py-2">{user.rights}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
