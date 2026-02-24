import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueForecast = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating forecast data calculation
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const chartData = {
    labels: ['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
    datasets: [
      {
        label: 'Optimistic Forecast',
        data: [120000, 150000, 180000, 210000, 240000, 300000],
        borderColor: 'rgba(25, 135, 84, 1)',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Conservative Forecast',
        data: [100000, 110000, 125000, 130000, 145000, 160000],
        borderColor: 'rgba(13, 110, 253, 1)',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.4
      }
    ],
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-dark">Revenue Forecast</h2>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">FY 2026-27 Projection</span>
      </div>
      
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold">Next 6 Months (Est.)</h6>
              <h2 className="mb-0 fw-bold">$1.24M</h2>
              <p className="text-success mb-0 mt-2 small"><i className="bi bi-arrow-up"></i> +15% vs Last Period</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold">Avg Monthly Rev</h6>
              <h2 className="mb-0 fw-bold">$206,000</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold">Pipeline Probability</h6>
              <h2 className="mb-0 fw-bold">68%</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark">Projected Revenue Growth</h5>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary active">Monthly</button>
            <button className="btn btn-outline-secondary">Quarterly</button>
          </div>
        </div>
        <div className="card-body" style={{ height: '400px' }}>
          {loading ? (
            <div className="text-center py-5">Calculating projections...</div>
          ) : (
            <Line 
              data={chartData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: 'bottom' }
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f1f1' } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          )}
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Forecast Assumptions</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-borderless align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Factor</th>
                  <th>Impact</th>
                  <th>Confidence</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-bold">New Lead Volume</td>
                  <td><span className="text-success">+12%</span></td>
                  <td>High</td>
                  <td>Based on recent marketing campaigns</td>
                </tr>
                <tr>
                  <td className="fw-bold">Closing Rate</td>
                  <td><span className="text-primary">Steady</span></td>
                  <td>Medium</td>
                  <td>Assuming historic 22% conversion</td>
                </tr>
                <tr>
                  <td className="fw-bold">Seasonal Dip</td>
                  <td><span className="text-danger">-5%</span></td>
                  <td>Low</td>
                  <td>Potential slowdown in early Q3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueForecast;
