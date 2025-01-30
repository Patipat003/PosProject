import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import axios from "axios";
import { toZonedTime, format } from 'date-fns-tz';
import { AiOutlineExclamationCircle } from "react-icons/ai"; // Error Icon
import { Player } from "@lottiefiles/react-lottie-player"; // Lottie Player
import SoldProductsModal from "../components/layout/ui/SoldProductsModal"; // Import the SoldProductsModal component
import { HiOutlineCurrencyDollar  , HiOutlineShoppingCart, HiOutlineCube  } from 'react-icons/hi'; // Heroicons


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const POLLING_INTERVAL = 5000; // Polling interval in milliseconds (5 seconds)

const formatDate = (dateString) => {
  // const date = new Date(dateString);
  const zonedDate = toZonedTime(dateString, 'UTC');
  return format(zonedDate, "d/MM/yyyy, HH:mm"); 
};

const DashboardPage = () => {
  const [salesSummary, setSalesSummary] = useState([]);
  const [keyMetrics, setKeyMetrics] = useState([]);
  const [branches, setBranches] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]); // For low stock items
  const [saleRecents, setSaleRecents] = useState([]);  // สำหรับรายการการขายล่าสุด
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [userBranchId, setUserBranchId] = useState(null); // State for storing branchid
  const [showModal, setShowModal] = useState(false); // สำหรับเปิด/ปิด modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
    
        const saleItemsResponse = await axios.get("http://localhost:5050/saleitems", config);
        const salesResponse = await axios.get("http://localhost:5050/sales", config);
        const productsResponse = await axios.get("http://localhost:5050/products", config);
        const branchesResponse = await axios.get("http://localhost:5050/branches", config);
        const inventoryResponse = await axios.get("http://localhost:5050/inventory", config);
        const receiptsResponse = await axios.get("http://localhost:5050/receipts", config);
        const employeesResponse = await axios.get("http://localhost:5050/employees", config);
    
        const saleItemsData = saleItemsResponse.data.Data;
        const salesData = salesResponse.data.Data;
        const productsData = productsResponse.data.Data;
        const branchesData = branchesResponse.data.Data;
        const inventory = inventoryResponse.data.Data;
        const receiptsData = receiptsResponse.data.Data;
        const employeesData = employeesResponse.data.Data;
    
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const branchid = decodedToken.branchid;
        setUserBranchId(branchid);
    
        const filteredSales = selectedBranch === "all"
          ? salesData
          : salesData.filter(sale => sale.branchid === branchid);
    
        const saleItemsForBranch = saleItemsData.filter(saleItem =>
          filteredSales.some(sale => sale.saleid === saleItem.saleid)
        );
    
        const totalQuantity = saleItemsForBranch.reduce((sum, item) => sum + item.quantity, 0);
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalamount, 0);
    
        const productSales = saleItemsForBranch.reduce((acc, saleItem) => {
          const { productid, quantity } = saleItem;
          if (acc[productid]) {
            acc[productid].quantity += quantity;
          } else {
            acc[productid] = { quantity, productid };
          }
          return acc;
        }, {});
    
        const topSellingProducts = Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
    
        const topProductsWithDetails = topSellingProducts.map(item => {
          const product = productsData.find(p => p.productid === item.productid);
          return {
            ...item,
            productname: product ? product.productname : "Unknown",
            imageurl: product ? product.imageurl : "",
          };
        });
    
        const branchSales = salesData.reduce((acc, sale) => {
          const branch = acc.find((b) => b.branchid === sale.branchid);
          if (branch) {
            branch.sales += sale.totalamount;
          } else {
            acc.push({ branchid: sale.branchid, sales: sale.totalamount });
          }
          return acc;
        }, []);
    
        const salesWithBranchNames = branchesData.map((branch) => {
          const sale = branchSales.find((b) => b.branchid === branch.branchid);
          return {
            branchid: branch.branchid,
            bname: branch.bname,
            sales: sale ? sale.sales : 0,
          };
        });
    
        setBranches(branchesData);
        setSalesSummary(salesWithBranchNames);
        setTopProducts(topProductsWithDetails);
        setInventoryData(inventory);
        setKeyMetrics([{ label: "Total Sales", value: totalSales }, { label: "Total Quantity", value: totalQuantity }]);
    
        const lowStock = inventory.filter(item => item.quantity < 100 && (selectedBranch === "all" || item.branchid === branchid)); 
        setLowStockProducts(lowStock);
    
        // Fetch sale recents
          const saleRecentsData = selectedBranch === "all"
          ? salesData // สำหรับแสดงข้อมูลทั้งหมดจากทุกสาขา
          : salesData.filter(sale => sale.branchid === branchid); // สำหรับสาขาของผู้ใช้

          // Map saleid to receiptnumber and employeeid to name
          const saleRecentsWithDetails = saleRecentsData.map(sale => {
          const receipt = receiptsData.find(receipt => receipt.saleid === sale.saleid);
          const employee = employeesData.find(employee => employee.employeeid === sale.employeeid);
          return {
            ...sale,
            receiptnumber: receipt ? receipt.receiptnumber : "N/A",
            employeename: employee ? employee.name : "Unknown",
          };
          });

          // เรียงลำดับข้อมูลจากวันที่ล่าสุดไปเก่าสุด
          const sortedSaleRecents = saleRecentsWithDetails
          .sort((a, b) => new Date(b.createdat) - new Date(a.createdat)); // เรียงจากล่าสุด -> เก่าสุด

          // เลือกเฉพาะ 10 รายการล่าสุด
          const topSaleRecents = sortedSaleRecents.slice(0, 10); 

          setSaleRecents(topSaleRecents); // ตั้งค่า state ด้วยข้อมูลที่เรียงลำดับแล้ว

    
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };
    
  
    fetchData();
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(intervalId); // Clean up interval
  }, [selectedBranch]);
  
  const handleCloseModal = () => setShowModal(false);

  const soldProducts = topProducts.map(product => ({
    productname: product.productname,
    quantity: product.quantity,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-42 flex-col">
        <Player
          autoplay
          loop
          src="https://assets3.lottiefiles.com/packages/lf20_z4cshyhf.json"
          style={{ height: "200px", width: "200px" }}
        />
        <span className="text-teal-500 text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-42 flex-col">
        <AiOutlineExclamationCircle className="text-red-500 text-6xl mb-4" />
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  const filteredSales = selectedBranch === "all"
    ? salesSummary
    : salesSummary.filter(sale => sale.branchid === selectedBranch);

  const pieData = {
    labels: filteredSales.map((data) => data.bname),
    datasets: [
      {
        data: filteredSales.map((data) => data.sales),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const pieOptions = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '50%', // เปลี่ยนจาก pie เป็น donut
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
      legend: {
        position: 'right', // ตั้ง legend ไว้ที่ด้านบน
        labels: {
          font: {
            size: 14, // ปรับขนาดฟอนต์ของ label
            padding: 10, // ระยะห่างของ label
          },
          boxWidth: 20, // ขนาดกล่องสีของ legend
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2, // เพิ่มขนาดขอบ
      },
    },
  };

  const barData = {
    labels: keyMetrics.map((metric) => metric.label),
    datasets: [
      {
        label: "Metrics",
        data: keyMetrics.map((metric) => metric.value),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  const topProductsData = {
    labels: topProducts.map((product) => product.productname),
    datasets: [
      {
        data: topProducts.map((product) => product.quantity),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const handleViewAllClick = () => {
    setSelectedBranch(prevState => (prevState === "all" ? userBranchId : "all"));
  };
  
  return (
    <div className="p-4 min-h-screen text-black">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Dashboard</h1>

      <div className="sticky top-0 right-0 p-4 mb-6 z-10">
        {/* View All Button */}
        <button
          onClick={handleViewAllClick}
          className="btn border-none bg-teal-500 text-white p-2 rounded mb-6"
        >
          {selectedBranch === "all" ? "View My Branch" : "View All Branches"}
        </button>
      </div>


      {/* Sales and Top Selling Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-gray-600">

        {/* Total Sales (THB) */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex items-center justify-between">
          <HiOutlineCurrencyDollar  className="text-teal-500 text-6xl" />
          <div className="text-right">
            <h2 className="font-semibold mb-4">Total Sales (THB)</h2>
            <div className="text-2xl font-bold text-teal-500">
              ฿{keyMetrics[0]?.value.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Total Sales (Pieces) */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex items-center justify-between">
          <HiOutlineShoppingCart  className="text-teal-500 text-6xl" />
          <div className="text-right">
            <h2 className="font-semibold mb-4">Total Sales (Pieces)</h2>
            <div className="text-2xl font-bold text-teal-500">
              {keyMetrics[1]?.value.toLocaleString()} Pieces
            </div>
          </div>
        </div>

        {/* Low Stock Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex items-center justify-between">
          <HiOutlineCube  className="text-red-500 text-6xl" />
          <div className="text-right">
            <h2 className="font-semibold mb-4">Low Stock (Products)</h2>
            <div className="text-2xl font-bold text-red-500">
              {lowStockProducts.length} Low on Stock
            </div>
          </div>
        </div>

      </div>

      {/* Top Selling Products */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 text-gray-600">
        <h2 className="font-semibold mb-4">Top Sale Products</h2>
        <div className="w-72 mx-auto">
          <Pie data={topProductsData} options={{ ...pieOptions, maintainAspectRatio: false }} />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn border-none bg-teal-500 text-white p-2 rounded mt-4"
        >
          View Sales Products
        </button>
      </div>

      {/* Show Modal */}
      <SoldProductsModal
        show={showModal}
        closeModal={handleCloseModal}
        products={soldProducts}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-gray-600">
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="font-semibold mb-4">Sales Summary (Pie Chart)</h2>
          <div className="w-72 mx-auto">
            <Pie data={pieData} options={{ ...pieOptions, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="font-semibold mb-4">Key Metrics (Bar Chart)</h2>
          <div className="w-72 mx-auto">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6 text-gray-600">
        {/* Sales Summary Table */}
        <div className="bg-white shadow-lg rounded-lg p-4 text-gray-600">
          <h2 className="font-semibold mb-4">Sales Summary (Table)</h2>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-1 text-left">Branch Name</th>
                <th className="border border-gray-300 p-1 text-left">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((data, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-1">{data.bname}</td>
                  <td className="border border-gray-300 p-1">฿{data.sales.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Sale Recents Table */}
        <div className="bg-white shadow-lg rounded-lg p-4 text-gray-600">
          <h2 className="font-semibold mb-4">Sale Recents</h2>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-1 text-left">Receipt Number</th>
                <th className="border border-gray-300 p-1 text-left">Branch Name</th>
                <th className="border border-gray-300 p-1 text-left">Employee Name</th>
                <th className="border border-gray-300 p-1 text-left">Total Sales (THB)</th>
                <th className="border border-gray-300 p-1 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {saleRecents.map((sale, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-1">{sale.receiptnumber}</td>
                  <td className="border border-gray-300 p-1">
                    {branches.find(branch => branch.branchid === sale.branchid)?.bname}
                  </td>
                  <td className="border border-gray-300 p-1">{sale.employeename}</td>
                  <td className="border border-gray-300 p-1">{sale.totalamount.toLocaleString()}</td>
                  <td className="border border-gray-300 p-1">{formatDate(sale.createdat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>  
    </div>
  );
};

export default DashboardPage;
