import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css';
import { ToastContainer } from "react-toastify";
import MainLayout from "./components/layout/MainLayout";

// feature pages
import DashboardPage from "./features/dashboard/pages/DashboardPage"; // dashboard
import SalesPage from "./features/sales/pages/SalesPage"; // sales
import SalesHistoryPage from "./features/sales/pages/SalesHistoryPage"; // sales history
import ProductPage from "./features/products/pages/ProductPage"; // product
import InventoryPage from "./features/inventory/pages/InventoryPage"; // inventory
import ReportsPage from "./features/reports/pages/ReportsPage"; // reports
import ReportsEmployeePage from "./features/reports/pages/ReportsEmployeePage"; // employee reports
import DetailReportPage from "./features/reports/pages/DetailReportPage";  // detail report
import UserManagementPage from "./features/users/pages/UserManagementPage"; // user management
import EmployeeTransferPage from "./features/users/pages/EmployeeTransferPage"; // employee transfer
import BranchesPage from "./features/branches/pages/BranchesPage"; // branches management

// main pages
import LoginPage from "./features/login/pages/LoginPage";
import SelectBranchPage from "./features/login/pages/SelectBranchPage";

// context
import { AuthProvider } from "./Contexts/AuthContext";
import { StockThresholdProvider } from "./Contexts/StockThresholdContext";

// routes
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <StockThresholdProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            <Route 
              path="/select-branch"
              element={
                <ProtectedRoute allowedRoles={['Super Admin']}> 
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
              path="/sales-history"
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
              path="/user-management"
              element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Manager']}>
                  <MainLayout>
                    <UserManagementPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/detail-report"
              element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Manager', 'Audit']}>
                  <MainLayout>
                    <DetailReportPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-transfer"
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
              path="/branches-management"
              element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <MainLayout>
                    <BranchesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-reports"
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
      </StockThresholdProvider>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
