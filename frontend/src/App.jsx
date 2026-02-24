import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import CreateQuotation from './pages/quotations/CreateQuotation';
import AllQuotations from './pages/quotations/AllQuotations';
import QuotationTemplates from './pages/quotations/QuotationTemplates';
import PendingQuotations from './pages/quotations/PendingQuotations';
import ApprovedQuotations from './pages/quotations/ApprovedQuotations';
import Clients from './pages/clients/Clients';
import Invoices from './pages/finance/Invoices';
import RevenueForecast from './pages/finance/RevenueForecast';
import DiscountAnalysis from './pages/finance/DiscountAnalysis';
import Leads from './pages/clients/Leads';
import RejectedQuotations from './pages/quotations/RejectedQuotations';
import FollowUps from './pages/clients/FollowUps';
import Tasks from './pages/tasks/Tasks';

// Sales Module
import SalesDashboard from './pages/sales/SalesDashboard';
import SalesReports from './pages/sales/SalesReports';
import SalesPerformance from './pages/sales/SalesPerformance';
import Opportunities from './pages/sales/Opportunities';
import OpportunitiesPipeline from './pages/sales/OpportunitiesPipeline';

// Report Module
import MonthlyQuotationReport from './pages/reports/MonthlyQuotationReport';
import ConversionRate from './pages/reports/ConversionRate';
import CustomReports from './pages/reports/CustomReports';
import QuotationValueReport from './pages/reports/QuotationValueReport';

// System Module
import Settings from './pages/system/Settings';
import UsersRoles from './pages/system/UsersRoles';
import AuditLogs from './pages/system/AuditLogs';
import Automation from './pages/system/Automation';
import Templates from './pages/system/Templates';
import AccountingIntegration from './pages/system/AccountingIntegration';
import ClientLogin from './pages/portal/ClientLogin';
import ForgotPassword from './pages/portal/ForgotPassword';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/styles/App.css';
import './assets/styles/kanban.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create-quotation" element={<CreateQuotation />} />
          <Route path="quotation-templates" element={<QuotationTemplates />} />
          <Route path="all-quotations" element={<AllQuotations />} />
          <Route path="pending-quotations" element={<PendingQuotations />} />
          <Route path="approved-quotations" element={<ApprovedQuotations />} />
          <Route path="rejected-quotations" element={<RejectedQuotations />} />
          <Route path="clients" element={<Clients />} />
          <Route path="leads" element={<Leads />} />
          <Route path="follow-ups" element={<FollowUps />} />
          {/* Finance Routes */}
          <Route path="quotation-value-report" element={<QuotationValueReport />} />
          <Route path="revenue-forecast" element={<RevenueForecast />} />
          <Route path="discount-analysis" element={<DiscountAnalysis />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="tasks" element={<Tasks />} />

          {/* Sales Routes */}
          <Route path="sales" element={<SalesDashboard />} />
          <Route path="sales-reports" element={<SalesReports />} />
          <Route path="sales-performance" element={<SalesPerformance />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="opportunities-pipeline" element={<OpportunitiesPipeline />} />

          {/* Report Routes */}
          <Route path="monthly-quotation-report" element={<MonthlyQuotationReport />} />
          <Route path="conversion-rate" element={<ConversionRate />} />
          <Route path="custom-reports" element={<CustomReports />} />

          {/* System Routes */}
          <Route path="settings" element={<Settings />} />
          <Route path="users-roles" element={<UsersRoles />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="automation" element={<Automation />} />
          <Route path="templates" element={<Templates />} />
          <Route path="accounting-integration" element={<AccountingIntegration />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
