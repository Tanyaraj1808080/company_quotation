import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesPerformance = () => {
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Performance Trend',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Sales Performance Overview</h2>

      <div className="card mb-4">
        <div className="card-header">Filters</div>
        <div className="card-body">
          <form className="row g-3 align-items-center">
            <div className="col-md-4">
              <label htmlFor="period" className="form-label visually-hidden">Period</label>
              <select id="period" className="form-select" defaultValue="Select Period...">
                <option disabled>Select Period...</option>
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="salesperson" className="form-label visually-hidden">Salesperson</label>
              <select id="salesperson" className="form-select" defaultValue="Select Salesperson...">
                <option disabled>Select Salesperson...</option>
                <option>John Doe</option>
                <option>Jane Smith</option>
                <option>Peter Jones</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Apply Filters</button>
            </div>
          </form>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-primary">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Total Sales Value</p>
                <h4 className="mb-0">$1,500,000</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-success">+15%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-success">
                <i className="bi bi-award"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Deals Closed</p>
                <h4 className="mb-0">120</h4>
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
                <i className="bi bi-person-badge"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Average Deal Size</p>
                <h4 className="mb-0">$12,500</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-info">+5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card chart-card">
        <div className="card-header">
          Sales Performance Trend
        </div>
        <div className="card-body" style={{ height: '400px' }}>
          <Bar data={trendData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default SalesPerformance;
