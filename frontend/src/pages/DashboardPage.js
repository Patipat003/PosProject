import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import ApexCharts from "react-apexcharts";
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
import { HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineCube } from 'react-icons/hi'; // Heroicons
import moment from "moment";
import ProductMovementChart from "../components/layout/ui/ProductMovementChart";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const POLLING_INTERVAL = 5000; // Polling interval in milliseconds (5 seconds)

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Utility function to format date
const formatDate = (dateString) => {
  const zonedDate = toZonedTime(dateString, 'UTC');
  return format(zonedDate, "d/MM/yyyy, HH:mm");
};

// Utility function to calculate sales by time range (day, month, year)
const calculateSalesByTime = (salesData, range) => {
  const salesByTime = {};

  salesData.forEach(sale => {
    const date = new Date(sale.createdat);
    let key;

    if (range === "day") {
      key = format(date, "yyyy-MM-dd"); // Compare by day
    } else if (range === "month") {
      key = format(date, "yyyy-MM"); // Compare by month
    } else if (range === "year") {
      key = format(date, "yyyy"); // Compare by year
    }

    if (!salesByTime[key]) {
      salesByTime[key] = 0;
    }
    salesByTime[key] += sale.totalamount;
  });

  return Object.entries(salesByTime).map(([time, sales]) => ({
    time,
    sales,
  }));
};

