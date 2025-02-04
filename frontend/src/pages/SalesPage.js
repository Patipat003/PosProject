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
  const [searchQuery, setSearchQuery] = useState(""); // เพิ่ม state สำหรับค้นหา
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [employee, setEmployee] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ฟังก์ชันเพื่อกรองผลิตภัณฑ์
  const filterInventoryByProduct = () => {
    if (!selectedBranch) return [];

    return products.filter((product) => {
      const inInventory = inventory.some(
        (item) => item.productid === product.productid && item.branchid === selectedBranch
      );
      const inCategory =
        !selectedCategory || product.categoryid === selectedCategory;
      const matchesSearchQuery = product.productcode
        .toLowerCase()
        .includes(searchQuery.toLowerCase()); // ค้นหาตาม product code
      return inInventory && inCategory && matchesSearchQuery;
    });
  };

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
        axios.get("http://localhost:5050/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5050/branches", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5050/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5050/categories", {
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleBranchChange = (event) => {
    const branchId = event.target.value;
    setSelectedBranch(branchId);
    setCart([]);
    setTotalAmount(0);
  };

  const handleClearCart = () => {
    setCart([]);
    setTotalAmount(0); // Reset the total amount
    toast.info("Your cart has been cleared");
  };
  

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-10">Sales Product</h1>

      {alertMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
          {alertMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-4/5 mr-6">
          <div className="flex justify-between mb-6 space-x-4">
            {/* ช่องค้นหาผลิตภัณฑ์ */}
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by product code"
              className="w-2/3 bg-white border border-gray-300 text-gray-500 font-semibold p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
            {/* ช่องกรองตาม category */}
            <select
              id="category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-2/3 bg-white border border-gray-300 text-gray-500 font-semibold p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.categoryid} value={category.categoryid}>
                  {category.categoryname}
                </option>
              ))}
            </select>
          </div>

          {/* Product List */}
          <p className="text-black mb-6">Product Lists</p>
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
                    className={`card border border-slate-300 shadow-xl p-4 flex flex-col justify-between items-center transition-transform transform hover:border-teal-700 scale-105 ${stock === 0 ? "opacity-50" : ""}`}
                  >
                    <figure className="flex justify-center items-center h-2/3 w-full">
                      <img
                        src={product.imageurl}
                        alt={product.productname}
                        className="max-h-full max-w-full"
                      />
                    </figure>
                    <div className="text-center my-2">          
                      <h2 className="text-black font-semibold text-sm">{product.productname}</h2>
                      <p className="text-sm text-black mt-1">฿{product.price.toFixed(2)}</p>
                      <p className="text-sm text-black mt-1">Stock: {stock}</p>
                      <p className="text-gray-600 text-xs mt-2">{product.productcode}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center col-span-5">Please select a branch to view products.</p>
            )}
          </div>
        </div>

        <div className="w-2/5">
          <div className="flex justify-end mb-6">
            <select
              id="branch-select"
              value={selectedBranch || ""}
              onChange={handleBranchChange}
              className="w-2/3 bg-white border border-gray-300 text-gray-500 font-semibold p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
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
          <div className="border-2 border-teal-500 p-6 rounded rounded-lg mb-6 sticky top-0 bg-white">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl text-black font-semibold">Your Cart</h3>
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
                  <div key={item.productid} className="text-black mb-6">
                    <div className="mb-2 font-semibold text-teal-600">
                      {item.productname}
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-black justify-end mr-2 mt-2">฿{item.price.toFixed(2)}</span>
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
            <div className="flex justify-between mb-4">
              <div className="text-teal-600 font-semibold text-xl">Total Amount</div>
              <div className="text-teal-600 font-semibold text-xl">
                ฿{totalAmount.toFixed(2)}
              </div>
            </div>
            <button
              onClick={openModal}
              className={`w-full p-3 bg-teal-600 text-white rounded-lg mt-6 hover:bg-teal-700 ${
                cart.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={cart.length === 0}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && <PaymentModal closeModal={closeModal} />}
      <ToastContainer />
    </div>
  );
};

export default SalesPage;
