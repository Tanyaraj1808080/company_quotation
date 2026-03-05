import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/api/quotations');
        const data = res.data;
        setQuotations(data);

        const total = data.length;
        const approved = data.filter(q => q.status === 'Approved').length;
        const pending = data.filter(q => q.status === 'Pending').length;
        const rejected = data.filter(q => q.status === 'Rejected').length;
        const totalValue = data.reduce((sum, q) => sum + parseFloat(q.totalValue || 0), 0);
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

        setKpis([
          { title: 'Total Quotations', value: total.toString(), icon: 'bi-journal-text', color: 'primary', trend: '+0%', isUp: true },
          { title: 'Approved', value: approved.toString(), icon: 'bi-check2-circle', color: 'success', trend: '+0%', isUp: true },
          { title: 'Pending', value: pending.toString(), icon: 'bi-clock-history', color: 'warning', trend: '+0%', isUp: true },
          { title: 'Rejected', value: rejected.toString(), icon: 'bi-x-circle', color: 'danger', trend: '+0%', isUp: false },
          { title: 'Total Value', value: `€${totalValue.toLocaleString()}`, icon: 'bi-currency-euro', color: 'info', trend: '+0%', isUp: true },
          { title: 'Approval Rate', value: `${approvalRate}%`, icon: 'bi-percent', color: 'dark', trend: '+0%', isUp: true },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Quotations',
      data: [10, 15, 8, 20, 12, 25],
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#0d6efd',
      pointBorderWidth: 2,
    }]
  };

  const ratioData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [
        quotations.filter(q => q.status === 'Approved').length || 0,
        quotations.filter(q => q.status === 'Pending').length || 0,
        quotations.filter(q => q.status === 'Rejected').length || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const quickActions = [
    { title: 'Create Quotation', icon: 'bi-plus-circle', path: '/create-quotation', color: 'primary' },
    { title: 'Add Client', icon: 'bi-person-plus', path: '/clients', color: 'success' },
    { title: 'Record Payment', icon: 'bi-cash-stack', path: '/payments', color: 'info' },
    { title: 'Add Task', icon: 'bi-check2-square', path: '/tasks', color: 'warning' },
  ];

  const handleExport = () => {
    if (quotations.length === 0) {
      alert("No data available to export");
      return;
    }

    // Prepare CSV header and data
    const headers = ["Quotation ID", "Client Name", "Total Value", "Status", "Date Created"];
    const rows = quotations.map(q => [
      q.id,
      `"${q.clientName}"`,
      q.totalValue,
      q.status,
      q.dateCreated
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `quotation_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}><div className="spinner-border text-primary"></div></div>;
  }

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fade-in animate-up">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-800 mb-1">Business Overview</h2>
          <p className="text-muted mb-0">Track your business performance and quotation pipeline in real-time.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-white border shadow-sm rounded-pill px-4">
            <i className="bi bi-calendar3 me-2"></i> {currentDate}
          </button>
          <button className="btn btn-primary rounded-pill px-4 shadow" onClick={handleExport}>
            <i className="bi bi-download me-2"></i> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 g-md-4 mb-5">
        {kpis.map((kpi, idx) => (
          <div className="col-12 col-sm-6 col-md-4 col-xl-2" key={idx}>
            <div className="card h-100 border-0 shadow-sm card-hover">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`bg-${kpi.color} bg-opacity-10 text-${kpi.color} rounded-3 p-2 d-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px'}}>
                    <i className={`bi ${kpi.icon} fs-5`}></i>
                  </div>
                  <span className={`small fw-bold ${kpi.isUp ? 'text-success' : 'text-danger'}`}>
                    {kpi.trend}
                  </span>
                </div>
                <h6 className="text-muted small fw-bold text-uppercase mb-1">{kpi.title}</h6>
                <h4 className="fw-800 mb-0">{kpi.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-5">
        {/* Main Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100 p-2">
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Quotation Performance</h5>
              <div className="dropdown">
                <button className="btn btn-light btn-sm border text-muted px-3 rounded-pill" type="button">
                  Last 6 Months <i className="bi bi-chevron-down ms-1"></i>
                </button>
              </div>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
              <Line 
                data={trendData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#0f172a',
                      padding: 12,
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 },
                      cornerRadius: 10,
                      displayColors: false
                    }
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b' } },
                    y: { 
                      beginAtZero: true, 
                      grid: { color: '#f1f5f9', drawBorder: false },
                      ticks: { color: '#64748b', padding: 10 }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 p-2">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold mb-0">Status Distribution</h5>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center" style={{ height: '350px' }}>
              <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                <Doughnut 
                  data={ratioData} 
                  options={{ 
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: { legend: { display: false } }
                  }} 
                />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <h3 className="fw-800 mb-0">{quotations.length}</h3>
                  <p className="text-muted small mb-0 text-uppercase fw-bold">Total</p>
                </div>
              </div>
              <div className="mt-4 w-100 px-4">
                {ratioData.labels.map((label, i) => (
                  <div className="d-flex align-items-center justify-content-between mb-2" key={i}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ratioData.datasets[0].backgroundColor[i] }}></div>
                      <span className="small text-muted fw-bold">{label}</span>
                    </div>
                    <span className="small fw-800">{ratioData.datasets[0].data[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 p-2">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold mb-0">Quick Actions</h5>
            </div>
            <div className="card-body p-4 pt-2">
              <div className="row g-3">
                {quickActions.map((action, i) => (
                  <div className="col-6" key={i}>
                    <Link to={action.path} className="text-decoration-none">
                      <div className="p-3 border rounded-4 text-center transition-all bg-light bg-opacity-50 hover-bg-white border-light-subtle">
                        <i className={`bi ${action.icon} fs-3 text-${action.color} d-block mb-2`}></i>
                        <span className="small fw-bold text-dark">{action.title}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100 p-2">
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Quotations</h5>
              <Link to="/all-quotations" className="text-primary small fw-bold text-decoration-none">View All Activity <i className="bi bi-arrow-right"></i></Link>
            </div>
            <div className="card-body p-0 overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="ps-4">Client / Quote ID</th>
                      <th>Total Value</th>
                      <th>Status</th>
                      <th className="pe-4 text-end">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.slice(-5).reverse().map((q, idx) => (
                      <tr key={idx}>
                        <td className="ps-4">
                          <div className="fw-bold">{q.clientName}</div>
                          <div className="small text-muted">{q.id}</div>
                        </td>
                        <td className="fw-800">€{parseFloat(q.totalValue).toLocaleString()}</td>
                        <td>
                          <span className={`badge-modern ${
                            q.status === 'Approved' ? 'bg-success-soft' : 
                            q.status === 'Pending' ? 'bg-warning-soft text-warning' : 
                            'bg-danger-soft'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="pe-4 text-end text-muted small">{q.dateCreated}</td>
                      </tr>
                    ))}
                    {quotations.length === 0 && (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">No quotations found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fw-800 { font-weight: 800; }
        .btn-white { background: #fff; color: var(--text-muted); }
        .hover-bg-white:hover { background-color: #fff !important; border-color: var(--primary-brand) !important; transform: scale(1.05); }
      `}} />
    </div>
  );
};

export default Dashboard;
