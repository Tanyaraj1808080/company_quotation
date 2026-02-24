import React, { useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CustomReports = () => {
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const type = document.getElementById('reportType').value;
      setReportType(type);
      
      let data;
      if (type === 'Bar Chart') {
        data = {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{ label: 'Data', data: [10, 20, 15, 25], backgroundColor: 'rgba(54, 162, 235, 0.5)' }]
        };
      } else if (type === 'Pie Chart') {
        data = {
            labels: ['Red', 'Blue', 'Yellow'],
            datasets: [{ data: [300, 50, 100], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }]
        };
      } else if (type === 'Line Graph') {
         data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr'],
            datasets: [{ label: 'Trend', data: [65, 59, 80, 81], borderColor: 'rgb(75, 192, 192)', tension: 0.1 }]
         }
      } else {
          data = "tabular"; 
      }

      setReportData(data);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Custom Report Builder</h2>
        <button className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i> Create New Report</button>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          Report Configuration
        </div>
        <div className="card-body">
          <form>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="dataSource" className="form-label">Data Source</label>
                <select id="dataSource" className="form-select" defaultValue="Select data source...">
                  <option disabled>Select data source...</option>
                  <option>Quotations</option>
                  <option>Clients</option>
                  <option>Sales Transactions</option>
                  <option>Leads</option>
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="reportType" className="form-label">Report Type</label>
                <select id="reportType" className="form-select" defaultValue="Select report type...">
                  <option disabled>Select report type...</option>
                  <option>Tabular Data</option>
                  <option>Bar Chart</option>
                  <option>Pie Chart</option>
                  <option>Line Graph</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="fields" className="form-label">Select Fields</label>
              <select id="fields" className="form-select" multiple size="3">
                <option>Client Name</option>
                <option>Quotation ID</option>
                <option>Total Value</option>
                <option>Status</option>
                <option>Date Created</option>
              </select>
              <div className="form-text">Hold Ctrl/Cmd to select multiple fields.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="filters" className="form-label">Filters (e.g., Status = Approved, Date Range)</label>
              <input type="text" className="form-control" id="filters" placeholder="Add filters (e.g., Status: Approved, Date: Last 30 days)" />
            </div>
            <div className="text-end">
              <button type="button" className="btn btn-success me-2" onClick={generateReport}><i className="bi bi-play-circle me-1"></i> Generate Report</button>
              <button type="button" className="btn btn-primary"><i className="bi bi-save me-1"></i> Save Report</button>
            </div>
          </form>
        </div>
      </div>

      {/* Report Output Section */}
      <div className="card mb-4" style={{ display: reportData || loading ? 'block' : 'none' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          Report Output
          <span className="badge bg-info text-dark">Note: Reports are generated using sample mock data.</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Generating report...</p>
            </div>
          ) : (
            <div style={{ height: '400px' }}>
                {reportType === 'Bar Chart' && <Bar data={reportData} options={{ maintainAspectRatio: false }} />}
                {reportType === 'Pie Chart' && <Pie data={reportData} options={{ maintainAspectRatio: false }} />}
                {reportType === 'Line Graph' && <Line data={reportData} options={{ maintainAspectRatio: false }} />}
                {reportType === 'Tabular Data' && <div className="alert alert-info">Tabular data view is not implemented in this demo.</div>}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Saved Custom Reports
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Data Source</th>
                  <th>Last Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monthly Approved Quotations by Client</td>
                  <td>Quotations</td>
                  <td>2024-02-15</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-1"><i className="bi bi-eye"></i> View</button>
                    <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>Top Clients by Total Sales</td>
                  <td>Sales Transactions</td>
                  <td>2024-02-10</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-1"><i className="bi bi-eye"></i> View</button>
                    <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomReports;
