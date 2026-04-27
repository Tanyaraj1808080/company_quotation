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
      setQuotations(response.data.filter(q => q.status && q.status.toLowerCase() === 'approved'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setLoading(false);
    }
  };

  const totalValue = quotations.reduce((acc, q) => acc + (parseFloat(q.totalValue) || 0), 0);

  const exportAllToCSV = () => {
    if (filteredQuotations.length === 0) return alert('No data to export');
    const headers = ['ID', 'Client', 'Value', 'Date Created'];
    const csvRows = [
      headers.join(','),
      ...filteredQuotations.map(q => [q.id, `"${q.clientName}"`, q.totalValue, q.dateCreated].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `approved_quotations.csv`;
    link.click();
  };

  return (
    <div className="mt-4 fade-in">
      {/* Responsive KPI Cards */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 bg-success text-white h-100">
            <div className="card-body py-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Approved Quotes</h6>
                <h2 className="mb-0 fw-bold">{quotations.length}</h2>
              </div>
              <i className="bi bi-check-circle fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white h-100">
            <div className="card-body py-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Total Value</h6>
                <h2 className="mb-0 fw-bold">₹{totalValue.toLocaleString()}</h2>
              </div>
              <i className="bi bi-wallet2 fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 bg-info text-white h-100">
            <div className="card-body py-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Invoiced Rate</h6>
                <h2 className="mb-0 fw-bold">100%</h2>
              </div>
              <i className="bi bi-receipt-cutoff fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white py-3 border-0 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <h5 className="mb-0 fw-bold">Approved Quotations</h5>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
              <input type="text" className="form-control border-start-0" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button className="btn btn-sm btn-outline-secondary text-nowrap" onClick={exportAllToCSV}>
              <i className="bi bi-download me-1"></i>Export All
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Client</th>
                  <th>Value</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="pe-4 text-end text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></td></tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No approved quotations.</td></tr>
                ) : (
                  filteredQuotations.map(q => (
                    <tr key={q.id}>
                      <td className="ps-4 fw-bold">{q.id}</td>
                      <td className="fw-medium">{q.clientName}</td>
                      <td className="fw-bold text-dark">₹{parseFloat(q.totalValue || 0).toLocaleString()}</td>
                      <td className="small text-muted">{q.dateCreated}</td>
                      <td><span className="badge bg-success-soft text-success rounded-pill">Approved</span></td>
                      <td className="pe-4 text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-info me-1" title="View"><i className="bi bi-eye"></i></button>
                        <button className="btn btn-sm btn-outline-primary" title="PDF"><i className="bi bi-file-pdf"></i></button>
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
