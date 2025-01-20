import React, { useState, useEffect } from "react";
import axios from "axios";

const SalesPage = () => {
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Fetch branches and categories
    const fetchBranchesAndCategories = async () => {
      try {
        const [branchesResponse, categoriesResponse] = await Promise.all([
          axios.get("/api/branches"),
          axios.get("/api/categories"),
        ]);
        setBranches(branchesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch branches or categories", error);
      }
    };

    fetchBranchesAndCategories();
  }, []);

  useEffect(() => {
    // Fetch products when branch or category changes
    const fetchProducts = async () => {
      if (selectedBranch) {
        try {
          const response = await axios.get(
            `/api/products?branch=${selectedBranch}&category=${selectedCategory}`
          );
          setProducts(response.data);
        } catch (error) {
          console.error("Failed to fetch products", error);
        }
      } else {
        setProducts([]);
      }
    };

    fetchProducts();
  }, [selectedBranch, selectedCategory]);

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    setCart([]); // Clear the cart when branch changes
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) return;
    const existingItem = cart.find((item) => item.productid === product.productid);
    if (existingItem) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productid === product.productid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const filterInventoryByProduct = () => {
    if (selectedCategory) {
      return products.filter((product) => product.categoryid === selectedCategory);
    }
    return products;
  };

  return (
    <div className="p-4 bg-white flex">
      {/* Left panel */}
      <div className="w-4/5 mr-6">
        {/* Dropdowns for branch and category */}
        <div className="flex justify-between mb-6">
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className="w-1/3 bg-white border border-gray-300 text-gray-500 font-semibold p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          >
            <option value="">Select a Branch</option>
            {branches.map((branch) => (
              <option key={branch.branchid} value={branch.branchid}>
                {branch.branchname}
              </option>
            ))}
          </select>

          <select
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

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto h-screen">
          {selectedBranch ? (
            filterInventoryByProduct().map((product) => (
              <button
                key={product.productid}
                onClick={() => handleAddToCart(product)}
                className={`card p-4 ${product.stock === 0 ? "opacity-50" : ""}`}
              >
                <figure>
                  <img src={product.imageurl} alt={product.productname} />
                </figure>
                <h2>{product.productname}</h2>
                <p>฿{product.price}</p>
              </button>
            ))
          ) : (
            <p>Please select a branch to view products.</p>
          )}
        </div>
      </div>

      {/* Right panel (Cart) */}
      <div className="w-1/5 sticky top-0 bg-white p-4">
        <h3 className="text-lg font-semibold mb-4">Your Cart</h3>
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.productid} className="mb-4">
              <p className="font-medium">{item.productname}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Total: ฿{item.price * item.quantity}</p>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
        {cart.length > 0 && (
          <button
            onClick={handleClearCart}
            className="btn bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg mt-4 w-full"
          >
            Clear Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
