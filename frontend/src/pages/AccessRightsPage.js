import React, { useState } from "react";

const AccessRightsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roles, setRoles] = useState([
    { role: "Admin", description: "Full access to all resources", permissions: "View, Edit, Delete, Manage Users" },
    { role: "Editor", description: "Can edit content", permissions: "View, Edit" },
    { role: "Viewer", description: "Read-only access", permissions: "View" },
  ]);

  const [currentRole, setCurrentRole] = useState({ role: "", description: "", permissions: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleOpenModal = () => {
    setCurrentRole({ role: "", description: "", permissions: [] });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    const permissionsString = currentRole.permissions.join(", ");
    if (isEditing) {
      const updatedRoles = roles.map((r, index) =>
        index === editIndex ? { ...currentRole, permissions: permissionsString } : r
      );
      setRoles(updatedRoles);
    } else {
      setRoles([...roles, { ...currentRole, permissions: permissionsString }]);
    }
    handleCloseModal();
  };

  const handleEditRole = (index) => {
    const role = roles[index];
    setCurrentRole({ ...role, permissions: role.permissions.split(", ") });
    setEditIndex(index);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handlePermissionChange = (permission) => {
    setCurrentRole((prevRole) => {
      const isSelected = prevRole.permissions.includes(permission);
      return {
        ...prevRole,
        permissions: isSelected
          ? prevRole.permissions.filter((p) => p !== permission)
          : [...prevRole.permissions, permission],
      };
    });
  };

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
            {roles.map((role, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{role.role}</td>
                <td className="border border-gray-300 px-4 py-2">{role.description}</td>
                <td className="border border-gray-300 px-4 py-2">{role.permissions}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
                    onClick={() => handleEditRole(index)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Role Button */}
      <div className="mt-6">
        <button
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md"
          onClick={handleOpenModal}
        >
          Add New Role
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 text-2xl font-bold hover:text-gray-800 transition"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isEditing ? "Edit Role" : "Add New Role"}
            </h2>
            <form onSubmit={handleSaveRole}>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">Role</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  value={currentRole.role}
                  onChange={(e) => setCurrentRole({ ...currentRole, role: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">Description</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none"
                  value={currentRole.description}
                  onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">Permissions</label>
                <div className="space-y-2">
                  {["View", "Edit", "Delete", "Manage Users"].map((permission) => (
                    <div key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        id={permission}
                        className="mr-2"
                        checked={currentRole.permissions.includes(permission)}
                        onChange={() => handlePermissionChange(permission)}
                      />
                      <label htmlFor={permission} className="text-gray-600">{permission}</label>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-700 transition"
              >
                {isEditing ? "Save Changes" : "Add Role"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessRightsPage;
