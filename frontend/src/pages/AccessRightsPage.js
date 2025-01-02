import React from "react";

const AccessRightsPage = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Access Rights</h1>

      {/* Description */}
      <p className="text-gray-600 mb-4">Manage user access rights and permissions efficiently.</p>

      {/* Table for Access Rights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Permissions</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">Admin</td>
              <td className="border border-gray-300 px-4 py-2">Full access to all resources</td>
              <td className="border border-gray-300 px-4 py-2">
                View, Edit, Delete, Manage Users
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">Edit</button>
              </td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">Editor</td>
              <td className="border border-gray-300 px-4 py-2">Can edit content</td>
              <td className="border border-gray-300 px-4 py-2">View, Edit</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">Edit</button>
              </td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">Viewer</td>
              <td className="border border-gray-300 px-4 py-2">Read-only access</td>
              <td className="border border-gray-300 px-4 py-2">View</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Role Button */}
      <div className="mt-6">
        <button className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md">
          Add New Role
        </button>
      </div>
    </div>
  );
};

export default AccessRightsPage;
