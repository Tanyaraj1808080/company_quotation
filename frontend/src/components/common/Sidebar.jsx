import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav id="sidebar" className="sidebar bg-light shadow-sm">
        <div className="sidebar-header d-flex align-items-center justify-content-center py-3">
            <Link to="/" className="logo text-decoration-none d-flex align-items-center">
                <img src="/logo.svg" alt="Mindmanthan Logo" className="logo-img me-2" style={{height: '30px'}} />
                <span className="fs-5 fw-bold text-dark">Mindmanthan</span>
            </Link>
        </div>

        <ul className="list-unstyled components mb-0">
            {/* MENU Section */}
            <li>
                <Link to="/" className={`nav-link text-dark py-2 px-3 d-flex align-items-center ${isActive('/')}`}>
                    <i className="bi bi-grid me-2"></i>
                    Dashboard
                </Link>
            </li>
            <li>
                <a href="#quotationsSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle nav-link text-dark py-2 px-3 d-flex align-items-center">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Quotations
                </a>
                <ul className="collapse list-unstyled" id="quotationsSubmenu">
                    <li><Link to="/create-quotation" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/create-quotation')}`}><i className="bi bi-plus-circle me-2"></i>Create Quotation</Link></li>
                    <li><Link to="/quotation-templates" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/quotation-templates')}`}><i className="bi bi-file-earmark-richtext me-2"></i>Quotation Templates</Link></li>
                    <li><Link to="/all-quotations" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/all-quotations')}`}><i className="bi bi-files me-2"></i>All Quotations</Link></li>
                    <li><Link to="/pending-quotations" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/pending-quotations')}`}><i className="bi bi-hourglass-split me-2"></i>Pending Quotations</Link></li>
                    <li><Link to="/approved-quotations" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/approved-quotations')}`}><i className="bi bi-check-circle me-2"></i>Approved Quotations</Link></li>
                    <li><Link to="/rejected-quotations" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/rejected-quotations')}`}><i className="bi bi-x-circle me-2"></i>Rejected Quotations</Link></li>
                </ul>
            </li>

            {/* SALES Section */}
            <li>
                <a href="#salesSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle nav-link text-dark py-2 px-3 d-flex align-items-center">
                    <i className="bi bi-graph-up me-2"></i>
                    Sales
                </a>
                <ul className="collapse list-unstyled" id="salesSubmenu">
                    <li><Link to="/sales" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/sales')}`}><i className="bi bi-speedometer me-2"></i>Sales Dashboard</Link></li>
                    <li><Link to="/sales-reports" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/sales-reports')}`}><i className="bi bi-bar-chart-line me-2"></i>Sales Reports</Link></li>
                </ul>
            </li>

            {/* CLIENTS Section */}
            <li>
                <a href="#clientsSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle nav-link text-dark py-2 px-3 d-flex align-items-center">
                    <i className="bi bi-people me-2"></i>
                    Clients
                </a>
                <ul className="collapse list-unstyled" id="clientsSubmenu">
                    <li><Link to="/clients" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/clients')}`}><i className="bi bi-person-lines-fill me-2"></i>All Clients</Link></li>
                    <li><Link to="/leads" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/leads')}`}><i className="bi bi-person-plus me-2"></i>Leads</Link></li>
                    <li><Link to="/opportunities" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/opportunities')}`}><i className="bi bi-briefcase me-2"></i>Opportunities</Link></li>
                    <li><Link to="/opportunities-pipeline" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/opportunities-pipeline')}`}><i className="bi bi-kanban me-2"></i>Opportunity Pipeline</Link></li>
                    <li><Link to="/follow-ups" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/follow-ups')}`}><i className="bi bi-clock-history me-2"></i>Follow Ups</Link></li>
                    <li><Link to="/tasks" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/tasks')}`}><i className="bi bi-card-checklist me-2"></i>Task Management</Link></li>
                </ul>
            </li>

            {/* CLIENT PORTAL Section */}
            <li>
                <Link to="/client-login" className={`nav-link text-dark py-2 px-3 d-flex align-items-center ${isActive('/client-login')}`}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Client Login
                </Link>
            </li>

            {/* FINANCE Section */}
            <li>
                <a href="#financeSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle nav-link text-dark py-2 px-3 d-flex align-items-center">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Finance
                </a>
                <ul className="collapse list-unstyled" id="financeSubmenu">
                    <li><Link to="/quotation-value-report" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/quotation-value-report')}`}><i className="bi bi-file-earmark-bar-graph me-2"></i>Quotation Value Report</Link></li>
                    <li><Link to="/revenue-forecast" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/revenue-forecast')}`}><i className="bi bi-graph-up me-2"></i>Revenue Forecast</Link></li>
                    <li><Link to="/discount-analysis" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/discount-analysis')}`}><i className="bi bi-percent me-2"></i>Discount Analysis</Link></li>
                    <li><Link to="/invoices" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/invoices')}`}><i className="bi bi-receipt me-2"></i>Invoices</Link></li>
                </ul>
            </li>

            {/* REPORTS & ANALYTICS Section */}
            <li>
                <a href="#reportsSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle nav-link text-dark py-2 px-3 d-flex align-items-center">
                    <i className="bi bi-bar-chart-fill me-2"></i>
                    Reports & Analytics
                </a>
                <ul className="collapse list-unstyled" id="reportsSubmenu">
                    <li><Link to="/monthly-quotation-report" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/monthly-quotation-report')}`}><i className="bi bi-file-earmark-bar-graph me-2"></i>Monthly Quotation Report</Link></li>
                    <li><Link to="/conversion-rate" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/conversion-rate')}`}><i className="bi bi-speedometer me-2"></i>Conversion Rate</Link></li>
                    <li><Link to="/sales-performance" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/sales-performance')}`}><i className="bi bi-graph-up-arrow me-2"></i>Sales Performance</Link></li>
                    <li><Link to="/custom-reports" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/custom-reports')}`}><i className="bi bi-bar-chart-fill me-2"></i>Custom Reports</Link></li>
                </ul>
            </li>

            {/* UTILITIES Section */}
            <li>
                <a href="#utilitiesSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle nav-link text-dark py-2 px-3 d-flex align-items-center">
                    <i className="bi bi-tools me-2"></i>
                    Utilities
                </a>
                <ul className="collapse list-unstyled" id="utilitiesSubmenu">
                    <li><Link to="/templates" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/templates')}`}><i className="bi bi-file-earmark-richtext me-2"></i>Templates</Link></li>
                    <li><Link to="/taxes-charges" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/taxes-charges')}`}><i className="bi bi-calculator me-2"></i>Taxes & Charges</Link></li>
                    <li><Link to="/terms-conditions" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/terms-conditions')}`}><i className="bi bi-journal-check me-2"></i>Terms & Conditions</Link></li>
                </ul>
            </li>

            {/* SYSTEM Section */}
            <li>
                <a href="#systemSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle nav-link text-dark py-2 px-3 d-flex align-items-center">
                    <i className="bi bi-gear-fill me-2"></i>
                    System
                </a>
                <ul className="collapse list-unstyled" id="systemSubmenu">
                    <li><Link to="/users-roles" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/users-roles')}`}><i className="bi bi-person-gear me-2"></i>Users & Roles</Link></li>
                    <li><Link to="/settings" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/settings')}`}><i className="bi bi-gear me-2"></i>Settings</Link></li>
                    <li><Link to="/audit-logs" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/audit-logs')}`}><i className="bi bi-file-earmark-medical me-2"></i>Audit Logs</Link></li>
                    <li><Link to="/automation" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/automation')}`}><i className="bi bi-robot me-2"></i>Automation Rules</Link></li>
                    <li><Link to="/accounting-integration" className={`nav-link text-dark py-2 ps-3 d-flex align-items-center ${isActive('/accounting-integration')}`}><i className="bi bi-cash-coin me-2"></i>Accounting Integration</Link></li>
                </ul>
            </li>
            
            <li>
                <a href="#" className="nav-link text-dark py-2 px-3 d-flex align-items-center" onClick={(e) => { e.preventDefault(); alert('Logout'); }}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                </a>
            </li>
        </ul>
    </nav>
  );
};

export default Sidebar;
