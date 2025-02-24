import React from "react";

const AddRequestModal = ({
  newRequest,
  setNewRequest,
  branches,
  products,
  inventory,
  branchid,
  branchName,
  handleAddRequest,
}) => {
  return (
    <div className="mb-8">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Add New Request
    </h3>
    <form>
        <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
            <label className="block text-gray-700 font-medium mb-2">
            From Branch ({branchName})
            </label>
            <select
            className="w-full p-3 border text-black border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={newRequest.tobranchid}
            disabled
            >
            <option value="">Your Branch</option>
            </select>
        </div>

        <div>
            <label className="block text-gray-700 font-medium mb-2">
            To Branch
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
                .filter((branch) => branch.branchid !== branchid) // Filter out our own branch
                .map((branch) => (
                <option key={branch.branchid} value={branch.branchid}>
                    {branch.bname}
                </option>
                ))}
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
              {products
                .map((product) => {
                  // Find the inventory for this product in the selected "To Branch"
                  const branchInventory = inventory.find(
                    (item) => item.productid === product.productid && item.branchid === newRequest.frombranchid
                  );
                  const quantity = branchInventory ? branchInventory.quantity : 0;

                  // Filter to show only products with quantity > 1
                  if (quantity > 1) {
                    return (
                      <option key={product.productid} value={product.productid}>
                        {product.productname} ({quantity})
                      </option>
                    );
                  }
                  return null; // Skip if quantity is 1 or less
                })
              }
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
            min="0"
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

export default AddRequestModal;
