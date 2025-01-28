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
import { AiOutlineExclamationCircle } from "react-icons/ai"; // Error Icon
import { Player } from "@lottiefiles/react-lottie-player"; // Lottie Player
import SoldProductsModal from "../components/layout/ui/SoldProductsModal"; // Import the SoldProductsModal component

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const POLLING_INTERVAL = 5000; // Polling interval in milliseconds (5 seconds)

const DashboardPage = () => {
  const [salesSummary, setSalesSummary] = useState([]);
  const [keyMetrics, setKeyMetrics] = useState([]);
  const [branches, setBranches] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
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
  
        const saleItemsData = saleItemsResponse.data.Data;
        const salesData = salesResponse.data.Data;
        const productsData = productsResponse.data.Data;
        const branchesData = branchesResponse.data.Data;
  
        // Decode token to get user branchid and set it in state
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const branchid = decodedToken.branchid; // Get the branchid from token
        setUserBranchId(branchid); // Store branchid in state
  
        // Filter sales based on userBranchId
        const filteredSales = selectedBranch === "all"
          ? salesData
          : salesData.filter(sale => sale.branchid === branchid);
  
        // Filter saleItems for that branch
        const saleItemsForBranch = saleItemsData.filter(saleItem =>
          filteredSales.some(sale => sale.saleid === saleItem.saleid)
        );
  
        // Calculate total quantity sold and total sales
        const totalQuantity = saleItemsForBranch.reduce((sum, item) => sum + item.quantity, 0);
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalamount, 0);
  
        // Calculate top selling products
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
  
        // Sales summary by branch
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
  
        setKeyMetrics([ { label: "Total Sales", value: totalSales }, { label: "Total Quantity", value: totalQuantity } ]);
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
  }, [selectedBranch]);  // Depend on selectedBranch to refetch when it changes
  
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
    <div className="p-6 bg-gray-100 min-h-screen text-black">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Dashboard</h1>

      {/* View All Button */}
      <button
        onClick={handleViewAllClick}
        className="bg-teal-500 text-white p-2 rounded mb-6"
      >
        {selectedBranch === "all" ? "View My Branch" : "View All Branches"}
      </button>

      {/* Total Sales and Top Selling Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-xl mb-4">Total Sales (เงิน)</h2>
          <div className="text-2xl font-bold text-teal-500">
            ฿{keyMetrics[0]?.value.toLocaleString()}
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-xl mb-4">Total Sales (จำนวนสินค้า)</h2>
          <div className="text-2xl font-bold text-teal-500">
            {keyMetrics[1]?.value.toLocaleString()} items
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-xl mb-4">Top Selling Products</h2>
          <div className="w-72 mx-auto">
            <Pie data={topProductsData} options={{ ...pieOptions, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* แสดง Modal */}
      <SoldProductsModal
        show={showModal}
        closeModal={handleCloseModal}
        products={soldProducts}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-2">Sales Summary (Pie Chart)</h2>
          <div className="w-72 mx-auto">
            <Pie data={pieData} options={{ ...pieOptions, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-2">Key Metrics (Bar Chart)</h2>
          <div className="w-72 mx-auto">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Sales Summary Table */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-2">Sales Summary (Table)</h2>
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
    </div>
  );
};

export default DashboardPage;
