import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "../components/layout/ui/ProductForm";
import EditedProduct from "../components/layout/ui/EditedProduct";
import ExportButtons from "../components/layout/ui/ExportButtons";
import SortByDropdown from "../components/layout/ui/SortByDropdown";
import { format } from "date-fns";
import { TrashIcon, PencilIcon } from "@heroicons/react/outline";

// ฟังก์ชันสำหรับแปลงวันที่ให้เป็นรูปแบบที่อ่านง่าย (ไม่มีวินาที)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "d/MM/yyyy, HH:mm"); // ใช้ format ที่ไม่มีวินาที
};

const ProductPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("productname");
  const [sortDirection, setSortDirection] = useState("asc");

  // ฟังก์ชันดึงข้อมูลสินค้าและสต็อก
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken"); // หยิบ token จาก localStorage
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // แนบ token ไปกับ header ของคำขอ
        },
      };

      const [productResponse, inventoryResponse] = await Promise.all([
        axios.get("http://localhost:5050/products", config),
        axios.get("http://localhost:5050/inventory", config),
      ]);

      const inventoryMap = {};
      inventoryResponse.data.Data.forEach((item) => {
        inventoryMap[item.productid] = item.quantity; // เก็บข้อมูล quantity ตาม product
      });

      setProducts(productResponse.data.Data);
      setInventory(inventoryMap);
      setLoading(false);
    } catch (err) {
      setError("Failed to load products or inventory data");
      setLoading(false);
    }
  };

  // ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await axios.delete(`http://localhost:5050/products/${productId}`);
        if (response.status === 200) {
          // หากการลบสำเร็จ รีเฟรชข้อมูลสินค้า
          fetchProducts();
        }
      } catch (err) {
        console.error("Error deleting product:", err);
      }
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
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Product Management</h1>
      <p className="text-black mb-4">Manage your Product here.</p>

      {/* Product List */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Search for products"
            className="border bg-white border-gray-300 p-2 rounded w-full mr-2"
          />
          <button className="btn border-none text-white bg-teal-500 px-4 py-2 rounded hover:bg-teal-600">
            Search
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.productid} // ใช้ product.productid แทน
              className="border border-gray-300 p-4 rounded flex flex-col items-center cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="w-24 h-24 bg-gray-200 mb-2 rounded">
                <img
                  src={product.imageurl} // ดึงจากฐานข้อมูล
                  alt={product.productname}  // ใช้ productname แทน name
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="text-black text-lg font-bold">{product.code}</div>
              <div className="text-black text-sm mb-2 font-semibold">{product.productname}</div>
              <div className="text-black text-sm">Price : ฿{product.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold text-teal-600 my-4">Product Table</h2>
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

        <table className="table w-full table-striped">
          <thead>
            <tr>
              <th className="text-black">Name</th>
              <th className="text-black">Description</th>
              <th className="text-black">Price</th>
              <th className="text-black">Create Date</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productid}> {/* ใช้ product.productid แทน */}
                <td className="text-black">{product.productname}</td>
                <td className="text-black">
                  {product.description.length > 50
                  ? product.description.substring(0, 50) + "..."
                  : product.description}
                </td>
                <td className="text-black">{product.price.toFixed(2)}</td>
                <td className="text-black">{formatDate(product.createdat)}</td>
                <td>
                  <button
                    onClick={() => handleDeleteProduct(product.productid)} // ใช้ product.productid
                    className="hover:border-b-2 border-gray-400 transition duration-30"
                  >
                    <TrashIcon className="text-red-600 h-6 w-6" />
                  </button>
                </td>
                <td>
                  <EditedProduct
                    productId={product.productid} // ใช้ product.productid
                    onProductUpdated={fetchProducts} // Function to refresh products after editing
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
