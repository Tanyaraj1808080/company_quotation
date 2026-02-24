import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesDashboard = () => {
  const salesTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales Trend',
        data: [12000, 19000, 3000, 5000, 20000, 30000],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Sales Overview</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-primary">
                <i className="bi bi-currency-dollar"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Total Revenue</p>
                <h4 className="mb-0">$1,250,000</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-success">+18%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-success">
                <i className="bi bi-hand-thumbs-up"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Deals Won</p>
                <h4 className="mb-0">85</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-success">+10%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-warning">
                <i className="bi bi-person-plus"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">New Leads</p>
                <h4 className="mb-0">32</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-info">+5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          Recent Sales Transactions
          <button className="btn btn-sm btn-primary">View All</button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Product/Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2024-02-10</td>
                  <td>Alpha Corp</td>
                  <td>Software License</td>
                  <td>$15,000</td>
                  <td><span className="badge bg-success">Closed Won</span></td>
                </tr>
                <tr>
                  <td>2024-02-08</td>
                  <td>Beta Ltd</td>
                  <td>Consulting Services</td>
                  <td>$8,000</td>
                  <td><span className="badge bg-success">Closed Won</span></td>
                </tr>
                <tr>
                  <td>2024-02-05</td>
                  <td>Gamma Solutions</td>
                  <td>Custom Development</td>
                  <td>$22,000</td>
                  <td><span className="badge bg-warning">Pending</span></td>
                </tr>
                <tr>
                  <td>2024-02-01</td>
                  <td>Delta Inc</td>
                  <td>Support Package</td>
                  <td>$2,500</td>
                  <td><span className="badge bg-danger">Lost</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card chart-card">
        <div className="card-header">
          Sales Trend (Last 6 Months)
        </div>
        <div className="card-body" style={{ height: '400px' }}>
          <Line data={salesTrendData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
