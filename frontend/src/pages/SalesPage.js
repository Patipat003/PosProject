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
    setCart([]);  // Reset the cart when switching branches
  };

  const handleAddToCart = (product, quantity) => {
    if (!selectedBranch) {
      alert("โปรดเลือกสาขาก่อน");
      return;
    }

    const productInCart = cart.find((item) => item.productid === product.productid);

    // Check if the product belongs to the selected branch
    const inventoryItem = inventory.find((item) => item.productid === product.productid && item.branchid === selectedBranch);
    if (!inventoryItem) {
      alert("สินค้าจากสาขานี้ไม่มีในตะกร้า");
      return;
    }

    if (productInCart) {
      if (productInCart.branchid !== selectedBranch) {
        alert("ไม่สามารถเพิ่มสินค้าจากสาขาที่ต่างกัน");
        return;
      }
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
    const updatedCart = cart.map(item =>
      item.productid === productid ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    updateTotalAmount();
  };

  const updateTotalAmount = () => {
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
    });
    setTotalAmount(total);
  };

  const handleCheckout = async () => {
    if (!selectedBranch) {
      alert("โปรดเลือกสาขาก่อน");
      return;
    }
    const saleItems = cart.map(item => ({
      productid: item.productid,
      quantity: item.quantity,
      price: item.price,
      totalprice: item.price * item.quantity,
    }));
    const saleData = {
      employeeid: "8a714024-471a-420f-8abb-46509d0cd74e",  // Fixed employee ID
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

  const filterInventoryByBranch = () => {
    return inventory.filter(item => item.branchid === selectedBranch);
  };

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-black mb-4">Sales Product</h1>

      {/* Select branch dropdown */}
      {!selectedBranch && (
        <div className="mb-4">
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className="border p-2 rounded"
          >
            <option value="" disabled>Select Branch</option>
            {branches.map(branch => (
              <option key={branch.branchid} value={branch.branchid}>
                {branch.bname}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Show products only after selecting a branch */}
      {selectedBranch && (
        <div className="flex">
          <div className="w-4/5">
            <h2 className="text-xl font-bold mb-4">Products</h2>
            <div className="grid grid-cols-4 gap-4">
              {products.map((product) => {
                const inventoryItem = inventory.find(item => item.productid === product.productid && item.branchid === selectedBranch);
                return (
                  <div key={product.productid} className="border p-4 rounded flex flex-col items-center">
                    <img src="https://via.placeholder.com/150" alt="Product" className="w-24 h-24 mb-2" />
                    <div className="font-bold">{product.productname}</div>
                    <div className="text-sm">Price: ${product.price}</div>
                    <button
                      onClick={() => handleAddToCart(product, 1)}
                      className="mt-2 text-white bg-teal-500 p-2 rounded"
                      disabled={!inventoryItem}
                    >
                      {inventoryItem ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                );
              })}
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
                      onChange={(e) => handleQuantityChange(item.productid, parseInt(e.target.value))}
                      className="w-16 border p-1 rounded"
                      min="1"
                    />
                    <span className="ml-2">{item.quantity} x ${item.price} = ${item.price * item.quantity}</span>
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
      )}
    </div>
  );
};

export default SalesPage;
