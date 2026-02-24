import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const MonthlyQuotationReport = () => {
  const chartData = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [
      {
        label: '# of Votes',
        data: [15, 5, 5],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Monthly Quotation Report Overview</h2>

      <div className="card mb-4">
        <div className="card-header">Filters</div>
        <div className="card-body">
          <form className="row g-3 align-items-center">
            <div className="col-md-4">
              <label htmlFor="month" className="form-label visually-hidden">Month</label>
              <select id="month" className="form-select" defaultValue="Select Month...">
                <option disabled>Select Month...</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="year" className="form-label visually-hidden">Year</label>
              <select id="year" className="form-select" defaultValue="Select Year...">
                <option disabled>Select Year...</option>
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
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
                <i className="bi bi-journal-text"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Total Quotations</p>
                <h4 className="mb-0">25</h4>
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
              <div className="kpi-icon bg-success">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Approved Quotations</p>
                <h4 className="mb-0">15</h4>
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
              <div className="kpi-icon bg-warning">
                <i className="bi bi-x-circle"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Rejected Quotations</p>
                <h4 className="mb-0">5</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-danger">-5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card chart-card">
        <div className="card-header">
          Quotation Status Distribution (Monthly)
        </div>
        <div className="card-body" style={{ height: '400px' }}>
          <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default MonthlyQuotationReport;
