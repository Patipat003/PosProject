import React, { useState, useEffect } from "react";
import axios from "axios";
import { toZonedTime, format } from 'date-fns-tz';
import { FaReceipt, FaPrint } from "react-icons/fa"; // Import receipt and print icons
import { jwtDecode } from "jwt-decode";
import { jsPDF } from 'jspdf';// Import ReactPrinter component
import html2canvas from 'html2canvas-pro';
import ReceiptPrinter from "../components/layout/ui/ReceiptPrinter";

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
            employeename: employee?.name || "Super Admin",
            role: employee?.role || "Super Admin",
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
      // แปลง selectedDate และ createdat ให้อยู่ในรูปแบบเดียวกัน (dd/MM/yyyy)
      const formattedSelectedDate = format(new Date(date), "dd/MM/yyyy");
  
      filtered = filtered.filter((sale) => {
        // ดึงแค่วันที่จาก createdat (รูปแบบ "dd/MM/yyyy, HH:mm")
        const saleDate = sale.createdat.split(", ")[0]; // "dd/MM/yyyy"
        return saleDate === formattedSelectedDate;
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
  

  // ฟังก์ชันที่ใช้ดึงข้อมูลจาก API เพื่อแสดงใน Modal
  const fetchSaleItems = async (saleId, createdAt) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      // เรียกข้อมูลต่าง ๆ
      const saleItemsResponse = await axios.get("http://localhost:5050/saleitems", config);
      const productResponse = await axios.get("http://localhost:5050/products", config);
      const receiptResponse = await axios.get("http://localhost:5050/receipts", config);
      const branchResponse = await axios.get("http://localhost:5050/branches", config);
  
      const saleItems = Array.isArray(saleItemsResponse.data.Data)
        ? saleItemsResponse.data.Data.filter((item) => item.saleid === saleId)
        : [];
      const products = Array.isArray(productResponse.data.Data) ? productResponse.data.Data : [];
      const receipt = receiptResponse.data.Data.find((rec) => rec.saleid === saleId);
      const branches = branchResponse.data.Data;

      // ค้นหาข้อมูลสาขาที่ตรงกับ branchId ของ receipt
      const branch = branches.find((branch) => branch.branchid === receipt?.branchid);
  
      const modalItems = saleItems.map((item) => {
        const product = products.find((prod) => prod.productid === item.productid);
        return {
          productname: product?.productname || "Unknown",
          quantity: item.quantity,
          price: item.price,
          totalprice: item.quantity * item.price,
        };
      });
  
      // อัปเดต modalData โดยเพิ่มข้อมูลพนักงานและข้อมูลสาขา
      setModalData({
        receiptnumber: receipt?.receiptnumber || "N/A",
        createdat: createdAt,
        items: modalItems,
        bname: branch?.bname || "N/A",
        location: branch?.location || "N/A",
      });
    } catch (error) {
      console.error("Error fetching sale items:", error);
    }
  };  
  
  // ฟังก์ชันที่เปิด Modal เมื่อคลิกที่แถวของตาราง
  const openModal = (saleId, createdAt, branchId) => {
    fetchSaleItems(saleId, createdAt, branchId);  // ส่ง saleId, createdAt, branchId, employeeid
  };

  const handlePrint = () => {
    const element = document.getElementById('print-area');
    
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF();
      doc.addImage(imgData, 'PNG', 50, 0);
      doc.save('receipt.pdf');
    });
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
            <th className="border text-sm px-4 py-2">No.</th>
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
              <td className="border border-gray-300 px-4 py-2 flex items-center justify-center">
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
      
      {/* ส่วนของ Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96 max-w-screen-sm">
            <div className="p-6 rounded shadow-lg max-w-screen" id="print-area">
              {/* Use ReactPrinter to display receipt content */}
              <ReceiptPrinter modalData={modalData} />
            </div>

            {/* ปุ่มสำหรับพิมพ์ใบเสร็จ */}
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
