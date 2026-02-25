import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApprovedQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    setFilteredQuotations(
      quotations.filter(q => 
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, quotations]);

  const fetchQuotations = async () => {
    try {
      const response = await axios.get('/api/quotations');
      setQuotations(response.data.filter(q => q.status === 'Approved'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setLoading(false);
    }
  };

  const generateInvoice = async (quotation) => {
    if (window.confirm(`Convert quotation ${quotation.id} to Invoice?`)) {
      try {
        const invoiceData = {
          clientId: quotation.clientId || 1, // Defaulting if not present
          clientName: quotation.clientName,
          amount: quotation.totalValue,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days later
          status: 'Pending'
        };
        await axios.post('/api/invoices', invoiceData);
        alert(`Invoice generated successfully for ${quotation.clientName}!`);
      } catch (error) {
        console.error('Error generating invoice:', error);
        alert('Failed to generate invoice. Please ensure backend endpoint /api/invoices exists.');
      }
    }
  };

  const downloadPDF = (id) => {
    alert(`Downloading PDF for quotation ${id}...`);
    // Placeholder for actual PDF generation logic
  };

  const emailClient = (clientName) => {
    alert(`Opening email client to send quotation to ${clientName}...`);
    // Placeholder for email trigger
  };

  const exportAllToCSV = () => {
    if (filteredQuotations.length === 0) return alert('No data to export');
    
    const headers = ['ID', 'Client', 'Value', 'Currency', 'Date Created', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filteredQuotations.map(q => [
        q.id,
        `"${q.clientName}"`,
        q.totalValue,
        q.currency || 'USD',
        q.dateCreated,
        q.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `approved_quotations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalValue = quotations.reduce((acc, q) => acc + q.totalValue, 0);

  return (
    <div className="mt-4">
      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-success text-white">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2 opacity-75">Approved Quotes</h6>
                  <h2 className="mb-0 fw-bold">{quotations.length}</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2 opacity-75">Total Value</h6>
                  <h2 className="mb-0 fw-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                  </h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-wallet2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-info text-white">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2 opacity-75">Invoiced Rate</h6>
                  <h2 className="mb-0 fw-bold">85%</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-receipt-cutoff"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Approved Quotations</h5>
          <div className="d-flex">
            <div className="input-group input-group-sm me-2" style={{ width: '250px' }}>
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Search Client or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={exportAllToCSV}>
              <i className="bi bi-download me-1"></i>Export All
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Value</th>
                  <th>Date Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4">No approved quotations found.</td></tr>
                ) : (
                  filteredQuotations.map(q => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td>{q.clientName}</td>
                      <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.totalValue)}</td>
                      <td>{q.dateCreated}</td>
                      <td><span className="badge bg-success">Approved</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-1" title="View"><i className="bi bi-eye"></i></button>
                        <button className="btn btn-sm btn-outline-primary me-1" title="Generate Invoice" onClick={() => generateInvoice(q)}><i className="bi bi-receipt"></i></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" title="Download" onClick={() => downloadPDF(q.id)}><i className="bi bi-download"></i></button>
                        <button className="btn btn-sm btn-outline-dark" title="Email Client" onClick={() => emailClient(q.clientName)}><i className="bi bi-envelope"></i></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedQuotations;
