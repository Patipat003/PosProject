import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/SalesPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import ProductPage from "./pages/ProductPage";
import ReportsPage from "./pages/ReportsPage";
import UserManagementPage from "./pages/UserManagementPage";
import DetailReportPage from "./pages/DetailReportPage";
import CustomerRankPage from "./pages/CustomerRankPage";
import CashFlowPage from "./pages/CashFlowPage";


function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/salesHistory" element={<SalesHistoryPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/userManagement" element={<UserManagementPage />} />
          <Route path="/detailReport" element={<DetailReportPage />} />
          <Route path="/customerRank" element={<CustomerRankPage />} />
          <Route path="/cashFlow" element={<CashFlowPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
