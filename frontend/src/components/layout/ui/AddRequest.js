import React, { useState, useEffect } from "react";

const AddRequest = ({
  branches,
  products,
  newRequest,
  setNewRequest,
  handleAddRequest,
  error,
}) => {
  // สมมติว่า getBranchFromToken() ใช้ดึง branchid จาก JWT Token
  const [userBranchId, setUserBranchId] = useState("");

  useEffect(() => {
    // กำหนด userBranchId จาก token หรือข้อมูลที่เกี่ยวข้อง
    const token = localStorage.getItem("authToken");
    const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
    setUserBranchId(decoded.branchid); // สมมติว่า branchid อยู่ใน token
  }, []);

  return (
    <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Request
        </h3>
        <form>
            <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                From Branch
                </label>
                <select
                className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={newRequest.frombranchid}
                onChange={(e) =>
                    setNewRequest({ ...newRequest, frombranchid: e.target.value })
                }
                >
                <option value="">Select Branch</option>
                {branches
                  .filter((branch) => branch.branchid !== userBranchId) // กรองออกสาขาของตัวเอง
                  .map((branch) => (
                    <option key={branch.branchid} value={branch.branchid}>
                      {branch.bname}
                    </option>
                  ))}
                </select>
            </div>
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                To Branch (ME)
                </label>
                <select
                className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={newRequest.tobranchid}
                disabled
                >
                <option value="">Your Branch</option>
                </select>
            </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                Product
                </label>
                <select
                className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={newRequest.productid}
                onChange={(e) =>
                    setNewRequest({ ...newRequest, productid: e.target.value })
                }
                >
                <option value="">Select Product</option>
                {products.map((product) => (
                    <option key={product.productid} value={product.productid}>
                    {product.productname}
                    </option>
                ))}
                </select>
            </div>
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                Quantity
                </label>
                <input
                type="number"
                className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={newRequest.quantity}
                onChange={(e) =>
                    setNewRequest({
                    ...newRequest,
                    quantity: parseInt(e.target.value),
                    })
                }
                />
            </div>
            </div>
            <button
            className="btn border-none bg-teal-500 text-white font-medium py-3 px-6 rounded hover:bg-teal-600 transition duration-300"
            onClick={handleAddRequest}
            >
            Add Request
            </button>
        </form>
    </div>
  );
};

export default AddRequest;
