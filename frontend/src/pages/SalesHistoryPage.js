import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiEye } from "react-icons/hi";
import { format } from "date-fns";

// Helper function for formatting dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "d/MM/yyyy, HH:mm");
};

const SalesHistoryPage = () => {
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [salesResponse, branchesResponse, saleItemsResponse, productsResponse] = await Promise.all([
          axios.get("http://localhost:5050/sales", config),
          axios.get("http://localhost:5050/branches", config),
          axios.get("http://localhost:5050/saleItems", config),
          axios.get("http://localhost:5050/products", config), // Fetch product data
        ]);

        setProducts(productsResponse.data.Data || []);
        setBranches(branchesResponse.data.Data || []);
        setSaleItems(saleItemsResponse.data.Data || []);
        setFilteredProducts(salesResponse.data.Data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.branchid === branchId);
    return branch ? branch.bname : "Unknown Branch";
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.productid === productId);
    return product ? product.productname : "Unknown Product";
  };

  const handleViewDetails = (sale) => {
    const relatedSaleItems = saleItems
      .filter((item) => item.saleid === sale.saleid)
      .map((item) => ({
        ...item,
        productname: getProductName(item.productid),
      }));
    setSelectedSale({ ...sale, items: relatedSaleItems });
  };

  const handleCloseModal = () => {
    setSelectedSale(null);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = filteredProducts.filter((product) => {
      const branchName = getBranchName(product.branchid).toLowerCase();
      return branchName.includes(query);
    });

    setFilteredProducts(filtered);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Sales History</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Branch Name"
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <table className="border border-collapse w-full text-left">
        <thead>
          <tr className="bg-teal-600 text-white">
            <th className="border p-2">Branch</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.product_id}>
              <td className="border p-2">{getBranchName(product.branchid)}</td>
              <td className="border p-2">{product.totalamount}</td>
              <td className="border p-2">{formatDate(product.createdat)}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleViewDetails(product)}
                  className="text-blue-600 hover:underline"
                >
                  <HiEye className="inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Sale Details</h2>
            <ul className="space-y-2">
              <li>
                <strong>Branch:</strong> {getBranchName(selectedSale.branchid)}
              </li>
              <li>
                <strong>Total Amount:</strong> {selectedSale.totalamount}
              </li>
              <li>
                <strong>Created At:</strong> {formatDate(selectedSale.createdat)}
              </li>
            </ul>
            <h3 className="text-xl font-semibold text-teal-500 mt-4">Sale Items:</h3>
            <ul className="space-y-2">
              {selectedSale.items.map((item, index) => (
                <li key={index}>
                  <strong>Sale Item ID:</strong> {item.saleitemid} <br />
                  <strong>Product Name:</strong> {item.productname} <br />
                  <strong>Quantity:</strong> {item.quantity} <br />
                  <strong>Price:</strong> {item.price} <br />
                  <strong>Total Price:</strong> {item.totalprice}
                </li>
              ))}
            </ul>
            <button
              onClick={handleCloseModal}
              className="mt-4 w-full bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistoryPage;
