import React, { useState } from "react";

const UserManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Phone, setPhone] = useState("");
  const [AccessRights, setAccessRights] = useState("");

  const handleAddEmployee = () => {
    setIsModalOpen(true); // Open modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process the form data here (e.g., send to backend)
    console.log("Name:", Name);
    console.log("Email:", Email);
    handleCloseModal(); // Close modal after submission
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>

      {/* Add Employee Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddEmployee}
          className="bg-base-200 text-white px-6 py-3 rounded hover:bg-gray-700 transition duration-300 mt-4"
        >
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

      {/* Modal for Adding Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative z-60">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
              Add Employee
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Employee Name Input */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter name"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Position Input */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Email
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter email"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter phone"
                  value={Phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">
                  Access Rights
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Enter Access Rights"
                  value={AccessRights}
                  onChange={(e) => setAccessRights(e.target.value)}
                />
              </div>
              {/* Save Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-medium py-3 rounded hover:bg-blue-700 transition duration-300"
              >
                Add Employee
              </button>
            </form>
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
