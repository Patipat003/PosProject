import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "../components/layout/ui/ProductForm";
import EditedProduct from "../components/layout/ui/EditedProduct";
import ExportButtons from "../components/layout/ui/ExportButtons";
import SortByDropdown from "../components/layout/ui/SortByDropdown"; // Import SortByDropdown
import { format } from "date-fns";

// ฟังก์ชันสำหรับแปลงวันที่ให้เป็นรูปแบบที่อ่านง่าย (ไม่มีวินาที)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "d/MM/yyyy, HH:mm"); // ใช้ format ที่ไม่มีวินาที
};

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("productname");
  const [sortDirection, setSortDirection] = useState("asc");

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

  // รีเฟรชข้อมูลสินค้าเมื่อมีการแก้ไขสินค้า
  const handleEditedProduct = () => {
    fetchProducts();
  };

  // ฟังก์ชันสำหรับการเปลี่ยนแปลงการเรียงลำดับ
  const handleSortChange = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);

    const sortedData = [...products].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setProducts(sortedData);
  };

  const sortOptions = [
    { key: "productname", label: "Product Name" },
    { key: "price", label: "Price" },
    { key: "createdat", label: "Created At" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const columns = ["productname", "description", "price", "createdat"]; // Define columns for export

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-black mb-4">Product</h1>
      <p className="text-black mb-4">Manage your Product here.</p>

      <div className="flex space-x-4 mb-4">
        <ProductForm onProductAdded={handleProductAdded} />
        <ExportButtons filteredTables={products} columns={columns} filename="products.pdf" />
      </div>

      {/* Add SortByDropdown for sorting */}
      <SortByDropdown
        onSortChange={handleSortChange}
        currentSortKey={sortKey}
        currentSortDirection={sortDirection}
        sortOptions={sortOptions}
      />

      <div className="overflow-x-auto">
        <table className="table w-full table-striped">
          <thead>
            <tr>
              <th className="text-black">Name</th>
              <th className="text-black">Description</th>
              <th className="text-black">Price</th>
              <th className="text-black">Create Date</th>
              {/* <th className="text-black">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productid}>
                <td className="text-black">{product.productname}</td>
                <td className="text-black">{product.description}</td>
                <td className="text-black">{product.price}</td>
                <td className="text-black">{formatDate(product.createdat)}</td>
                <td className="text-black flex space-x-2">
                  <button
                    onClick={() => handleDeleteProduct(product.productid)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
                <td className="text-black">
                  <EditedProduct
                    productId={product.productid} // ส่ง ID ของสินค้า
                    onProductUpdated={fetchProducts} // ฟังก์ชันสำหรับรีเฟรชข้อมูล
                  />
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
