import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";

const SalesHistoryPage = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [branchId, setBranchId] = useState("");
  const [employees, setEmployees] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token);
    setBranchId(decoded.branchid);
    fetchSalesData(decoded.branchid);
  }, []);

  const fetchSalesData = async (branchId) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      const salesResponse = await axios.get("http://localhost:5050/sales", config);
      const employeeResponse = await axios.get("http://localhost:5050/employees", config);
      const receiptResponse = await axios.get("http://localhost:5050/receipts", config);
  
      const salesArray = salesResponse.data.Data || [];
      const employeesArray = employeeResponse.data.Data || [];
      const receiptsArray = receiptResponse.data.Data || [];
  
      // กรอง employeesArray ให้ตรงกับ branchid
      const filteredEmployees = employeesArray.filter((emp) => emp.branchid === branchId);
      setEmployees(filteredEmployees);
  
      const filteredSales = salesArray
        .filter((sale) => sale.branchid === branchId)
        .map((sale, index) => {
          const employee = filteredEmployees.find((emp) => emp.employeeid === sale.employeeid);
          const receipt = receiptsArray.find((rec) => rec.saleid === sale.saleid);
  
          return {
            index: index + 1,
            saleid: sale.saleid,
            receiptnumber: receipt?.receiptnumber || "N/A",
            employeename: employee?.name || "Unknown",
            totalamount: sale.totalamount,
            createdat: format(new Date(sale.createdat), "dd/MM/yyyy"),
          };
        });
  
      setSales(filteredSales);
      setFilteredSales(filteredSales); // Set initial filteredSales
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterData(term, selectedEmployee, sortOrder);
  };

  const handleEmployeeFilter = (event) => {
    const employee = event.target.value;
    setSelectedEmployee(employee);
    filterData(searchTerm, employee, sortOrder);
  };

  const handleSort = () => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    filterData(searchTerm, selectedEmployee, order);
  };

  const filterData = (term, employee, order) => {
    let filtered = [...sales];
  
    if (term) {
      filtered = filtered.filter((sale) =>
        sale.receiptnumber.toLowerCase().includes(term.toLowerCase())
      );
    }
  
    if (employee) {
      filtered = filtered.filter((sale) => sale.employeename === employee); // Corrected this line
    }
  
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdat);
      const dateB = new Date(b.createdat);
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  
    setFilteredSales(filtered);
  };  

  const fetchSaleItems = async (saleId) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };  // เพิ่มบรรทัดนี้
  
      const saleItemsResponse = await axios.get("http://localhost:5050/saleitems", config);
      console.log("Sale Items Response:", saleItemsResponse.data);
    
      const productResponse = await axios.get("http://localhost:5050/products", config);
      console.log("Product Response:", productResponse.data);
    
      const saleItems = Array.isArray(saleItemsResponse.data.Data)
        ? saleItemsResponse.data.Data.filter((item) => item.saleid === saleId)
        : [];
  
      const products = Array.isArray(productResponse.data.Data)
        ? productResponse.data.Data
        : [];
      const modalItems = saleItems.map((item) => {
        const product = products.find((prod) => prod.productid === item.productid);
        return {
          productname: product?.productname || "Unknown",
          quantity: item.quantity,
          price: item.price,
          totalprice: item.quantity * item.price,
        };
      });
  
      setModalData(modalItems);
    } catch (error) {
      console.error("Error fetching sale items:", error);
    }
  };
  
  
  const openModal = (saleId) => {
    fetchSaleItems(saleId);
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div className="p-4  bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Sales History</h1>
      <p className="text-black mb-4">View your Sales History here.</p>
      
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by receipt number"
          className="border border-gray-300 px-4 py-2 rounded"
        />
        <select
          value={selectedEmployee}
          onChange={handleEmployeeFilter}
          className="border border-gray-300 px-4 py-2 rounded"
        >
          <option value="">Filter by Employee</option>
          {employees.map((employee) => (
            <option key={employee.employeeid} value={employee.employeename}>
              {employee.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSort}
          className="bg-teal-500 text-white px-4 py-2 rounded"
        >
          Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">#</th>
            <th className="border border-gray-300 px-4 py-2">Receipt Number</th>
            <th className="border border-gray-300 px-4 py-2">Employee Name</th>
            <th className="border border-gray-300 px-4 py-2">Total Amount</th>
            <th className="border border-gray-300 px-4 py-2">Created At</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.map((sale) => (
            <tr key={sale.saleid} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{sale.index}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.receiptnumber}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.employeename}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.totalamount}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.createdat}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="bg-teal-500 text-white px-4 py-2 rounded"
                  onClick={() => openModal(sale.saleid)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalData && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg w-1/2">
            <h2 className="text-lg font-bold mb-4">Sale Details</h2>
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Product Name</th>
                  <th className="border border-gray-300 px-4 py-2">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {modalData.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{item.productname}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.totalprice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
              onClick={closeModal}
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