// Utility function to fetch data
const fetchData = async (token, selectedBranch, branchid, timeRange = "day") => {
  const config = { headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" } };
  const endpoints = [
    "saleitems", "sales", "products", "branches", "inventory", "receipts", "employees"
  ];
  const responses = await Promise.all(endpoints.map(endpoint => 
    axios.get(`${API_BASE_URL}/${endpoint}`, config)
  ));
  const [saleItemsData, salesData, productsData, branchesData, inventory, receiptsData, employeesData] = 
    responses.map(res => res.data.Data);

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
    acc[productid] = acc[productid] ? { ...acc[productid], quantity: acc[productid].quantity + quantity } : { quantity, productid };
    return acc;
  }, {});

  const topSellingProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(item => {
      const product = productsData.find(p => p.productid === item.productid);
      return {
        ...item,
        productname: product ? product.productname : "Unknown",
        imageurl: product ? product.imageurl : "",
      };
    });

  const branchSales = salesData.reduce((acc, sale) => {
    const branch = acc.find((b) => b.branchid === sale.branchid);
    if (branch) branch.sales += sale.totalamount;
    else acc.push({ branchid: sale.branchid, sales: sale.totalamount });
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

  const lowStock = inventory.filter(item => item.quantity < 100 && (selectedBranch === "all" || item.branchid === branchid));

  const saleRecentsData = selectedBranch === "all"
    ? salesData
    : salesData.filter(sale => sale.branchid === branchid);

  const saleRecentsWithDetails = saleRecentsData.map(sale => {
    const receipt = receiptsData.find(receipt => receipt.saleid === sale.saleid);
    const employee = employeesData.find(employee => employee.employeeid === sale.employeeid);
    return {
      ...sale,
      receiptnumber: receipt ? receipt.receiptnumber : "N/A",
      employeename: employee ? employee.name : "Unknown",
    };
  });

  const sortedSaleRecents = saleRecentsWithDetails
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
    .slice(0, 10);

  const salesByTime = calculateSalesByTime(filteredSales, timeRange);  
  

  return {
    branchesData,
    salesWithBranchNames,
    topSellingProducts,
    inventory,
    totalSales,
    totalQuantity,
    lowStock,
    sortedSaleRecents,
    salesByTime,
  };
};

const DashboardPage = () => {
  const [salesSummary, setSalesSummary] = useState([]);
  const [keyMetrics, setKeyMetrics] = useState([]);
  const [branches, setBranches] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [saleRecents, setSaleRecents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("!all");
  const [userBranchId, setUserBranchId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [salesByTime, setSalesByTime] = useState([]);
  const [timeRange, setTimeRange] = useState("day"); // ค่าเริ่มต้นเป็น "day"

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const branchid = decodedToken.branchid;
    const userRole = decodedToken.role; // ดึง role ของ user
    setUserBranchId(branchid);
    setUserRole(userRole);
  
    const loadData = async () => {
      try {
        const {
          branchesData,
          salesWithBranchNames,
          topSellingProducts,
          totalSales,
          totalQuantity,
          lowStock,
          sortedSaleRecents,
          salesByTime,
        } = await fetchData(token, selectedBranch, branchid, timeRange);  // Pass timeRange here
  
        setBranches(branchesData);
        setSalesSummary(salesWithBranchNames);
        setTopProducts(topSellingProducts);
        setKeyMetrics([{ label: "Total Sales", value: totalSales }, { label: "Total Quantity", value: totalQuantity }]);
        setLowStockProducts(lowStock);
        setSaleRecents(sortedSaleRecents);
        setSalesByTime(salesByTime);  // Make sure this is set
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };
  
    loadData();
    const intervalId = setInterval(loadData, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [selectedBranch, timeRange]);  // TimeRange added here to trigger updates when it changes  
  

  const handleCloseModal = () => setShowModal(false);

  const soldProducts = topProducts.map(product => ({
    productname: product.productname,
    quantity: product.quantity,
    price: product.price,
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
        <span className="text-red-500 text-lg font-semibold">Loading...</span>
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

  // Pie chart data and options
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
    cutout: '50%',
    animation: {
      animateScale: true, 
      animateRotate: true,
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 5,
      },
      legend: {
        position: "right",
        align: "center",
        labels: {
          font: { size: 14, padding: 10 },
          boxWidth: 30,
        },
      },
    },
    elements: {
      arc: { borderWidth: 2, borderColor: "#ffffff" }, // Arc borders
    },
  };


  const barData = {
    labels: keyMetrics.map((metric) => metric.label),
    datasets: [
      {
        label: "Metrics",
        data: keyMetrics.map((metric) => metric.value),
        backgroundColor: "#420505",
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

  // Sales Graph Data (ApexCharts)
    const salesGraphOptions = {
      chart: { type: "line", height: 350 },
      xaxis: { categories: salesByTime.map(data => moment(data.time).format("D/M/YY")) },
      stroke: { width: 3, curve: "smooth" },
      colors: ["#FF6384"],
      yaxis: { title: { text: "Total Sales (THB)" } },
    };
  
    const salesGraphSeries = [{ name: "Sales", data: salesByTime.map(data => data.sales) }];
   

  const handleViewAllClick = () => {
    setSelectedBranch(prevState => (prevState === "all" ? userBranchId : "all"));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6 min-h-screen">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Dashboard</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600 mb-4">View Overall Dashboard here.</p>
        {/* แสดงปุ่ม View All เฉพาะ Super Admin */}
        {userRole === "Super Admin" && (
          <button
            onClick={handleViewAllClick}
            className="btn border-red-600 bg-white text-red-600 rounded-lg fixed top-20 right-2 z-5 mt-2 hover:bg-red-600 hover:text-white hover:border-red-600"
          >
            {selectedBranch === "all" ? "View My Branch" : "View All Branches"}
          </button>
        )}
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-gray-600">
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex items-center justify-between">
            <HiOutlineCurrencyDollar className="text-red-500 text-6xl" />
            <div className="text-right">
            <h2 className="font-semibold mb-4">Total Sales (THB)</h2>
              <div className="text-2xl font-bold text-red-500">
                ฿{keyMetrics[0]?.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex items-center justify-between">
            <HiOutlineShoppingCart className="text-red-500 text-6xl" />
            <div className="text-right">
              <h2 className="font-semibold mb-4">Total Sales (Units)</h2>
              <div className="text-2xl font-bold text-red-500">
                {keyMetrics[1]?.value.toLocaleString()} Units
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex items-center justify-between">
            <HiOutlineCube className="text-red-500 text-6xl" />
            <div className="text-right">
              <h2 className="font-semibold mb-4">Low Stock (Products)</h2>
              <div className="text-2xl font-bold text-red-500">
                {lowStockProducts.length} Low on Stock
              </div>
            </div>
          </div>
        </div>

        {/* New Top Sale Products Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 text-gray-600">
        <h2 className="font-semibold mb-4">Top Sale Products (List)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topProducts.map((product, index) => (
            <div key={index} className="relative border-2 border-gray-300 p-4 rounded-lg shadow-sm">
              {/* แสดงตัวเลขอันดับ */}
              <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                {index + 1}
              </span>
              <img
                src={product.imageurl || "https://via.placeholder.com/150"}
                alt={product.productname}
                className="w-full h-32 object-contain rounded-md mb-2"
              />
              <h3 className="font-bold text-red-600">{product.productname}</h3>
              <p className="text-sm text-gray-500">Sold: {product.quantity} Units</p>
            </div>
          ))}
        </div>
      </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 text-gray-600">
          <h2 className="font-semibold mb-4">Top Sale Products (Pie Chart)</h2>
          <div className="w-72 mx-auto">
            <Pie data={topProductsData} options={{ ...pieOptions, maintainAspectRatio: false }} />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn border-red-600 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600"
          >
            View Sales Products
          </button>
        </div>

        <SoldProductsModal
          show={showModal}
          closeModal={handleCloseModal}
          products={soldProducts}
        />

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 text-gray-600">
          <h2 className="font-semibold mb-4">Sales Over Time</h2>
          <div className="flex justify-between items-center mb-4">
            {/* Time Range Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setTimeRange("day")}
                className={`btn ${timeRange === "day" ? "btn bg-red-800 border-none hover:bg-red-900" : "btn bg-gray-800 border-none hover:bg-red-800 hover:border-none"} text-white`}
              >
                Day
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`btn ${timeRange === "month" ? "btn bg-red-800 border-none hover:bg-red-900" : "btn bg-gray-800 border-none hover:bg-red-800 hover:border-none"} text-white`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`btn ${timeRange === "year" ? "btn bg-red-800 border-none hover:bg-red-900" : "btn bg-gray-800 border-none hover:bg-red-800 hover:border-none"} text-white`}
              >
                Year
              </button>


            </div>
          </div>

          <div className="w-full h-96 px-4">
            <ApexCharts options={salesGraphOptions} series={salesGraphSeries} type="line" height={350} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-gray-600">
          <div className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="font-semibold mb-4">Sales Summary (Pie Chart)</h2>
            <div className="w-72 mx-auto">
              <Pie data={pieData} options={{ ...pieOptions, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="font-semibold mb-4">Sales Summary (Table)</h2>
            <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="border text-sm px-4 py-2 text-left">Branch Name</th>
                  <th className="border text-sm px-4 py-2 text-left">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{data.bname}</td>
                    <td className="border border-gray-300 px-4 py-2">฿{data.sales.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>    
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6 text-gray-600">

          <ProductMovementChart />

          <div className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="font-semibold mb-4">Sale Recents</h2>
            <table className="table-auto table-xs min-w-full border-collapse border-4 border-gray-300 mb-4 text-gray-800">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="border text-sm px-4 py-2 text-left">Receipt Number</th>
                  <th className="border text-sm px-4 py-2 text-left">Branch Name</th>
                  <th className="border text-sm px-4 py-2 text-left">Employee Name</th>
                  <th className="border text-sm px-4 py-2 text-left">Total Sales (THB)</th>
                  <th className="border text-sm px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {saleRecents.map((sale, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{sale.receiptnumber}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {branches.find(branch => branch.branchid === sale.branchid)?.bname}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{sale.employeename}</td>
                    <td className="border border-gray-300 px-4 py-2">{sale.totalamount.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2">{formatDate(sale.createdat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> 
      </div>
    </div>
  );
};

export default DashboardPage;