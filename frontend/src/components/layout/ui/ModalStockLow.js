import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify"; // Import toast
import { AnimatePresence, motion } from "framer-motion"; // Import framer-motion for animation

const ModalStockLow = ({ closeModal }) => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [quantity, setQuantity] = useState(0); // ใช้สำหรับเก็บจำนวนสินค้า
  const [selectedProduct, setSelectedProduct] = useState(null); // เก็บสินค้าที่เลือก
  const [showQuantityModal, setShowQuantityModal] = useState(false); // New state to control quantity modal visibility

  // ดึง branch ID จาก token
  const getBranchIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setBranchId(decodedToken.branchid);
    }
  };

  // ดึงข้อมูลผลิตภัณฑ์จาก API
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get("http://localhost:5050/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Products data:", response.data); // แสดงข้อมูลผลิตภัณฑ์ในคอนโซล
      setProducts(response.data.Data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // ดึงข้อมูลสต็อกจาก API
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(`http://localhost:5050/inventory?branchid=${branchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Inventory data:", response.data); // แสดงข้อมูลสต็อกในคอนโซล
      setInventory(response.data.Data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  // ฟังก์ชันสำหรับส่งคำขอสินค้า
  const handleRequest = async () => {
    if (selectedProduct && quantity > 0) {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const requestData = {
        productid: selectedProduct.productid,
        quantity: parseInt(quantity, 10),
        tobranchid: branchId,
      };

      console.log("Request JSON:", requestData);

      try {
        const response = await axios.post("http://localhost:5050/requests/auto", requestData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Request response:", response.data);
        if (response.status === 200) {
          toast.success("Request sent successfully!");
          closeModal();
        } else {
          toast.error("Failed to send request. Please try again.");
        }
      } catch (error) {
        toast.error("Error sending request: " + error.message);
        console.error("Error sending request:", error);
      }
    } else {
      toast.error("Invalid product or quantity. Please check your input.");
      console.error("Invalid product or quantity");
    }
  };

  // กรองสินค้าสต็อกต่ำ
  const filterLowStockProducts = () => {
    if (branchId && inventory.length > 0 && products.length > 0) {
      const filtered = products.filter((product) => {
        const stock = inventory.find(
          (item) => item.productid === product.productid && item.branchid === branchId
        );
        return stock && stock.quantity < 100; // กำหนดสต็อกต่ำเป็น 100
      });
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    getBranchIdFromToken();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (branchId) {
      fetchInventory();
    }
  }, [branchId]);

  useEffect(() => {
    filterLowStockProducts();
  }, [branchId, inventory, products]);

  useEffect(() => {
      fetchInventory();
      fetchProducts();
    
      // Poll every 5 seconds
      const interval = setInterval(() => {
        fetchInventory();
        fetchProducts();
      }, 5000);
    
      return () => clearInterval(interval); // Clean up the interval on component unmount
    }, []); 

  return (
    <AnimatePresence>
      {/* Animation for the modal opening */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={closeModal} // ปิด Modal เมื่อคลิกด้านนอก
      >
        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // ป้องกันการคลิกด้านในปิด Modal
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl text-gray-600 font-semibold mb-4">
            Low Stock Products
          </h2>

          <p className="text-gray-600 mb-6">
            You are viewing products with low stock in your branch. These are the items with less than 100 units remaining. You can submit a request to replenish stock by clicking on the "Request Inventory" button for each product.
          </p>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products with low stock in your branch.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const stock = inventory.find(
                  (item) => item.productid === product.productid && item.branchid === branchId
                );
                return (
                  <div
                    key={product.productid}
                    className="flex flex-col py-4 px-6 border rounded-lg border-gray-300 bg-white h-60"
                  >
                    <div className="flex-grow flex flex-col items-center justify-center">
                      <img
                        src={product.imageurl}
                        alt={product.productname}
                        className="w-16 h-16 object-cover mb-2 rounded mx-auto"
                      />
                      <span className="block text-gray-700 font-semibold text-center truncate w-36">{product.productname}</span>
                      <span className="block text-gray-500 text-sm text-center">Stock: {stock ? stock.quantity : 0} left</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowQuantityModal(true); // Show quantity modal when a product is clicked
                      }}
                      className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
                    >
                      Request Inventory
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal to enter quantity */}
          {showQuantityModal && selectedProduct && (
            <AnimatePresence>
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-white p-8 rounded-lg shadow-lg w-92"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-gray-700 font-semibold mb-2">Enter Quantity</h3>
                  <h2 className="text-gray-700 mb-4"> {selectedProduct.productname}</h2>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input text-gray-600 bg-white p-4 border-gray-300 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                    min="1"
                  />
                  <div className="space-x-4 justify-end">
                    <button
                      onClick={handleRequest}
                      className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={() => setShowQuantityModal(false)}
                      className="btn border-none bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition duration-300 mt-4"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}


          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={closeModal}
              className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300 mt-4"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalStockLow;
