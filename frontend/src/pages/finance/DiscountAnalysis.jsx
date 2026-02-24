import React, { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const DiscountAnalysis = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  const chartData = {
    datasets: [
      {
        label: 'Quotations',
        data: [
          { x: 5000, y: 5 },
          { x: 12000, y: 10 },
          { x: 8000, y: 7 },
          { x: 25000, y: 15 },
          { x: 18000, y: 12 },
          { x: 30000, y: 20 },
          { x: 2000, y: 2 },
          { x: 45000, y: 18 },
        ],
        backgroundColor: 'rgba(13, 110, 253, 0.6)',
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold text-dark">Discount Analysis</h2>

      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold text-muted">Avg. Discount Rate</h6>
              <h2 className="mb-0 fw-bold text-primary">11.4%</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold text-muted">Total Discount Given</h6>
              <h2 className="mb-0 fw-bold text-danger">$42,500</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold text-muted">Margin Impact</h6>
              <h2 className="mb-0 fw-bold text-warning">-4.2%</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Discount vs. Deal Size</h5>
        </div>
        <div className="card-body" style={{ height: '400px' }}>
          {loading ? (
            <div className="text-center py-5">Analyzing data points...</div>
          ) : (
            <Scatter 
              data={chartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  x: { title: { display: true, text: 'Deal Value ($)' } },
                  y: { title: { display: true, text: 'Discount (%)' }, beginAtZero: true }
                }
              }} 
            />
          )}
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Recent High-Discount Deals</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Client</th>
                  <th>Value</th>
                  <th>Discount</th>
                  <th>Approver</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Global Solutions</td>
                  <td>$30,000</td>
                  <td><span className="text-danger fw-bold">20%</span></td>
                  <td>Admin</td>
                  <td>Bulk volume discount</td>
                </tr>
                <tr>
                  <td>Delta Inc.</td>
                  <td>$45,000</td>
                  <td><span className="text-danger fw-bold">18%</span></td>
                  <td>Manager</td>
                  <td>Competitive matching</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountAnalysis;
