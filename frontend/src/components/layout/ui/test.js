import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "../components/layout/ui/ProductForm";
import EditedProduct from "../components/layout/ui/EditedProduct";
import ExportButtons from "../components/layout/ui/ExportButtons";
import { format } from "date-fns";
import { TrashIcon } from "@heroicons/react/outline";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "d/MM/yyyy, HH:mm");
};

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 10;
  const [currentProductPage, setCurrentProductPage] = useState(1);

  const fetchProductsAndCategories = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [productResponse, categoryResponse] = await Promise.all([
        axios.get("http://localhost:5050/products", config),
        axios.get("http://localhost:5050/categories", config),
      ]);

      setProducts(productResponse.data.Data);
      setCategories(categoryResponse.data.Data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load products or categories");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryid === categoryId);
    return category ? category.name : "Unknown";
  };

  const paginatedProducts = products.slice(
    (currentProductPage - 1) * itemsPerPage,
    currentProductPage * itemsPerPage
  );

  const totalProductPages = Math.ceil(products.length / itemsPerPage);

  const handlePreviousPageProduct = () => {
    if (currentProductPage > 1) setCurrentProductPage(currentProductPage - 1);
  };

  const handleNextPageProduct = () => {
    if (currentProductPage < totalProductPages)
      setCurrentProductPage(currentProductPage + 1);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Product Management</h1>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for products"
            className="border bg-white border-gray-300 p-2 rounded w-full mr-2"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold text-teal-600 my-4">Product Table</h2>
        <table className="table w-full table-striped">
          <thead>
            <tr>
              <th className="text-black">Name</th>
              <th className="text-black">Category</th>
              <th className="text-black">Description</th>
              <th className="text-black">Price</th>
              <th className="text-black">Create Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts
              .filter((product) =>
                searchQuery
                  ? product.productname
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  : true
              )
              .map((product) => (
                <tr key={product.productid}>
                  <td className="text-black">{product.productname}</td>
                  <td className="text-black">{getCategoryName(product.categoryid)}</td>
                  <td className="text-black">
                    {product.description.length > 50
                      ? product.description.substring(0, 50) + "..."
                      : product.description}
                  </td>
                  <td className="text-black">{product.price.toFixed(2)}</td>
                  <td className="text-black">{formatDate(product.createdat)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={handlePreviousPageProduct}
            disabled={currentProductPage === 1}
            className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600"
          >
            Previous
          </button>
          <div>
            Page {currentProductPage} of {totalProductPages}
          </div>
          <button
            onClick={handleNextPageProduct}
            disabled={currentProductPage === totalProductPages}
            className="btn border-none bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
