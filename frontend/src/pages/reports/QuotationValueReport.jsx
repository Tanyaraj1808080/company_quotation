import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const QuotationValueReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/quotations');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: data.slice(-6).map(q => q.id),
    datasets: [
      {
        label: 'Quotation Value',
        data: data.slice(-6).map(q => q.totalValue),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const totalValue = data.reduce((acc, q) => acc + q.totalValue, 0);
  const approvedValue = data.filter(q => q.status === 'Approved').reduce((acc, q) => acc + q.totalValue, 0);
  const pendingValue = data.filter(q => q.status === 'Pending').reduce((acc, q) => acc + q.totalValue, 0);

  // Group by Client for "Top Clients"
  const clientValues = data.reduce((acc, q) => {
    acc[q.clientName] = (acc[q.clientName] || 0) + q.totalValue;
    return acc;
  }, {});

  const topClients = Object.entries(clientValues)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold text-dark">Quotation Value Report</h2>
      
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white h-100">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold">Total Combined Value</h6>
              <h2 className="mb-0 fw-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-success text-white h-100">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold">Approved Value</h6>
              <h2 className="mb-0 fw-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(approvedValue)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-warning text-dark h-100">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold">Pending Value</h6>
              <h2 className="mb-0 fw-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pendingValue)}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Value Analysis (Recent)</h5>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
              {loading ? (
                <div className="text-center py-5">Loading report data...</div>
              ) : (
                <Bar 
                  data={chartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    }
                  }} 
                />
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Top Clients by Value</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {topClients.map(([name, val], index) => (
                  <li key={name} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                      <span className="fw-bold me-2">{index + 1}.</span>
                      {name}
                    </div>
                    <span className="badge bg-light text-dark border">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Detailed Breakdown</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Value</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(q => (
                  <tr key={q.id}>
                    <td>{q.id}</td>
                    <td>{q.clientName}</td>
                    <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(q.totalValue)}</td>
                    <td>{q.dateCreated}</td>
                    <td><span className={`badge ${q.status === 'Approved' ? 'bg-success' : 'bg-warning'}`}>{q.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationValueReport;
