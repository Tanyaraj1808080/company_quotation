import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PendingQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    minValue: ''
  });

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    let filtered = quotations.filter(q => 
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filters.dateRange !== 'all') {
      const today = new Date();
      filtered = filtered.filter(q => {
        const createdDate = new Date(q.dateCreated);
        const diffDays = (today - createdDate) / (1000 * 60 * 60 * 24);
        if (filters.dateRange === '7') return diffDays <= 7;
        if (filters.dateRange === '30') return diffDays <= 30;
        return true;
      });
    }

    if (filters.minValue) {
      filtered = filtered.filter(q => q.totalValue >= parseFloat(filters.minValue));
    }

    setFilteredQuotations(filtered);
  }, [searchTerm, quotations, filters]);

  const fetchQuotations = async () => {
    try {
      const response = await axios.get('/api/quotations');
      setQuotations(response.data.filter(q => q.status === 'Pending'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this quotation?`)) {
      try {
        await axios.patch(`/api/quotations/${id}/status`, { status: newStatus });
        fetchQuotations();
      } catch (error) {
        console.error(`Error updating status:`, error);
        alert('Failed to update status.');
      }
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalValue = quotations.reduce((acc, q) => acc + q.totalValue, 0);

  return (
    <div className="mt-4 fade-in">
      {/* Responsive KPI Cards */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white h-100">
            <div className="card-body py-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Total Pending</h6>
                <h2 className="mb-0 fw-bold">{quotations.length}</h2>
              </div>
              <i className="bi bi-hourglass-split fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 bg-info text-white h-100">
            <div className="card-body py-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Pending Value</h6>
                <h2 className="mb-0 fw-bold">₹{totalValue.toLocaleString()}</h2>
              </div>
              <i className="bi bi-currency-rupee fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 bg-warning text-dark h-100">
            <div className="card-body py-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">Avg. Aging</h6>
                <h2 className="mb-0 fw-bold">4 Days</h2>
              </div>
              <i className="bi bi-calendar3 fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white py-3 border-0 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <h5 className="mb-0 fw-bold">Pending Quotations</h5>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
              <input type="text" className="form-control border-start-0" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button className={`btn btn-sm ${showFilter ? 'btn-secondary' : 'btn-outline-secondary'} text-nowrap`} onClick={() => setShowFilter(!showFilter)}>
              <i className="bi bi-filter me-1"></i>Filter
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
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></td></tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No pending quotations.</td></tr>
                ) : (
                  filteredQuotations.map(q => (
                    <tr key={q.id}>
                      <td className="ps-4 fw-bold">{q.id}</td>
                      <td className="fw-medium">{q.clientName}</td>
                      <td className="fw-bold text-dark">₹{parseFloat(q.totalValue || 0).toLocaleString()}</td>
                      <td className="small text-muted">{q.dateCreated}</td>
                      <td><span className="badge bg-warning-soft text-warning rounded-pill">Pending</span></td>
                      <td className="pe-4 text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-success me-1" onClick={() => updateStatus(q.id, 'Approved')}><i className="bi bi-check-lg"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => updateStatus(q.id, 'Rejected')}><i className="bi bi-x-lg"></i></button>
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

export default PendingQuotations;
