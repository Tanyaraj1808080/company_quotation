import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AllQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/quotations');
      // Ensure we always have an array
      setQuotations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setError("Could not load quotations. Please ensure backend is running.");
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuotation = async (id) => {
    if (window.confirm(`Are you sure you want to delete quotation ${id}?`)) {
      try {
        await axios.delete(`/api/quotations/${id}`);
        fetchQuotations(); // Re-fetch to ensure sync with DB
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } catch (error) {
        console.error('Error deleting quotation:', error);
        alert('Failed to delete quotation.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected quotations?`)) {
      try {
        await axios.post('/api/quotations/bulk-delete', { ids: selectedIds });
        fetchQuotations(); // Re-fetch from DB
        setSelectedIds([]);
        alert('Selected quotations deleted successfully.');
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Failed to delete selected quotations.');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === quotations.length && quotations.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(quotations.map(q => q.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="mt-4 fade-in">
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-4 px-4 border-0">
          <div>
            <h4 className="fw-bold text-dark mb-1">All Quotations</h4>
            <p className="text-muted small mb-0">Total {quotations.length} records in database</p>
          </div>
          <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
              <button className="btn btn-danger rounded-pill px-4 shadow-sm" onClick={handleBulkDelete}>
                <i className="bi bi-trash3-fill me-2"></i>Delete Selected ({selectedIds.length})
              </button>
            )}
            <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => navigate('/quotation-templates')}>
              <i className="bi bi-plus-lg me-2"></i>Create New
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger mx-4">{error}</div>}

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 border-0">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      checked={quotations.length > 0 && selectedIds.length === quotations.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Quote ID</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Client Name</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Amount</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Date</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Status</th>
                  <th className="pe-4 py-3 border-0 text-end small fw-bold text-uppercase text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></td></tr>
                ) : quotations.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">No quotations found in database.</td></tr>
                ) : (
                  quotations.map(q => (
                    <tr key={q.id} className={`modern-row ${selectedIds.includes(q.id) ? 'table-active' : ''}`}>
                      <td className="ps-4">
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          checked={selectedIds.includes(q.id)}
                          onChange={() => toggleSelectRow(q.id)}
                        />
                      </td>
                      <td className="fw-bold text-primary">{q.id}</td>
                      <td className="fw-medium">{q.clientName}</td>
                      <td className="fw-bold text-dark">₹{parseFloat(q.totalValue || 0).toLocaleString()}</td>
                      <td className="text-muted small">{q.dateCreated}</td>
                      <td>
                        <span className={`badge rounded-pill ${
                          q.status === 'Approved' ? 'bg-success' : q.status === 'Pending' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-sm btn-outline-info" onClick={() => navigate(`/view-quotation/${q.id}`)}><i className="bi bi-eye"></i></button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/edit-quotation/${q.id}`)}><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteQuotation(q.id)}><i className="bi bi-trash"></i></button>
                        </div>
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

export default AllQuotations;
