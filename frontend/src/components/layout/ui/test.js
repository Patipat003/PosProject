import React, { useState, useEffect } from "react";
import axios from "axios";
import { toZonedTime, format } from 'date-fns-tz';
import { FaReceipt, FaPrint } from "react-icons/fa"; // Import receipt and print icons
import { jwtDecode } from "jwt-decode";

const SalesHistoryPage = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [paginatedSales, setPaginatedSales] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [branchId, setBranchId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

      const filteredEmployees = employeesArray.filter((emp) => emp.branchid === branchId);
      setEmployees(filteredEmployees);

      const filteredSales = salesArray
        .filter((sale) => sale.branchid === branchId)
        .map((sale, index) => {
          const employee = filteredEmployees.find((emp) => emp.employeeid === sale.employeeid);
          const receipt = receiptsArray.find((rec) => rec.saleid === sale.saleid);

          const zonedDate = toZonedTime(sale.createdat, 'UTC');
          const formattedDate = format(zonedDate, "dd/MM/yyyy, HH:mm");

          return {
            index: index + 1,
            saleid: sale.saleid,
            receiptnumber: receipt?.receiptnumber || "N/A",
            employeename: employee?.name || "Unknown",
            role: employee?.role || "Unknown",
            totalamount: sale.totalamount,
            createdat: formattedDate,
          };
        });

      setSales(filteredSales);
      setFilteredSales(filteredSales);
      setPaginatedSales(filteredSales.slice(0, itemsPerPage));
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

  const handleDateFilter = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    filterData(searchTerm, selectedEmployee, sortOrder, date);
  };
  

  const handleSort = () => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    filterData(searchTerm, selectedEmployee, order);
  };

  const filterData = (term, employee, order, date) => {
    let filtered = [...sales];
  
    if (term) {
      filtered = filtered.filter((sale) =>
        sale.receiptnumber.toLowerCase().includes(term.toLowerCase())
      );
    }
  
    if (employee) {
      filtered = filtered.filter((sale) => sale.employeename === employee);
    }
  
    if (date) {
      filtered = filtered.filter((sale) => {
        const saleDate = sale.createdat.split(", ")[0]; // Extract "dd/MM/yyyy"
        return saleDate === format(new Date(date), "dd/MM/yyyy");
      });
    }
  
    filtered.sort((a, b) => {
      const parseDate = (dateStr) => {
        const [date, time] = dateStr.split(", ");
        const [day, month, year] = date.split("/");
        return new Date(`${year}-${month}-${day}T${time}`);
      };
  
      const dateA = parseDate(a.createdat);
      const dateB = parseDate(b.createdat);
  
      return order === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  
    setFilteredSales(filtered);
    setCurrentPage(1);
    setPaginatedSales(filtered.slice(0, itemsPerPage));
  };

  const fetchSaleItems = async (saleId, createdAt) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const saleItemsResponse = await axios.get("http://localhost:5050/saleitems", config);
      const productResponse = await axios.get("http://localhost:5050/products", config);

      const saleItems = Array.isArray(saleItemsResponse.data.Data)
        ? saleItemsResponse.data.Data.filter((item) => item.saleid === saleId)
        : [];

      const products = Array.isArray(productResponse.data.Data) ? productResponse.data.Data : [];
      const modalItems = saleItems.map((item) => {
        const product = products.find((prod) => prod.productid === item.productid);
        return {
          productname: product?.productname || "Unknown",
          quantity: item.quantity,
          price: item.price,
          totalprice: item.quantity * item.price,
        };
      });

      setModalData({ receiptnumber: saleId, receiptnumber: saleId, createdat: createdAt, items: modalItems });
    } catch (error) {
      console.error("Error fetching sale items:", error);
    }
  };

  const openModal = (saleId, createdAt) => {
    fetchSaleItems(saleId, createdAt);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-area");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * itemsPerPage;
    setPaginatedSales(filteredSales.slice(startIndex, startIndex + itemsPerPage));
  };

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Sales History</h1>
      <p className="text-black mb-4">View your Sales History here.</p>

      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by Receipt Number"
          className="border bg-white border-gray-300 px-6 w-3/4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          value={selectedEmployee}
          onChange={handleEmployeeFilter}
          className="select bg-white text-gray-600 select-bordered border border-gray-300 w-full max-w-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Filter by Employee Name</option>
          {employees.map((employee) => (
            <option key={employee.employeeid} value={employee.employeename}>
              {employee.name}
            </option>
          ))}
        </select>

          {/* New Date Filter */}
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateFilter}
            className="btn btn-none border-none bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            onClick={handleSort}
            className="btn border-none text-white bg-teal-500 px-4 py-2 rounded hover:bg-teal-600"
          >
            Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>


      <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="border text-sm px-4 py-2">#</th>
            <th className="border text-sm px-4 py-2">Receipt Number</th>
            <th className="border text-sm px-4 py-2">Employee Name</th>
            <th className="border text-sm px-4 py-2">Role</th>
            <th className="border text-sm px-4 py-2">Total Amount</th>
            <th className="border text-sm px-4 py-2">Created At</th>
            <th className="border text-sm px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSales.map((sale) => (
            <tr key={sale.saleid} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{sale.index}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.receiptnumber}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.employeename}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.role}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.totalamount}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.createdat}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="btn btn-xs bg-teal-500 text-white border-none hover:bg-teal-600 rounded flex items-center"
                  onClick={() => openModal(sale.saleid, sale.createdat)}
                >
                  <FaReceipt /> Receipt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-teal-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {modalData && (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96 max-w-screen-sm" id="print-area">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Store ({modalData.bname})</h1>
              <p className="text-sm">{modalData.branchlocation}</p>
              <p className="text-sm">Employee: {modalData.employeeName}</p>
              <p className="text-sm">Phone: 123-456-7890</p>
              <p className="text-sm">www.storewebsite.com</p>
            </div>
            
            <div className="border-t border-gray-300 pt-4 mb-6">
              <h2 className="text-lg font-bold mb-2">Receipt #{modalData.receiptnumber}</h2>
              <p className="text-sm mb-2">Created At: {modalData.createdat}</p>
            </div>
            
            <div className="border border-gray-300 p-4 rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productname}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">{item.price.toFixed(2)}</td>
                      <td className="text-right">
                        {(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="font-bold">Total</td>
                    <td></td>
                    <td></td>
                    <td className="font-bold text-right">
                      {modalData.items
                        .reduce(
                          (total, item) => total + item.quantity * item.price,
                          0
                        )
                        .toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="border-t border-gray-300 pt-4 mt-6">
              <div className="flex justify-between">
                <span className="text-sm">Thank you for shopping with us!</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="btn bg-teal-500 text-white border-none hover:bg-teal-600 rounded"
                onClick={handlePrint}
              >
                <FaPrint className="mr-1" /> Print Receipt
              </button>
              <button
                className="btn bg-gray-500 text-white border-none hover:bg-gray-600 rounded"
                onClick={() => setModalData(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default SalesHistoryPage;
