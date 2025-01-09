import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa"; // นำเข้าไอคอนลบ

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
    setCart([]);
    setTotalAmount(0);
  };

  const handleAddToCart = (product) => {
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
  
    if (inventoryItem.quantity === 0) {
      alert("Out of stock");
      return;
    }
  
    // อัปเดต cart
    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) => item.productid === product.productid
      );
  
      if (existingProduct) {
        return prevCart.map((item) =>
          item.productid === product.productid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, branchid: selectedBranch }];
      }
    });
  };

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  }, [cart]);

  const handleRemoveFromCart = (productid) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.productid !== productid);
      return newCart;
    });
    updateTotalAmount();
  };

  const handleQuantityChange = (productid, newQuantity) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.productid === productid
          ? { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }
          : item
      );
      return updatedCart.filter(item => item.quantity > 0);
    });
    updateTotalAmount();
  };

  const handleIncreaseQuantity = (productid) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.productid === productid ? { ...item, quantity: item.quantity + 1 } : item
      );
      return updatedCart;
    });
    updateTotalAmount();
  };

  const handleDecreaseQuantity = (productid) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.productid === productid && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      return updatedCart.filter(item => item.quantity > 0);
    });
    updateTotalAmount();
  };

  const updateTotalAmount = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  };

  const handleCheckout = async () => {
    if (!selectedBranch) {
      alert("Select branch before checkout");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty, select some products to checkout");
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
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Sales Product</h1>
      <div className="flex">
        <div className="w-4/5 mr-6">
          <p className="text-black mb-4">Product Lists</p>
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
                    onClick={() => handleAddToCart(product)}
                    className={`card border border-slate-300 shadow-xl p-4 flex flex-col justify-between items-center transition-transform transform hover:border-teal-700 scale-105 ${
                      stock === 0 ? "opacity-50" : ""
                    }`}
                  >
                    <figure className="flex justify-center items-center h-2/3 w-full">
                      <img
                        src={product.imageurl}
                        alt={product.productname}
                        className="max-h-full max-w-full"
                      />
                    </figure>
                    <div className="text-center my-2">
                      <h2 className="text-black font-semibold text-sm">
                        {product.productname}
                      </h2>
                      <p className="text-sm font-semibold text-black">
                        ฿{product.price}
                      </p>
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
          <div className="flex justify-end mb-6">
            <select
              id="branch-select"
              value={selectedBranch}
              onChange={handleBranchChange}
              className="w-2/3 bg-white border border-gray-300 text-gray-500 font-semibold p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 ease-in-out"
            >
              <option value="all" className="text-gray-500">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.branchid} value={branch.branchid} className="text-gray-500">
                  {branch.bname}
                </option>
              ))}
            </select>
          </div>

          <h3 className="text-xl text-black font-bold mb-4">Your Cart</h3>
          <div div className="border p-6 rounded h-96 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.productid} className="text-black mb-6">
                <div className="mb-2 font-semibold text-teal-600">
                  {item.productname}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black justify-end mr-2">
                    ฿{item.price}
                  </span>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleDecreaseQuantity(item.productid)}
                      className="text-teal-600 text-xl bg-white w-10 h-8 flex justify-center items-center border border-2 p-1 rounded-l"
                    >
                      -
                    </button>
                    <input
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.productid, parseInt(e.target.value) || 1)
                      }
                      className="text-black text-center bg-white w-14 h-8 border border-2 p-1 mx-0"
                      min="1"
                    />
                    <button
                      onClick={() => handleIncreaseQuantity(item.productid)}
                      className="text-teal-600 text-xl bg-white w-10 h-8 flex justify-center items-center border border-2 p-1 rounded-r"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-teal-600 justify-end ml-2">
                    ฿{item.price * item.quantity}
                  </span>
                  {/* เพิ่มไอคอนลบที่นี่ */}
                  <button
                    onClick={() => handleRemoveFromCart(item.productid)}
                    className="text-red-500 ml-2"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4 text-black text-base font-bold">
              Total: ฿{totalAmount}
            </div>
            <button
              onClick={handleCheckout}
              className="btn border-none mt-4 w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 transition duration-300 mt-4"
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
