import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css';
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
import EmployeeTransferPage from "./pages/EmployeeTransferPage";
import PaymentPage from "./pages/PaymentPage";
import InventoryPage from "./pages/InventoryPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./Contexts/AuthContext";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import ReceiptsPage from "./pages/ReceiptsPage";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SalesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesHistory"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SalesHistoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/product"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ReportsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/userManagement"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserManagementPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/detailReport"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DetailReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customerRank"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CustomerRankPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashFlow"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CashFlowPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employeeTransfer"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EmployeeTransferPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PaymentPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <InventoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ReceiptsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
