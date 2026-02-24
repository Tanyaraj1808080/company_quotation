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

const ConversionRate = () => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Conversion Rate %',
        data: [20, 22, 25, 24, 26, 28],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Conversion Rate Overview</h2>

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
              <label htmlFor="source" className="form-label visually-hidden">Lead Source</label>
              <select id="source" className="form-select" defaultValue="Select Lead Source...">
                <option disabled>Select Lead Source...</option>
                <option>Website</option>
                <option>Referral</option>
                <option>Campaign</option>
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
                <i className="bi bi-speedometer"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Overall Conversion Rate</p>
                <h4 className="mb-0">25%</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-success">+3%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-success">
                <i className="bi bi-people"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Leads Converted</p>
                <h4 className="mb-0">50</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-success">+8%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-warning">
                <i className="bi bi-funnel"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Total Leads</p>
                <h4 className="mb-0">200</h4>
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
          Conversion Rate Trend
        </div>
        <div className="card-body" style={{ height: '400px' }}>
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default ConversionRate;
