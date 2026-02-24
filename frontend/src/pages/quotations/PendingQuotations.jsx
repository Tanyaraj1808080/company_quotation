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

    // Apply Date Range Filter
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

    // Apply Min Value Filter
    if (filters.minValue) {
      filtered = filtered.filter(q => q.totalValue >= parseFloat(filters.minValue));
    }

    setFilteredQuotations(filtered);
  }, [searchTerm, quotations, filters]);

  const fetchQuotations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/quotations');
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
        await axios.patch(`http://localhost:3000/api/quotations/${id}/status`, { status: newStatus });
        setQuotations(quotations.filter(q => q.id !== id));
      } catch (error) {
        console.error(`Error updating status for quotation ${id}:`, error);
        alert('Failed to update status. Please try again.');
      }
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredQuotations.length) setSelectedIds([]);
    else setSelectedIds(filteredQuotations.map(q => q.id));
  };

  const handleBulkApprove = async () => {
    if (window.confirm(`Are you sure you want to approve ${selectedIds.length} selected quotations?`)) {
      try {
        await Promise.all(selectedIds.map(id => 
          axios.patch(`http://localhost:3000/api/quotations/${id}/status`, { status: 'Approved' })
        ));
        setQuotations(quotations.filter(q => !selectedIds.includes(q.id)));
        setSelectedIds([]);
      } catch (error) {
        console.error('Error in bulk approval:', error);
        alert('Some quotations failed to update.');
      }
    }
  };

  const getAgingColor = (dateString) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) return 'text-danger fw-bold';
    if (diffDays > 3) return 'text-warning fw-bold';
    return 'text-success';
  };

  const totalValue = quotations.reduce((acc, q) => acc + q.totalValue, 0);

  return (
    <div className="mt-4">
      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2 opacity-75">Total Pending</h6>
                  <h2 className="mb-0 fw-bold">{quotations.length}</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-hourglass-split"></i>
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
                  <h6 className="text-uppercase mb-2 opacity-75">Pending Value</h6>
                  <h2 className="mb-0 fw-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                  </h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-currency-dollar"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-warning text-dark">
            <div className="card-body py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2 opacity-75">Average Age</h6>
                  <h2 className="mb-0 fw-bold">4 Days</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="bi bi-calendar3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Pending Quotations</h5>
          <div className="d-flex align-items-center">
            {selectedIds.length > 0 && (
              <button 
                className="btn btn-sm btn-success me-3 animate-fade-in" 
                onClick={handleBulkApprove}
              >
                <i className="bi bi-check-all me-1"></i>Approve Selected ({selectedIds.length})
              </button>
            )}
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
            <button 
              className={`btn btn-sm ${showFilter ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <i className="bi bi-filter me-1"></i>Filter
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        {showFilter && (
          <div className="card-body bg-light border-bottom py-3 animate-fade-in">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Date Range</label>
                <select 
                  className="form-select form-select-sm"
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Min Value</label>
                <input 
                  type="number" 
                  className="form-control form-control-sm" 
                  placeholder="Min Amount..." 
                  value={filters.minValue}
                  onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button 
                  className="btn btn-sm btn-link text-decoration-none"
                  onClick={() => setFilters({ dateRange: 'all', minValue: '' })}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      checked={selectedIds.length === filteredQuotations.length && filteredQuotations.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
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
                  <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4">No pending quotations found.</td></tr>
                ) : (
                  filteredQuotations.map(q => (
                    <tr key={q.id} className={selectedIds.includes(q.id) ? 'table-primary-subtle' : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          checked={selectedIds.includes(q.id)}
                          onChange={() => toggleSelection(q.id)}
                        />
                      </td>
                      <td>{q.id}</td>
                      <td>{q.clientName}</td>
                      <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.totalValue)}</td>
                      <td>
                        <span className={getAgingColor(q.dateCreated)}>
                          {q.dateCreated}
                        </span>
                      </td>
                      <td><span className="badge bg-warning">Pending</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-1" title="View"><i className="bi bi-eye"></i></button>
                        <button className="btn btn-sm btn-outline-success me-1" title="Approve" onClick={() => updateStatus(q.id, 'Approved')}><i className="bi bi-check-lg"></i></button>
                        <button className="btn btn-sm btn-outline-danger" title="Reject" onClick={() => updateStatus(q.id, 'Rejected')}><i className="bi bi-x-lg"></i></button>
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
