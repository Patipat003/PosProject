import React, { useState, useEffect } from "react";
import axios from "axios";

const SalesHistoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("authToken"); // ดึง Token จาก Local Storage
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // ใส่ Token ใน Header
          },
        };

        // ดึงข้อมูลจาก API
        const response = await axios.get("http://localhost:5050/products", config);
        console.log("API Response:", response.data); // Log ข้อมูลเพื่อตรวจสอบ
        setProducts(response.data.Data || []); // ตรวจสอบว่ามีข้อมูล Data หรือไม่
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Sales History</h1>
      {/* ตารางแสดงข้อมูล */}
      <table className="border border-collapse w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Product Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Units per Box</th>
            <th className="border p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td className="border p-2">{product.productname }</td>
              <td className="border p-2">{product.description }</td>
              <td className="border p-2">{product.price }</td>
              <td className="border p-2">{product.unitsperbox }</td>
              <td className="border p-2">
                {product.createdat
                  ? new Date(product.createdat).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesHistoryPage;
