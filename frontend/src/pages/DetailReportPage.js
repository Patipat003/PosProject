import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is installed

const SearchBar = ({ query, onSearch, employees, onEmployeeFilter, selectedEmployee, onSort, sortOrder }) => (
  <div className="flex space-x-4 items-center">
    <input
      type="text"
      value={query}
      onChange={(e) => onSearch(e.target.value)}
      placeholder="Search..."
      className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
    />
    <button
      onClick={onSort}
      className="btn border-none text-white bg-teal-500 px-4 py-2 rounded hover:bg-teal-600"
    >
      Sort by Total Price {sortOrder === "asc" ? "↑" : "↓"}
    </button>
    <select
      value={selectedEmployee}
      onChange={(e) => onEmployeeFilter(e.target.value)}
      className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
    >
      <option value="">All Employees</option>
      {employees.map((employee) => (
        <option key={employee} value={employee}>
          {employee}
        </option>
      ))}
    </select>
  </div>
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
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

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
    filterSaleItems(query, selectedEmployee);
  };

  const handleEmployeeFilter = (employeeName) => {
    setSelectedEmployee(employeeName);
    filterSaleItems(searchQuery, employeeName);
  };

  const filterSaleItems = (query, employeeName) => {
    const filtered = saleItems.filter((item) => {
      const employeeNameFromMap = employeeNames[item.saleid] || "Unknown";
      const productName = products[item.productid]?.toLowerCase() || "";
      const matchesEmployee = employeeName ? employeeNameFromMap === employeeName : true;

      return (
        matchesEmployee &&
        (productName.includes(query.toLowerCase()) ||
          item.quantity.toString().includes(query) ||
          item.price.toString().includes(query) ||
          item.totalprice.toString().includes(query))
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

  const groupItems = () => {
    const groupedItems = {};

    filteredSaleItems.forEach((item) => {
      const employeeName = employeeNames[item.saleid] || "Unknown";
      const productName = products[item.productid] || "Unknown";

      const key = `${employeeName}-${productName}`;
      if (!groupedItems[key]) {
        groupedItems[key] = {
          employeeName,
          productName,
          quantity: 0,
          price: 0,
          totalprice: 0,
        };
      }

      groupedItems[key].quantity += item.quantity;
      groupedItems[key].price = item.price; // Assuming price is the same for the product
      groupedItems[key].totalprice += item.totalprice;
    });

    return Object.values(groupedItems);
  };

  const handleSort = () => {
    const sortedItems = [...filteredSaleItems].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.totalprice - b.totalprice;
      } else {
        return b.totalprice - a.totalprice;
      }
    });

    setFilteredSaleItems(sortedItems);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const employeeList = [...new Set(Object.values(employeeNames))].filter((name) => name !== "Unknown");

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Detail Report</h1>

      <SearchBar
        query={searchQuery}
        onSearch={handleSearch}
        employees={employeeList}
        onEmployeeFilter={handleEmployeeFilter}
        selectedEmployee={selectedEmployee}
        onSort={handleSort}
        sortOrder={sortOrder}
      />

      <div className="overflow-x-auto mt-4">
        <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="border text-sm px-4 py-2">No.</th>
              <th className="border text-sm px-4 py-2">Employee Name</th>
              <th className="border text-sm px-4 py-2">Product Name</th>
              <th className="border text-sm px-4 py-2">Quantity</th>
              <th className="border text-sm px-4 py-2">Price</th>
              <th className="border text-sm px-4 py-2">Total Price</th>
              <th className="border text-sm px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupItems().map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{item.employeeName}</td>
                <td className="border border-gray-300 px-4 py-2">{item.productName}</td>
                <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2">{item.price.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2">{item.totalprice.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 flex justify-center">
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="btn btn-xs bg-teal-500 text-white border-none hover:bg-teal-600 rounded flex items-center"
                  >
                    View
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
              <span className="font-semibold">Employee Name:</span> {selectedItem.employeeName}
            </p>
            <p>
              <span className="font-semibold">Product Name:</span> {selectedItem.productName}
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
