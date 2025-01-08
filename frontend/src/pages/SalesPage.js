import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiTrash } from "react-icons/hi";

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchData = async () => {
    try {
      const [productRes, branchRes, inventoryRes] = await Promise.all([
        axios.get("http://localhost:5050/products"),
        axios.get("http://localhost:5050/branches"),
        axios.get("http://localhost:5050/inventory"),
      ]);
      setProducts(productRes.data.Data);
      setBranches(branchRes.data.Data);
      setInventory(inventoryRes.data.Data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
    setCart([]); // Clear the cart when branch is changed
    setTotalAmount(0); // Reset the total amount
  };

  const handleAddToCart = (product, quantity) => {
    if (!selectedBranch || selectedBranch === "all") {
      alert("โปรดเลือกสาขาก่อน");
      return;
    }

    const inventoryItem = inventory.find(
      (item) => item.productid === product.productid && item.branchid === selectedBranch
    );
    if (!inventoryItem) {
      alert("Product not available in the selected branch");
      return;
    }

    if (!inventoryItem || inventoryItem.quantity === 0) {
      alert("Out of stock");
      return;
    }

    const productInCart = cart.find((item) => item.productid === product.productid);
    if (productInCart) {
      productInCart.quantity += quantity;
    } else {
      cart.push({ ...product, quantity, branchid: selectedBranch });
    }
    setCart([...cart]);
    updateTotalAmount();
  };

  const handleRemoveFromCart = (productid) => {
    const newCart = cart.filter((item) => item.productid !== productid);
    setCart(newCart);
    updateTotalAmount();
  };

  const handleQuantityChange = (productid, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.productid === productid ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    updateTotalAmount();
  };

  const updateTotalAmount = () => {
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
    });
    setTotalAmount(total);
  };

  const handleCheckout = async () => {
    if (!selectedBranch) {
      alert("โปรดเลือกสาขาก่อน");
      return;
    }
    const saleItems = cart.map((item) => ({
      productid: item.productid,
      quantity: item.quantity,
      price: item.price,
      totalprice: item.price * item.quantity,
    }));
    const saleData = {
      employeeid: "8a714024-471a-420f-8abb-46509d0cd74e",
      branchid: selectedBranch,
      saleitems: saleItems,
    };
    try {
      await axios.post("http://localhost:5050/sales", saleData);
      alert("Sale completed successfully!");
      setCart([]);
      setTotalAmount(0);
    } catch (err) {
      console.error("Error during sale", err);
      alert("Failed to complete the sale.");
    }
  };

  const getInventoryByBranch = (branchId) => {
    if (branchId === "all") {
      return inventory;
    } else {
      return inventory.filter((item) => item.branchid === branchId);
    }
  };

  const filterInventoryByProduct = () => {
    return getInventoryByBranch(selectedBranch).reduce((acc, item) => {
      const product = products.find((p) => p.productid === item.productid);
      if (product) {
        const existingProduct = acc.find((p) => p.productid === item.productid);
        if (existingProduct) {
          existingProduct.totalQuantity += item.quantity;
        } else {
          acc.push({ ...product, totalQuantity: item.quantity });
        }
      }
      return acc;
    }, []);
  };

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-black mb-4">Sales Product</h1>

      <div className="mb-4">
        <select
          value={selectedBranch}
          onChange={handleBranchChange}
          className="border p-2 rounded"
        >
          <option value="all">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.branchid} value={branch.branchid}>
              {branch.bname}
            </option>
          ))}
        </select>
      </div>

      <div className="flex">
        <div className="w-4/5">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <div className="grid grid-cols-4 gap-4">
            {selectedBranch && selectedBranch !== "all" ? (
              filterInventoryByProduct().map((product) => {
                const stock =
                  getInventoryByBranch(selectedBranch).find(
                    (item) => item.productid === product.productid
                  )?.quantity || 0;
                return (
                  <button
                    key={product.productid}
                    onClick={() => handleAddToCart(product, 1)}
                    className={`card bg-teal-600 shadow-xl p-4 flex flex-col justify-between items-center transition-transform transform hover:scale-105 ${
                      stock === 0 ? "opacity-50" : ""
                    }`}
                    disabled={stock === 0}
                    style={{ width: "150px", height: "150px" }}
                  >
                    <figure className="flex justify-center items-center h-2/3 w-full">
                      <img
                        src="https://via.placeholder.com/100"
                        alt="Product"
                        className="max-h-full max-w-full"
                      />
                    </figure>
                    <div className="text-center mt-2">
                      <h2 className="text-white font-bold text-sm">{product.productname}</h2>
                      <p className="text-xs text-white">Qty: {stock}</p>
                      <p className="text-xs text-white">Price: ${product.price}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center col-span-4">Please select a branch to view products.</p>
            )}
          </div>
        </div>

        <div className="w-2/5">
          <h2 className="text-xl font-bold mb-4">Your Cart</h2>
          <div className="border p-6 rounded h-96 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.productid} className="flex justify-between mb-2">
                <div>{item.productname}</div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.productid, parseInt(e.target.value))
                    }
                    className="w-16 border p-1 rounded"
                    min="1"
                  />
                  <span className="ml-2">
                    {item.quantity} x ${item.price} = ${item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => handleRemoveFromCart(item.productid)}
                    className="ml-2 text-red-600"
                  >
                    <HiTrash size={20} />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4 font-bold">Total: ${totalAmount}</div>
            <button
              onClick={handleCheckout}
              className="mt-4 w-full bg-teal-500 text-white p-2 rounded"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
