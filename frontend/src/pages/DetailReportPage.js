import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is installed
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const SearchBar = ({ query, onSearch, employees, onEmployeeFilter, selectedEmployee, onSort, sortOrder }) => (
  <div className="flex space-x-4 items-center">
    <input
      type="text"
      value={query}
      onChange={(e) => onSearch(e.target.value)}
      placeholder="Search..."
      className="border bg-white border-gray-300 p-3 pr-10 text-black rounded-md w-full min-w-[200px] focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
    {/* <button
      onClick={onSort}
      className="btn border-none text-white bg-teal-500 px-4 py-2 rounded hover:bg-teal-600"
    >
      Sort by Total Price {sortOrder === "asc" ? "↑" : "↓"}
    </button> */}
    <select
      value={selectedEmployee}
      onChange={(e) => onEmployeeFilter(e.target.value)}
      className="border bg-white border-gray-300 p-3 pr-10 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
    >
      <option value="">All Branches</option>
      {employees
        .filter((branch) => branch.id === selectedEmployee || selectedEmployee === "")
        .map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
    </select>
  </div>
);

const DetailReportPage = () => {
  const [saleItems, setSaleItems] = useState([]);
  const [products, setProducts] = useState({});
  const [branchIds, setBranchIds] = useState({});
  const [branches, setBranches] = useState([]);
  const [filteredSaleItems, setFilteredSaleItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      const userBranchId = decodedToken.branchid;

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [saleItemsResponse, productsResponse, salesResponse, employeesResponse, branchesResponse] = await Promise.all([
        axios.get("http://localhost:5050/saleitems", config),
        axios.get("http://localhost:5050/products", config),
        axios.get("http://localhost:5050/sales", config),
        axios.get("http://localhost:5050/employees", config),
        axios.get("http://localhost:5050/branches", config),
      ]);

      const productMap = {};
      productsResponse.data.Data.forEach((product) => {
        productMap[product.productid] = product.productname;
      });

      const saleToBranchMap = {};
      salesResponse.data.Data.forEach((sale) => {
        saleToBranchMap[sale.saleid] = sale.branchid;
      });

      const branchList = branchesResponse.data.Data.map((branch) => ({
        id: branch.branchid,
        name: branch.bname,
      }));

      setSaleItems(saleItemsResponse.data.Data);
      setFilteredSaleItems(saleItemsResponse.data.Data);
      setProducts(productMap);
      setBranchIds(saleToBranchMap);
      setBranches(branchList);
      setSelectedEmployee(userBranchId);
      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterSaleItems = (query, branchId) => {
    const filtered = saleItems.filter((item) => {
      const branch = branchIds[item.saleid] || "Unknown";
      const branchName = branches.find((branch) => branch.id === branch) ? branches.find((branch) => branch.id === branch).name : "Unknown"; 
      const productName = products[item.productid]?.toLowerCase() || "";
      const matchesBranch = branchId ? branch === branchId : true;

      return (
        matchesBranch &&
        (productName.includes(query.toLowerCase()) ||
          item.quantity.toString().includes(query) ||
          item.price.toString().includes(query) ||
          item.totalprice.toString().includes(query))
      );
    });
    setFilteredSaleItems(filtered);
  };

  const handleSort = () => {
    const sortedItems = [...filteredSaleItems].sort((a, b) =>
      sortOrder === "asc" ? a.totalprice - b.totalprice : b.totalprice - a.totalprice
    );
    setFilteredSaleItems(sortedItems);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const groupByProduct = (saleItems) => {
    return saleItems.reduce((acc, item) => {
      const productId = item.productid;
      if (!acc[productId]) {
        acc[productId] = {
          productName: products[productId],
          totalQuantity: 0,
          totalPrice: 0,
          branchNames: new Set(),
        };
      }
      acc[productId].totalQuantity += item.quantity;
      acc[productId].totalPrice += item.totalprice;
      acc[productId].branchNames.add(branchIds[item.saleid]);
      return acc;
    }, {});
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const branchName = getBranchName(selectedEmployee);
  
    doc.text(`Sales Report - ${branchName}`, 14, 15);
  
    const tableColumn = ["No.", "Branch Name", "Product Name", "Total Quantity", "Average Price", "Total Price"];
    const tableRows = [];
  
    // กรองข้อมูลให้เฉพาะของสาขาที่ล็อกอิน
    const branchFilteredItems = filteredSaleItems.filter((item) => branchIds[item.saleid] === selectedEmployee);
  
    // จัดกลุ่มข้อมูลตามสินค้าในสาขาของผู้ใช้
    const groupedItems = branchFilteredItems.reduce((acc, item) => {
      const productName = products[item.productid] || "Unknown";
      const key = `${productName}`;
  
      if (!acc[key]) {
        acc[key] = { branchName, productName, totalQuantity: 0, totalPrice: 0 };
      }
  
      acc[key].totalQuantity += item.quantity;
      acc[key].totalPrice += item.totalprice;
  
      return acc;
    }, {});
  
    // แปลงข้อมูลที่จัดกลุ่มแล้วเป็นรูปแบบตาราง
    Object.values(groupedItems).forEach((item, index) => {
      tableRows.push([
        index + 1,
        item.branchName,
        item.productName,
        item.totalQuantity,
        (item.totalPrice / item.totalQuantity).toFixed(2), // ราคาเฉลี่ย
        item.totalPrice.toFixed(2),
      ]);
    });
  
    if (tableRows.length === 0) {
      doc.text("No sales data available for your branch.", 14, 25);
    } else {
      autoTable(doc, {
        startY: 20,
        head: [tableColumn],
        body: tableRows,
      });
    }
  
    doc.save(`Sales_Report_${branchName}.pdf`);
  };
  
  // ฟังก์ชันช่วยดึงชื่อสาขา
  const getBranchName = (branchId) => {
    return branches.find((branch) => branch.id === branchId)?.name || "Unknown Branch";
  };
  
  
  
  // Filter sale items based on selected branch or user's branch
  const filteredItems = selectedEmployee
    ? saleItems.filter((item) => branchIds[item.saleid] === selectedEmployee)
    : saleItems;

  const groupedItems = groupByProduct(filteredItems);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Detail Report</h1>
      <SearchBar
        query={searchQuery}
        onSearch={(q) => {
          setSearchQuery(q);
          filterSaleItems(q, selectedEmployee);
        }}
        employees={branches}
        onEmployeeFilter={(id) => {
          setSelectedEmployee(id);
          filterSaleItems(searchQuery, id);
        }}
        selectedEmployee={selectedEmployee}
        onSort={handleSort}
        sortOrder={sortOrder}
      />
      <div className="overflow-x-auto mt-4">
        <table id="table-report" className="table-auto min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="border px-4 py-2">No.</th>
              <th className="border px-4 py-2">Branch Name</th>
              <th className="border px-4 py-2">Product Name</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedItems).map((item, index) => {
              const branchNames = [...item.branchNames].map((branchId) => {
                return branches.find((branch) => branch.id === branchId)?.name || "Unknown";
              }).join(", ");
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{branchNames}</td>
                  <td className="border px-4 py-2">{item.productName || "Unknown"}</td>
                  <td className="border px-4 py-2">{item.totalQuantity}</td>
                  <td className="border px-4 py-2">{(item.totalPrice / item.totalQuantity).toFixed(2)}</td>
                  <td className="border px-4 py-2">{item.totalPrice.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={exportToPDF}
        className="bg-teal-500 text-white p-2 rounded-md shadow-md hover:bg-teal-600"
        >
          Export to PDF
      </button>
    </div>
  );
};

export default DetailReportPage;
