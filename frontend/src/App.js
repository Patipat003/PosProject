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
import EmployeeTransferPage from "./pages/EmployeeTransferPage";
import InventoryPage from "./pages/InventoryPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./Contexts/AuthContext";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import SelectBranchPage from "./pages/SelectBranchPage";
import BranchesPage from "./pages/BranchesPage";
import ReportsEmployeePage from "./pages/ReportsEmployeePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          <Route 
            path="/select-branch"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}> {/* Define allowed roles */}
                <SelectBranchPage />
              </ProtectedRoute>
            }
          />
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
              <ProtectedRoute allowedRoles={['Cashier', 'Super Admin', 'Manager']}>
                <MainLayout>
                  <SalesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesHistory"
            element={
              <ProtectedRoute allowedRoles={['Cashier', 'Super Admin', 'Manager', 'Audit']}>
                <MainLayout>
                  <SalesHistoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/product"
            element={
              <ProtectedRoute allowedRoles={['Cashier', 'Super Admin', 'Manager', 'Audit']}>
                <MainLayout>
                  <ProductPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Manager', 'Audit']}>
                <MainLayout>
                  <ReportsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/userManagement"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Manager']}>
                <MainLayout>
                  <UserManagementPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/detailReport"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Manager', 'Audit']}>
                <MainLayout>
                  <DetailReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employeeTransfer"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <MainLayout>
                  <EmployeeTransferPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Manager', 'Audit', 'Cashier']}>
                <MainLayout>
                  <InventoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/branchesManagement"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <MainLayout>
                  <BranchesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employeeReports"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Manager', 'Audit']}>
                <MainLayout>
                  <ReportsEmployeePage />
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
