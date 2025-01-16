import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is installed
import { HiEye } from "react-icons/hi";

const SearchBar = ({ query, onSearch }) => (
  <input
    type="text"
    value={query}
    onChange={(e) => onSearch(e.target.value)}
    placeholder="Search..."
    className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
  />
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative">
      <h2 className="text-3xl font-bold mb-6 text-teal-600 text-center">{title}</h2>
      {children}
      <button
        onClick={onClose}
        className="btn w-full bg-teal-500 text-white font-medium px-6 py-3 mt-6 rounded-md hover:bg-teal-600 transition duration-300"
      >
        Close
      </button>
    </div>
  </div>
);

const DetailReportPage = () => {
  const [saleItems, setSaleItems] = useState([]);
  const [products, setProducts] = useState({});
  const [employeeNames, setEmployeeNames] = useState({});
  const [filteredSaleItems, setFilteredSaleItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [saleItemsResponse, productsResponse, salesResponse, employeesResponse] = await Promise.all([
        axios.get("http://localhost:5050/saleitems", config),
        axios.get("http://localhost:5050/products", config),
        axios.get("http://localhost:5050/sales", config),
        axios.get("http://localhost:5050/employees", config),
      ]);

      const productMap = {};
      productsResponse.data.Data.forEach((product) => {
        productMap[product.productid] = product.productname;
      });

      const saleToEmployeeMap = {};
      salesResponse.data.Data.forEach((sale) => {
        saleToEmployeeMap[sale.saleid] = sale.employeeid;
      });

      const employeeMap = {};
      employeesResponse.data.Data.forEach((employee) => {
        employeeMap[employee.employeeid] = employee.name;
      });

      const saleToEmployeeNameMap = {};
      Object.keys(saleToEmployeeMap).forEach((saleid) => {
        const employeeId = saleToEmployeeMap[saleid];
        saleToEmployeeNameMap[saleid] = employeeMap[employeeId] || "Unknown";
      });

      setSaleItems(saleItemsResponse.data.Data);
      setFilteredSaleItems(saleItemsResponse.data.Data);
      setProducts(productMap);
      setEmployeeNames(saleToEmployeeNameMap);
      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);

    const filtered = saleItems.filter((item) => {
      const employeeName = employeeNames[item.saleid]?.toLowerCase() || "";
      const productName = products[item.productid]?.toLowerCase() || "";

      return (
        item.saleitemid.toString().includes(query) ||
        employeeName.includes(query.toLowerCase()) ||
        productName.includes(query.toLowerCase()) ||
        item.quantity.toString().includes(query) ||
        item.price.toString().includes(query) ||
        item.totalprice.toString().includes(query)
      );
    });

    setFilteredSaleItems(filtered);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Detail Report</h1>

      <SearchBar query={searchQuery} onSearch={handleSearch} />

      <div className="overflow-x-auto mt-4">
        <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="border-b-2 p-2 text-left">Sale Item ID</th>
              <th className="border-b-2 p-2 text-left">Employee Name</th>
              <th className="border-b-2 p-2 text-left">Product Name</th>
              <th className="border-b-2 p-2 text-left">Quantity</th>
              <th className="border-b-2 p-2 text-left">Price</th>
              <th className="border-b-2 p-2 text-left">Total Price</th>
              <th className="border-b-2 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSaleItems.map((item) => (
              <tr key={item.saleitemid} className="hover:bg-gray-100">
                <td className="border-b p-2">{item.saleitemid}</td>
                <td className="border-b p-2">{employeeNames[item.saleid] || "Unknown"}</td>
                <td className="border-b p-2">{products[item.productid] || "Unknown"}</td>
                <td className="border-b p-2">{item.quantity}</td>
                <td className="border-b p-2">{item.price.toFixed(2)}</td>
                <td className="border-b p-2">{item.totalprice.toFixed(2)}</td>
                <td className="border-b p-2 text-center">
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="text-blue-600 hover:underline"
                  >
                    <HiEye className="h-5 w-5 inline" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <Modal title="Sale Item Details" onClose={handleCloseModal}>
          <div className="space-y-4">
            <p>
              <span className="font-semibold">Sale Item ID:</span> {selectedItem.saleitemid}
            </p>
            <p>
              <span className="font-semibold">Employee Name:</span> {employeeNames[selectedItem.saleid] || "Unknown"}
            </p>
            <p>
              <span className="font-semibold">Product Name:</span> {products[selectedItem.productid] || "Unknown"}
            </p>
            <p>
              <span className="font-semibold">Quantity:</span> {selectedItem.quantity}
            </p>
            <p>
              <span className="font-semibold">Price:</span> {selectedItem.price.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Total Price:</span> {selectedItem.totalprice.toFixed(2)}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DetailReportPage;
