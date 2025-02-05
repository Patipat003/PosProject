import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 
import ProductForm from "../components/layout/ui/ProductForm";
import EditedProduct from "../components/layout/ui/EditedProduct";
import ExportButtons from "../components/layout/ui/ExportButtons";
import SortByDropdown from "../components/layout/ui/SortByDropdown";
import { toZonedTime, format } from 'date-fns-tz';
import { TrashIcon } from "@heroicons/react/outline";
import { AiOutlineExclamationCircle   } from "react-icons/ai"; // Error Icon
import { Player } from "@lottiefiles/react-lottie-player"; // Lottie Player
import CategoryModal from "../components/layout/ui/CategoryModal";

const formatDate = (dateString) => {
  // const date = new Date(dateString);
  const zonedDate = toZonedTime(dateString, 'UTC');
  return format(zonedDate, "d/MM/yyyy, HH:mm"); 
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
  const [userRole, setUserRole] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // จัดการ Modal

  const itemsPerPage = 20; // จำนวนรายการต่อหน้า
  const [currentProductPage, setCurrentProductPage] = useState(1);

  // ฟังก์ชันดึงข้อมูลสินค้าและสต็อก
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken"); // หยิบ token จาก localStorage
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
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
        const token = localStorage.getItem("authToken"); // หยิบ token จาก localStorage
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // แนบ token ไปกับ header ของคำขอ
          },
        };

        const response = await axios.delete(`http://localhost:5050/products/${productId}`, config);
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
    
    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchProducts();
    }, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
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

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("authToken"); 
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      };

      const categoryResponse = await axios.get("http://localhost:5050/categories", config);
      setCategories(categoryResponse.data.Data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryid === categoryId);
    return category ? category.categoryname : "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-42 flex-col">
        <Player
          autoplay
          loop
          src="https://assets3.lottiefiles.com/packages/lf20_z4cshyhf.json" // ตัวอย่าง: "POS Loading"
          style={{ height: "200px", width: "200px" }}
        />
        <span className="text-teal-500 text-lg font-semibold">Loading...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center mt-2">
        <AiOutlineExclamationCircle className="text-red-500 text-6xl mb-4" />
        <p className="text-red-500 text-xl">{error}</p>
      </div>


    );
  }

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryid === selectedCategory)
    : products;

  const paginatedProducts = getPaginatedProducts();
  const columns = ["productname", "description", "price", "createdat"]; // Define columns

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
            className="border bg-white border-gray-300 p-2 rounded w-full mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                <div className="text-gray-600 text-sm mb-2 font-semibold">{product.productname}</div>
                <div className="text-gray-600 text-xs mb-2 font-semibold">{product.productcode}</div>
                <div className="text-gray-600 text-sm">Price : ฿{product.price.toFixed(2)}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="min-w-full">
        <h2 className="text-2xl font-bold text-teal-600 my-4">Product Table</h2>
        <div className="flex space-x-4 mb-4">
        {(userRole === "Manager" || userRole === "Super Admin") && (
          <>
            <ProductForm onProductAdded={handleProductAdded} />
            {/* Category */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="btn bg-teal-500 text-white px-6 py-3 border-none rounded hover:bg-teal-600 transition duration-300 mt-4"
            >
              + Add Category
            </button>
          </>
        )}
          <ExportButtons filteredTables={filteredProducts} columns={columns} filename="products.pdf" />
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                {/* <th className="border text-sm px-4 py-2 text-left">No.</th> */}
                <th className="border text-sm px-4 py-2 text-left">Product Code</th>
                <th className="border text-sm px-4 py-2">Name</th>
                <th className="border text-sm px-4 py-2">Description</th>
                <th className="border text-sm px-4 py-2">Category</th>
                <th className="border text-sm px-4 py-2">Price</th>
                {(userRole === "Manager" || userRole === "Super Admin") && (
                  <th className="border text-sm px-4 py-2">Created</th>
                )}
                {(userRole === "Manager" || userRole === "Super Admin") && (
                  <th className="border border-gray-300 py-2 px-4 text-sm">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts
                .filter((product) =>
                  searchQuery
                    ? product.productname.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map((product, index) => (
                  <tr key={product.productid} className="hover:bg-gray-50">
                    {/* <td className="border border-gray-300 px-4 py-2">{index + 1}</td> */}
                    <td className="border border-gray-300 px-4 py-2">{product.productcode}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.productname}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="truncate max-w-xs">{product.description}</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{getCategoryName(product.categoryid)}</td>
                    <td className="border border-gray-300 px-4 py-2">฿{product.price.toFixed(2)}</td>
                    {(userRole === "Manager" || userRole === "Super Admin") && (
                      <td className="border border-gray-300 px-4 py-2">{formatDate(product.createdat)}</td>
                    )}
                    {(userRole === "Manager" || userRole === "Super Admin") && (
                      <>
                        <td className="border border-gray-300 text-center justify-center items-center">
                          <EditedProduct
                            productId={product.productid}
                            onProductUpdated={fetchProducts}
                          />
                        </td>
                        {/* <td className="border border-gray-300 text-center justify-center items-center">
                          <button
                            onClick={() => handleDeleteProduct(product.productid)} // เพิ่มการเรียกใช้งาน handleDeleteProduct
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-6 h-6" />
                          </button>
                        </td> */}
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onCategoryAdded={fetchCategories} // รีเฟรช Categories เมื่อเพิ่มใหม่
          />
        )}

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
