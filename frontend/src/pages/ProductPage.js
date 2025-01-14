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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // New state for category
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 10; // จำนวนรายการต่อหน้า
  const [currentProductPage, setCurrentProductPage] = useState(1);

  // ฟังก์ชันดึงข้อมูลสินค้าและสต็อก
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken"); // หยิบ token จาก localStorage
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // แนบ token ไปกับ header ของคำขอ
        },
      };

      const [productResponse, inventoryResponse, categoryResponse] = await Promise.all([
        axios.get("http://localhost:5050/products", config),
        axios.get("http://localhost:5050/inventory", config),
        axios.get("http://localhost:5050/categories", config),
      ]);

      const inventoryMap = {};
      inventoryResponse.data.Data.forEach((item) => {
        inventoryMap[item.productid] = item.quantity; // เก็บข้อมูล quantity ตาม product
      });

      setProducts(productResponse.data.Data);
      setInventory(inventoryMap);
      setCategories(categoryResponse.data.Data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load products or inventory data");
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับการเปลี่ยนแปลงการเลือก category
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const matchesSearch = (item) => {
    return searchQuery
      ? products[item.productid]?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
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

  // ฟังก์ชันสำหรับ pagination
  const totalProductPages = Math.ceil(products.length / itemsPerPage);

  const getPaginatedProducts = () => {
    const startIndex = (currentProductPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  };

  const handlePreviousPageProduct = () => {
    if (currentProductPage > 1) {
      setCurrentProductPage(currentProductPage - 1);
    }
  };

  const handleNextPageProduct = () => {
    if (currentProductPage < totalProductPages) {
      setCurrentProductPage(currentProductPage + 1);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryid === categoryId);
    return category ? category.categoryname : "Unknown";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryid === selectedCategory)
    : products;

  const paginatedProducts = getPaginatedProducts();
  const columns = ["productname", "description", "price", "createdat"]; // Define columns for export

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Product Management</h1>
      <p className="text-black mb-4">Manage your Product here.</p>

      {/* Category Dropdown */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="select bg-white text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for products"
            className="border bg-white border-gray-300 p-2 rounded w-full mr-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <button className="btn border-none text-white bg-teal-500 px-4 py-2 rounded hover:bg-teal-600">
            Search
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {filteredProducts
            .filter((product) =>
              searchQuery
                ? product.productname.toLowerCase().includes(searchQuery.toLowerCase())
                : true
            )
            .map((product) => (
              <div
                key={product.productid}
                className="border border-gray-300 p-4 rounded flex flex-col items-center cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="w-24 h-24 bg-gray-200 mb-2 rounded">
                  <img
                    src={product.imageurl}
                    alt={product.productname}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="text-gray-600 text-lg font-bold">{product.code}</div>
                <div className="text-gray-600 text-sm mb-2 font-semibold">
                  {product.productname}
                </div>
                <div className="text-gray-600 text-sm">
                  Price : ฿{product.price.toFixed(2)}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold text-teal-600 my-4">Product Table</h2>
        <div className="flex space-x-4 mb-4">
          <ProductForm onProductAdded={handleProductAdded} />
          <ExportButtons filteredTables={filteredProducts} columns={columns} filename="products.pdf" />
        </div>

        <table className="table w-full table-striped">
          <thead>
            <tr>
              <th className="text-gray-600">Name</th>
              <th className="text-gray-600">Category</th>
              <th className="text-gray-600">Description</th>
              <th className="text-gray-600">Price</th>
              <th className="text-gray-600">Create Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts
              .filter((product) =>
                searchQuery
                  ? product.productname.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              )
              .map((product) => (
                <tr key={product.productid}>
                  <td className="text-gray-600">{product.productname}</td>
                  <td className="text-gray-600">{getCategoryName(product.categoryid)}</td>
                  <td className="text-gray-600">{product.description}</td>
                  <td className="text-gray-600">฿{product.price.toFixed(2)}</td>
                  <td className="text-gray-600">{formatDate(product.createdat)}</td>
                  <td className="text-gray-600"></td>
                  {/* <td>
                    <button
                      onClick={() => handleDeleteProduct(product.productid)}
                      className="hover:border-b-2 border-gray-400 transition duration-30"
                    >
                      <TrashIcon className="text-red-600 h-6 w-6" />
                    </button>
                  </td> */}
                  <td>
                    <EditedProduct
                      productId={product.productid}
                      onProductUpdated={fetchProducts}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={handlePreviousPageProduct}
              disabled={currentProductPage === 1}
              className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
            >
              Previous
            </button>
            <div className="flex items-center">
              Page {currentProductPage} of {totalProductPages}
            </div>
            <button
              onClick={handleNextPageProduct}
              disabled={currentProductPage === totalProductPages}
              className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 transition duration-300"
            >
              Next
            </button>
          </div>
      </div>
    </div>
  );
};

export default ProductPage;
