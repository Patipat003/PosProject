import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ModalStockLow = ({ closeModal }) => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [branchId, setBranchId] = useState(null);

  // ดึงข้อมูลจาก token
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

      setInventory(response.data.Data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  useEffect(() => {
    getBranchIdFromToken();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (branchId) {
      fetchInventory();  // เรียกข้อมูลสต็อกเมื่อมี branchId
    }
  }, [branchId]);

  useEffect(() => {
    if (branchId && inventory.length > 0 && products.length > 0) {
      // กรองสินค้าตาม branchId และ stock ที่ต่ำกว่า 10
      const filtered = products.filter((product) => {
        // หาผลิตภัณฑ์ที่มีในสต็อก
        const stock = inventory.find(item => item.productid === product.productid && item.branchid === branchId);
        if (stock && stock.quantity <= 10) {
          return true; // แสดงผลิตภัณฑ์ที่มีสต็อกต่ำกว่า 10
        }
        return false;
      });
      setFilteredProducts(filtered);
    }
  }, [branchId, inventory, products]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl text-gray-600 font-semibold mb-4">Low Stock Products</h2>
        {filteredProducts.length === 0 ? (
            <p>No products with low stock in your branch.</p>
            ) : (
            <ul>
                {filteredProducts.map((product) => {
                // หาสินค้าในสต็อก
                const stock = inventory.find(item => item.productid === product.productid && item.branchid === branchId);
                return (
                    <li key={product.productid} className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{product.productname}</span>
                    <span className="text-red-500">{stock ? stock.quantity : 0} left</span> {/* แสดงจำนวนจาก stock */}
                    </li>
                );
                })}
            </ul>
            )}

        <button
          onClick={closeModal}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ModalStockLow;
