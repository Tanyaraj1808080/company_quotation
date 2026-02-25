import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AllQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await axios.get('/api/quotations');
      setQuotations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setLoading(false);
    }
  };

  const deleteQuotation = async (id) => {
    if (window.confirm(`Are you sure you want to delete quotation ${id}?`)) {
      try {
        await axios.delete(`/api/quotations/${id}`);
        setQuotations(quotations.filter(q => q.id !== id));
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  return (
    <div className="mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">All Quotations</h5>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-quotation')}>
            <i className="bi bi-plus-circle me-2"></i>Create New
          </button>
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
                ) : quotations.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4">No quotations found.</td></tr>
                ) : (
                  quotations.map(q => (
                    <tr key={q.id}>
                      <td>{q.id}{q.version > 1 ? ` (v${q.version})` : ''}</td>
                      <td>{q.clientName}</td>
                      <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: q.currency || 'USD' }).format(q.totalValue)}</td>
                      <td>{q.dateCreated}</td>
                      <td>
                        <span className={`badge ${
                          q.status === 'Approved' ? 'bg-success' : 
                          q.status === 'Pending' ? 'bg-warning' : 
                          'bg-danger'
                        }`}>{q.status}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-1" title="View Details" onClick={() => navigate(`/view-quotation/${q.id}`)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-primary me-1" title="Edit" onClick={() => navigate(`/edit-quotation/${q.id}`)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger me-1" title="Delete" onClick={() => deleteQuotation(q.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" title="Download PDF" onClick={() => navigate(`/view-quotation/${q.id}`)}>
                          <i className="bi bi-download"></i>
                        </button>
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
