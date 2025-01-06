import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "../components/layout/ui/ProductForm";
import ExportButtons from "../components/layout/ui/ExportButtons";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันดึงข้อมูลสินค้า
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5050/products");
      setProducts(response.data.Data); // ตั้งค่าข้อมูลที่ได้จาก API
      setLoading(false);
    } catch (err) {
      setError("Failed to load products");
      setLoading(false);
    }
  };

  // ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async (productId) => {
    try {
      const response = await axios.delete(`http://localhost:5050/products/${productId}`);
      if (response.status === 200) {
        // หากการลบสำเร็จ รีเฟรชข้อมูลสินค้า
        fetchProducts();
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // รีเฟรชข้อมูลสินค้าเมื่อมีการเพิ่มสินค้าใหม่
  const handleProductAdded = () => {
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-black mb-4">Product</h1>
      <p className="text-black mb-4">Manage your Product here.</p>

      <div className="flex space-x-4 mb-4">
        <ProductForm onProductAdded={handleProductAdded} />
        <ExportButtons filteredProducts={products} />
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full table-striped">
          <thead>
            <tr>
              <th className="text-black">Name</th>
              <th className="text-black">Description</th>
              <th className="text-black">Price</th>
              <th className="text-black">Actions</th> {/* เพิ่มคอลัมน์ Actions สำหรับปุ่มลบ */}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productid}>
                <td className="text-black">{product.productname}</td>
                <td className="text-black">{product.description}</td>
                <td className="text-black">{product.price}</td>
                <td className="text-black">
                  {/* ปุ่มลบ */}
                  <button
                    onClick={() => handleDeleteProduct(product.productid)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductPage;
