import React, { useState } from "react";

const AddEmployeePage = () => {
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
    <div>
      {/* Add Employee Button */}
      <button
        onClick={handleAddEmployee}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-700 transition duration-300 mt-4"
      >
        Add Employee
      </button>

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
                  placeholder="Enter employee name"
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
                  placeholder="Enter position"
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

export default AddEmployeePage;
