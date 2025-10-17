import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import InvoiceCreation from "./pages/invoice-creation";
import Dashboard from "./pages/dashboard";
import ExpenseManagement from "./pages/expense-management";
import BankIntegration from "./pages/bank-integration";
import TimeTracking from "./pages/time-tracking";
import ClientManagement from "./pages/client-management";
import ProjectsAndActivities from "./pages/projects-and-activities";
import Authentication from "./pages/authentication";
import UserProfileManagement from "./pages/user-profile-management";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/ui/Login";
import Signup from "./components/ui/Signup";
import TinkCallbackHandler from "./pages/bank-integration/components/TinkCallbackHandler";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* ✅ Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ✅ Core pages */}
            <Route path="/time-tracking" element={<TimeTracking />} />
            <Route path="/client-management" element={<ClientManagement />} />
            <Route path="/invoice-creation" element={<InvoiceCreation />} />
            <Route path="/expense-management" element={<ExpenseManagement />} />
            <Route path="/projects-and-activities" element={<ProjectsAndActivities />} />

            {/* ✅ Bank integratie */}
            <Route path="/bank-integration" element={<BankIntegration />} />

            {/* ✅ Tink callback route */}
            <Route path="/tink/callback" element={<TinkCallbackHandler />} />

            {/* ✅ Authentication */}
            <Route path="/authentication" element={<Authentication />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/user-profile-management" element={<UserProfileManagement />} />

            {/* ✅ Catch-all voor 404 */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
