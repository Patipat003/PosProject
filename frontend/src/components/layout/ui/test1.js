import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import PaymentModal from "../components/layout/ui/PaymentModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [employee, setEmployee] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      const decodedToken = jwtDecode(token);
      setEmployee(decodedToken);

      if (!decodedToken.employeeid) {
        console.log("Employee ID not found in token");
      }
    } else {
      alertMessage("You need to log in to access this page");
      window.location.href = "/login";
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token found");

      const [productRes, branchRes, inventoryRes, categoryRes] = await Promise.all([
        axios.get("${API_BASE_URL}/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("${API_BASE_URL}/branches", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("${API_BASE_URL}/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("${API_BASE_URL}/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProducts(productRes.data.Data);
      setInventory(inventoryRes.data.Data);
      setCategories(categoryRes.data.Data);
      const filteredBranches = branchRes.data.Data.filter(
        (branch) => branch.branchid === employee?.branchid
      );
      setBranches(filteredBranches);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    if (employee) {
      fetchData();
    }
  }, [employee]);

  const handleBranchChange = (event) => {
    const branchId = event.target.value;
    setSelectedBranch(branchId);
    setCart([]);
    setTotalAmount(0);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filterInventoryByProduct = () => {
    if (!selectedBranch) return [];

    return products.filter((product) => {
      const inInventory = inventory.some(
        (item) => item.productid === product.productid && item.branchid === selectedBranch
      );
      const inCategory =
        !selectedCategory || product.categoryid === selectedCategory;
      const matchesSearchQuery =
        !searchQuery || product.productcode.toLowerCase().includes(searchQuery.toLowerCase());

      return inInventory && inCategory && matchesSearchQuery;
    });
  };

  const handleAddToCart = (product) => {
    if (!selectedBranch) {
      setAlertMessage("Please select a branch first");
      return;
    }

    const inventoryItem = inventory.find(
      (item) => item.productid === product.productid && item.branchid === selectedBranch
    );

    if (!inventoryItem || inventoryItem.quantity === 0) {
      setAlertMessage("Out of stock");
      return;
    }

    const existingProduct = cart.find((item) => item.productid === product.productid);
    const maxQuantity = inventoryItem.quantity;

    if (existingProduct) {
      if (existingProduct.quantity >= maxQuantity) {
        toast.error(`Cannot increase quantity beyond ${inventoryItem.quantity}.`, {
          position: "top-right",
          autoClose: 2000,  // Toast จะหายหลังจาก 2 วินาที
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productid === product.productid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (maxQuantity === 0) {
        setAlertMessage("Out of stock");
        setTimeout(() => {
          setAlertMessage("");
        }, 2000);
        return;
      }
      setCart((prevCart) => [
        ...prevCart,
        { ...product, quantity: 1, branchid: selectedBranch },
      ]);
    }

    setAlertMessage("");
  };

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  }, [cart]);

  const handleCheckout = () => {
    if (!selectedBranch) {
      setAlertMessage("Select branch before checkout");
      setTimeout(() => {
        setAlertMessage("");
      }, 2000);
      return;
    }

    if (cart.length === 0) {
      setAlertMessage("Your cart is empty, select some products to checkout");
      setTimeout(() => {
        setAlertMessage("");
      }, 2000);
      return;
    }

    setCart([]);
    setTotalAmount(0);
  };

  const handleIncreaseQuantity = (productId) => {
    const productInCart = cart.find((item) => item.productid === productId);
  
    if (!productInCart) return;
  
    const inventoryItem = inventory.find(
      (item) => item.productid === productInCart.productid && item.branchid === selectedBranch
    );
  
    if (inventoryItem && productInCart.quantity >= inventoryItem.quantity) {
      toast.error(`Cannot increase quantity beyond ${inventoryItem.quantity}.`, {
        position: "top-right",
        autoClose: 2000,  // Toast จะหายหลังจาก 2 วินาที
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
  
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productid !== productId));
  };

  const handleContinue = () => {
    // ตรวจสอบว่า cart มีข้อมูลหรือไม่
    if (cart.length === 0) {
      // ถ้าไม่มีสินค้าในตะกร้า ให้แสดง Toast
      toast.error("Your cart is empty! Please add items before proceeding.");
      return; // หยุดการทำงานถ้า cart ว่าง
    }
  
    // เก็บข้อมูลใน localStorage
    localStorage.setItem("cartData", JSON.stringify(cart));
  
    // เปิด Modal
    setIsModalOpen(true);
  };

  // ฟังก์ชันสำหรับล้างสินค้าทั้งหมดในตะกร้า
  const handleClearCart = () => {
    setCart([]);
    setTotalAmount(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-red-600 mb-10">Sales Product</h1>

      {alertMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
          {alertMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-4/5 mr-6">
          <div className="flex justify-between mb-6">
            <select
              id="category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-2/3 bg-white border border-gray-300 text-gray-500 font-semibold p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.categoryid} value={category.categoryid}>
                  {category.categoryname}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="🔍 Search by product code"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-1/3 bg-white border border-gray-300 text-gray-500 font-semibold p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>

          {/* Product List */}
          <p className="text-gray-600 mb-6">Product Lists</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedBranch ? (
              filterInventoryByProduct().map((product) => {
                const stock =
                  inventory.find(
                    (item) => item.productid === product.productid && item.branchid === selectedBranch
                  )?.quantity || 0;
                return (
                  <button
                    key={product.productid}
                    onClick={() => handleAddToCart(product)}
                    className={`card border border-slate-300 shadow-xl p-4 flex flex-col justify-between items-center transition-transform transform hover:border-red-700 scale-105 ${stock === 0 ? "opacity-50" : ""}`}
                  >
                    <figure className="flex justify-center items-center h-2/3 w-full">
                      <img
                        src={product.imageurl}
                        alt={product.productname}
                        className="max-h-full max-w-full"
                      />
                    </figure>
                    <div className="text-center my-2">
                      <h2 className="text-gray-600 font-semibold text-sm">{product.productname}</h2>
                      <p className="text-sm text-gray-600 mt-1">฿{product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600 mt-1">Stock: {stock}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center col-span-5">Please select a branch to view products.</p>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-2/5">
          <div className="flex justify-end mb-6">
            <select
              id="branch-select"
              value={selectedBranch || ""}
              onChange={handleBranchChange}
              className="w-2/3 bg-white border border-gray-300 text-gray-500 font-semibold p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            >
              <option value="" className="text-gray-500">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.branchid} value={branch.branchid}>
                  {branch.bname}
                </option>
              ))}
            </select>
          </div>
          
          {/* Your cart */}
          <div className="border-2 border-red-500 p-6 rounded rounded-lg mb-6 sticky top-0 bg-white">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl text-gray-600 font-semibold">Your Cart</h3>
              <button
                  onClick={handleClearCart}
                  className="text-red-600 flex items-center gap-2 font-semibold"
                >
                  <FaTrashAlt />
                  Clear All
                </button>
              </div>
            <div className="border p-6 rounded h-96 overflow-y-auto mb-6">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500">Your cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productid} className="text-gray-600 mb-6">
                    <div className="mb-2 font-semibold text-red-600">
                      {item.productname}
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-gray-600 justify-end mr-2 mt-2">฿{item.price.toFixed(2)}</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleDecreaseQuantity(item.productid)}
                        className="text-red-600 text-xl bg-white w-10 h-8 flex justify-center items-center border border-2 p-1 rounded-l"
                      >
                        -
                      </button>
                      <input
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.productid, parseInt(e.target.value) || 1)
                        }
                        className="text-gray-600 text-center bg-white w-14 h-8 border border-2 p-1 mx-0"
                        min="1"
                      />
                      <button
                        onClick={() => handleIncreaseQuantity(item.productid)}
                        className="text-red-600 text-xl bg-white w-10 h-8 flex justify-center items-center border border-2 p-1 rounded-r"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.productid)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Total</h3>
              <div className="flex justify-between">
                <p className="text-xl text-gray-600">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
                <p className="text-xl text-gray-600">
                  {totalAmount.toFixed(2)} THB
                </p>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <button
                onClick={handleContinue}
                className="btn w-full bg-red-800 text-white border-none font-semibold text-base py-2 rounded-lg hover:bg-red-900 transition"
              >
                Continue
              </button>
            </div>
          </div>
      </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalAmount={totalAmount}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default SalesPage;
