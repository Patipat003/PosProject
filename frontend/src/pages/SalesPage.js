import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]); // เพิ่ม state สำหรับ Category
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(""); // เพิ่ม state สำหรับ Category ที่เลือก
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [employee, setEmployee] = useState(null);
  const [alertMessage, setAlertMessage] = useState(""); // เพิ่ม state สำหรับข้อความแจ้งเตือน

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
        }), // ดึงข้อมูล Category
      ]);

      setProducts(productRes.data.Data);
      setInventory(inventoryRes.data.Data);
      setCategories(categoryRes.data.Data); // ตั้งค่า Categories
      const filteredBranches = branchRes.data.Data.filter((branch) => branch.branchid === employee?.branchid);
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
    setSelectedCategory(event.target.value); // กำหนด Category ที่เลือก
  };

  const filterInventoryByProduct = () => {
    if (!selectedBranch) return [];

    return products.filter((product) => {
      const inInventory = inventory.some(
        (item) => item.productid === product.productid && item.branchid === selectedBranch
      );
      const inCategory =
        !selectedCategory || product.categoryid === selectedCategory; // กรองตาม Category
      return inInventory && inCategory;
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

    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.productid === product.productid);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.productid === product.productid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, branchid: selectedBranch }];
    });

    setAlertMessage("");
  };

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  }, [cart]);

  const handleCheckout = async () => {
    if (!selectedBranch) {
      alertMessage("Select branch before checkout");
      return;
    }

    if (cart.length === 0) {
      alertMessage("Your cart is empty, select some products to checkout");
      return;
    }

    const saleItems = cart.map((item) => ({
      productid: item.productid,
      quantity: item.quantity,
      price: item.price,
      totalprice: item.price * item.quantity,
    }));

    const saleData = {
      employeeid: employee?.employeeid, // ใช้ employeeid ที่ดึงมาจาก token
      branchid: selectedBranch,         // ใช้ branchid ที่เลือกจากตัวเลือก
      saleitems: saleItems,             // รายการสินค้าในตะกร้า
      totalamount: totalAmount,         // จำนวนเงินทั้งหมด
    };

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token found");
      console.log(saleData);  // ดูข้อมูลที่ส่งไป

      await axios.post("http://localhost:5050/sales", saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Sale completed successfully!");
      setCart([]);  // เคลียร์ตะกร้า
      setTotalAmount(0);  // เคลียร์จำนวนเงิน
    } catch (err) {
      console.error("Error during sale", err);
      alert("Failed to complete the sale.");
    }
  };

  // ฟังก์ชันสำหรับการเพิ่ม/ลดจำนวนสินค้า
  const handleIncreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId
          ? { ...item, quantity: item.quantity + 1 } // เพิ่มจำนวนสินค้า
          : item
      )
    );
  };

  const handleDecreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 } // ลดจำนวนสินค้า (หากไม่เป็น 1)
          : item
      )
    );
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productId
          ? { ...item, quantity: newQuantity } // เปลี่ยนแปลงจำนวนสินค้าตามที่กรอก
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productid !== productId)); // ลบสินค้าออกจากตะกร้า
  };

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-10">Sales Product</h1>
      
      {/* แสดงข้อความแจ้งเตือน */}
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
          <p className="text-black mb-6">Product Lists</p>
          <div className="grid grid-cols-4 gap-4">
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
                    <h2 className="text-black font-semibold text-sm">
                      {product.productname}
                    </h2>
                    <p className="text-sm text-black mt-1">฿{product.price.toFixed(2)}</p>
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

          <div className="border-2 border-teal-500 p-6 rounded rounded-lg mb-6 sticky top-20 bg-white">
            <h3 className="text-xl text-black font-semibold mb-4">Your Cart</h3>
            <div className="border p-6 rounded h-96 overflow-y-auto mb-6">
              {cart.map((item) => (
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
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-black">Total Amount :</span>
              <span className="font-semibold text-black">฿{totalAmount}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-teal-700 transition"
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
