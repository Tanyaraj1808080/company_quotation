import React from 'react';
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
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Quotations',
      data: [10, 15, 8, 20, 12, 25],
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0d6efd',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#0d6efd'
    }]
  };

  const ratioData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      label: 'Quotation Status',
      data: [12, 7, 5],
      backgroundColor: ['#198754', '#ffc107', '#dc3545'],
      hoverOffset: 4
    }]
  };

  return (
    <>
      <section className="kpi-cards mt-4">
        <div className="row">
          <div className="col-md-3">
            <div className="card kpi-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="kpi-icon bg-primary"><i className="bi bi-journal-text"></i></div>
                  <div className="ms-3">
                    <p className="mb-0 text-muted">Total Quotations</p>
                    <h4 className="mb-0">24</h4>
                  </div>
                  <div className="ms-auto"><span className="badge bg-success">+12%</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card kpi-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="kpi-icon bg-success"><i className="bi bi-check-circle-fill"></i></div>
                  <div className="ms-3">
                    <p className="mb-0 text-muted">Approved Quotations</p>
                    <h4 className="mb-0">12</h4>
                  </div>
                  <div className="ms-auto"><span className="badge bg-success">+8%</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card kpi-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="kpi-icon bg-warning"><i className="bi bi-clock-fill"></i></div>
                  <div className="ms-3">
                    <p className="mb-0 text-muted">Pending Quotations</p>
                    <h4 className="mb-0">7</h4>
                  </div>
                  <div className="ms-auto"><span className="badge bg-danger">-3%</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card kpi-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="kpi-icon bg-danger"><i className="bi bi-x-circle-fill"></i></div>
                  <div className="ms-3">
                    <p className="mb-0 text-muted">Rejected Quotations</p>
                    <h4 className="mb-0">5</h4>
                  </div>
                  <div className="ms-auto"><span className="badge bg-danger">-6%</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mt-4">
            <div className="card kpi-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="kpi-icon bg-info"><i className="bi bi-currency-euro"></i></div>
                  <div className="ms-3">
                    <p className="mb-0 text-muted">Total Quotation Value</p>
                    <h4 className="mb-0">€138,000</h4>
                  </div>
                  <div className="ms-auto"><span className="badge bg-success">+15%</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mt-4">
            <div className="card kpi-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="kpi-icon bg-secondary"><i className="bi bi-percent"></i></div>
                  <div className="ms-3">
                    <p className="mb-0 text-muted">Approval Rate (%)</p>
                    <h4 className="mb-0">75%</h4>
                  </div>
                  <div className="ms-auto"><span className="badge bg-success">+5%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="charts mt-4">
        <div className="row">
          <div className="col-md-8">
            <div className="card chart-card">
              <div className="card-header">Quotation Trend</div>
              <div className="card-body" style={{ height: '350px' }}>
                <Line 
                    data={trendData} 
                    options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            title: { display: true, text: 'Monthly Quotation Trend', font: { size: 16 } }
                        },
                        scales: {
                            x: { grid: { display: false } },
                            y: { beginAtZero: true, grid: { color: '#e9ecef' } }
                        }
                    }} 
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card chart-card">
              <div className="card-header">Status Ratio</div>
              <div className="card-body" style={{ height: '350px' }}>
                <Doughnut 
                    data={ratioData} 
                    options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { boxWidth: 20, padding: 15 } },
                            title: { display: true, text: 'Quotation Status Ratio', font: { size: 16 } }
                        }
                    }} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
