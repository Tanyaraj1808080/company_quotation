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
  const [allQuotations, setAllQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([]);
  
  const [chartStats, setChartStats] = useState({ labels: [], counts: [] });
  const [donutStats, setDonutStats] = useState([0, 0, 0]); // Approved, Pending, Rejected
  
  // Single Filter State: can be 'range-6' or 'month-2026-3'
  const [filterKey, setFilterKey] = useState('range-12');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/quotations');
      setAllQuotations(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [filterKey, allQuotations, loading]);

  const applyFilters = () => {
    let filtered = [];
    let labels = [];
    let counts = [];

    if (filterKey.startsWith('range-')) {
      const monthsRange = parseInt(filterKey.split('-')[1]);
      const periods = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = monthsRange - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        periods.push({ label: monthNames[d.getMonth()], month: d.getMonth() + 1, year: d.getFullYear(), count: 0 });
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsRange + 1);
      startDate.setDate(1);
      startDate.setHours(0,0,0,0);

      filtered = allQuotations.filter(q => {
        const qDate = q.dateCreated ? new Date(q.dateCreated) : new Date();
        return qDate >= startDate;
      });

      filtered.forEach(q => {
        const qDate = q.dateCreated ? new Date(q.dateCreated) : new Date();
        const match = periods.find(p => p.month === (qDate.getMonth() + 1) && p.year === qDate.getFullYear());
        if (match) match.count++;
      });

      labels = periods.map(p => p.label);
      counts = periods.map(p => p.count);
    } else if (filterKey.startsWith('month-')) {
      const parts = filterKey.split('-');
      const year = parseInt(parts[1]);
      const month = parseInt(parts[2]);

      filtered = allQuotations.filter(q => {
        const d = q.dateCreated ? new Date(q.dateCreated) : new Date();
        return (d.getMonth() + 1) === month && d.getFullYear() === year;
      });

      const daysInMonth = new Date(year, month, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(i.toString());
        const dayCount = filtered.filter(q => {
           const d = q.dateCreated ? new Date(q.dateCreated) : new Date();
           return d.getDate() === i;
        }).length;
        counts.push(dayCount);
      }
    }

    // Update Donut Stats
    const approved = filtered.filter(q => q.status && q.status.toLowerCase() === 'approved').length;
    const pending = filtered.filter(q => q.status && q.status.toLowerCase() === 'pending').length;
    const rejected = filtered.filter(q => q.status && q.status.toLowerCase() === 'rejected').length;
    
    setDonutStats([approved, pending, rejected]);
    setFilteredQuotations(filtered);
    setChartStats({ labels, counts });
    updateKPIs(filtered);
  };

  const updateKPIs = (data) => {
    const total = data.length;
    const approved = data.filter(q => q.status && q.status.toLowerCase() === 'approved').length;
    const pending = data.filter(q => q.status && q.status.toLowerCase() === 'pending').length;
    const rejected = data.filter(q => q.status && q.status.toLowerCase() === 'rejected').length;
    const totalValue = data.reduce((sum, q) => sum + parseFloat(q.totalValue || 0), 0);
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    setKpis([
      { title: 'Total Quotations', value: total.toString(), icon: 'bi-journal-text', color: 'primary', trend: '+0%', isUp: true },
      { title: 'Approved', value: approved.toString(), icon: 'bi-check2-circle', color: 'success', trend: '+0%', isUp: true },
      { title: 'Pending', value: pending.toString(), icon: 'bi-clock-history', color: 'warning', trend: '+0%', isUp: true },
      { title: 'Rejected', value: rejected.toString(), icon: 'bi-x-circle', color: 'danger', trend: '+0%', isUp: false },
      { title: 'Total Value', value: `₹${totalValue.toLocaleString()}`, icon: 'bi-currency-rupee', color: 'info', trend: '+0%', isUp: true },
      { title: 'Approval Rate', value: `${approvalRate}%`, icon: 'bi-percent', color: 'dark', trend: '+0%', isUp: true },
    ]);
  };

  const trendData = {
    labels: chartStats.labels,
    datasets: [{
      label: filterKey.startsWith('range') ? 'Monthly Trend' : 'Daily Trend',
      data: chartStats.counts,
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
      data: donutStats,
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const getSpecificMonthOptions = () => {
    const options = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const val = `month-${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      options.push({ val, label });
    }
    return options;
  };

  const quickActions = [
    { title: 'Create Quotation', icon: 'bi-plus-circle', path: '/quotation-templates', color: 'primary' },
    { title: 'Add Client', icon: 'bi-person-plus', path: '/clients', color: 'success' },
    { title: 'Record Payment', icon: 'bi-cash-stack', path: '/payments', color: 'info' },
    { title: 'Add Task', icon: 'bi-check2-square', path: '/tasks', color: 'warning' },
  ];

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="fade-in animate-up">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-800 mb-1">Business Overview</h2>
          <p className="text-muted mb-0">Track your business performance and quotation pipeline in real-time.</p>
        </div>
      </div>

      <div className="row g-3 g-md-4 mb-5">
        {kpis.map((kpi, idx) => (
          <div className="col-12 col-sm-6 col-md-4 col-xl-2" key={idx}>
            <div className="card h-100 border-0 shadow-sm card-hover">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`bg-${kpi.color} bg-opacity-10 text-${kpi.color} rounded-3 p-2 d-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px'}}>
                    <i className={`bi ${kpi.icon} fs-5`}></i>
                  </div>
                  <span className="small fw-bold text-success">{kpi.trend}</span>
                </div>
                <h6 className="text-muted small fw-bold text-uppercase mb-1">{kpi.title}</h6>
                <h4 className="fw-800 mb-0">{kpi.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100 p-2">
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Quotation Performance</h5>
              <div className="dropdown">
                <select 
                  className="form-select form-select-sm border text-muted px-3 rounded-pill" 
                  value={filterKey}
                  onChange={(e) => setFilterKey(e.target.value)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                >
                  <optgroup label="Standard Ranges">
                    <option value="range-3">Last 3 Months</option>
                    <option value="range-6">Last 6 Months</option>
                    <option value="range-12">Last 12 Months</option>
                  </optgroup>
                  <optgroup label="Specific Months">
                    {getSpecificMonthOptions().map(opt => (
                      <option key={opt.val} value={opt.val}>{opt.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
              <Line 
                data={trendData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 10, displayColors: false }
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b' } },
                    y: { 
                      beginAtZero: true, 
                      grid: { color: '#f1f5f9', drawBorder: false },
                      ticks: { color: '#64748b', padding: 10, stepSize: 1 }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 p-2">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold mb-0">Status Distribution</h5>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center" style={{ height: '350px' }}>
              <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                <Doughnut data={ratioData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <h3 className="fw-800 mb-0">{filteredQuotations.length}</h3>
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
              <h5 className="fw-bold mb-0">Filtered Activity ({filteredQuotations.length})</h5>
              <Link to="/all-quotations" className="text-primary small fw-bold text-decoration-none">View All <i className="bi bi-arrow-right"></i></Link>
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
                    {filteredQuotations.slice(0, 5).map((q, idx) => (
                      <tr key={idx}>
                        <td className="ps-4">
                          <div className="fw-bold">{q.clientName}</div>
                          <div className="small text-muted">{q.id}</div>
                        </td>
                        <td className="fw-800">₹{parseFloat(q.totalValue).toLocaleString()}</td>
                        <td>
                          <span className={`badge-modern ${q.status && q.status.toLowerCase() === 'approved' ? 'bg-success-soft text-success' : q.status && q.status.toLowerCase() === 'pending' ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger'}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="pe-4 text-end text-muted small">{q.dateCreated}</td>
                      </tr>
                    ))}
                    {filteredQuotations.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">No records in this period</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fw-800 { font-weight: 800; }
        .bg-success-soft { background-color: #dcfce7; }
        .bg-warning-soft { background-color: #fef3c7; }
        .bg-danger-soft { background-color: #fee2e2; }
        .badge-modern { padding: 6px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
      `}} />
    </div>
  );
};

export default Dashboard;
