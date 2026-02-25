import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RejectedQuotations = () => {
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
      setQuotations(response.data.filter(q => q.status === 'Rejected'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setLoading(false);
    }
  };

  const deleteQuotation = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete quotation ${id}?`)) {
      try {
        await axios.delete(`/api/quotations/${id}`);
        setQuotations(quotations.filter(q => q.id !== id));
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const reviseQuotation = (id) => {
    alert(`Redirecting to edit quotation ${id} as a new version...`);
    // Placeholder for revision logic
  };

  const totalValue = quotations.reduce((acc, q) => acc + q.totalValue, 0);

  return (
    <div className="mt-4">
      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-danger text-white">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2 opacity-75">Total Rejected</h6>
                  <h2 className="mb-0 fw-bold">{quotations.length}</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-x-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-secondary text-white">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2 opacity-75">Lost Value</h6>
                  <h2 className="mb-0 fw-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                  </h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-graph-down-arrow"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-dark text-white">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2 opacity-75">Lost Ratio</h6>
                  <h2 className="mb-0 fw-bold">12.5%</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-percent"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Rejected Quotations</h5>
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
            <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash me-1"></i>Clear History</button>
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
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4">No rejected quotations found.</td></tr>
                ) : (
                  filteredQuotations.map(q => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td>{q.clientName}</td>
                      <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.totalValue)}</td>
                      <td>{q.dateCreated}</td>
                      <td><span className="text-muted small">Price too high</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-1" title="View"><i className="bi bi-eye"></i></button>
                        <button className="btn btn-sm btn-outline-primary me-1" title="Revise/Duplicate" onClick={() => reviseQuotation(q.id)}><i className="bi bi-arrow-repeat"></i></button>
                        <button className="btn btn-sm btn-outline-danger" title="Delete Permanently" onClick={() => deleteQuotation(q.id)}><i className="bi bi-trash"></i></button>
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

export default RejectedQuotations;
