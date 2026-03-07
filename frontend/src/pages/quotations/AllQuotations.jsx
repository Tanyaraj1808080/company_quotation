import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AllQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
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
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected quotations?`)) {
      try {
        await axios.post('/api/quotations/bulk-delete', { ids: selectedIds });
        setQuotations(quotations.filter(q => !selectedIds.includes(q.id)));
        setSelectedIds([]);
        alert('Selected quotations deleted successfully.');
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Failed to delete selected quotations.');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === quotations.length) {
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

  const exportToCSV = () => {
    if (quotations.length === 0) return;
    const headers = ['ID', 'Client', 'Value', 'Date', 'Status'];
    const escapeCSV = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const rows = quotations.map(q => [
      escapeCSV(q.id), escapeCSV(q.clientName), escapeCSV(q.totalValue), escapeCSV(q.dateCreated), escapeCSV(q.status)
    ]);
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quotations_export.csv`;
    link.click();
  };

  return (
    <div className="mt-4 fade-in">
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-4 px-4 border-0">
          <div>
            <h4 className="fw-bold text-dark mb-1">All Quotations</h4>
            <p className="text-muted small mb-0">Total {quotations.length} records found in database</p>
          </div>
          <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
              <button className="btn btn-danger rounded-pill px-4 shadow-sm" onClick={handleBulkDelete}>
                <i className="bi bi-trash3-fill me-2"></i>Delete Selected ({selectedIds.length})
              </button>
            )}
            <button className="btn btn-modern-secondary shadow-sm" onClick={exportToCSV}>
              <i className="bi bi-file-earmark-arrow-down me-2"></i>Export CSV
            </button>
            <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => navigate('/quotation-templates')}>
              <i className="bi bi-plus-lg me-2"></i>Create New
            </button>
          </div>
        </div>
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
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Date Created</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Status</th>
                  <th className="pe-4 py-3 border-0 text-end small fw-bold text-uppercase text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></td></tr>
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
                      <td className="fw-bold text-dark">₹{parseFloat(q.totalValue).toLocaleString()}</td>
                      <td className="text-muted small">{q.dateCreated}</td>
                      <td>
                        <span className={`badge-modern ${
                          q.status === 'Approved' ? 'bg-success' : q.status === 'Pending' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn-action view" title="View Details" onClick={() => navigate(`/view-quotation/${q.id}`)}>
                            <i className="bi bi-eye-fill"></i>
                          </button>
                          <button className="btn-action edit" title="Edit" onClick={() => navigate(`/edit-quotation/${q.id}`)}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn-action print" title="Print PDF" onClick={() => navigate(`/view-quotation/${q.id}`)}>
                            <i className="bi bi-printer-fill"></i>
                          </button>
                          <button className="btn-action delete" title="Delete" onClick={() => deleteQuotation(q.id)}>
                            <i className="bi bi-trash3-fill"></i>
                          </button>
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

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-modern-secondary {
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          border-radius: 50px;
          padding: 8px 20px;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .btn-modern-secondary:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
        
        .modern-row:hover { background-color: #f1f5f9 !important; }
        
        .badge-modern {
          padding: 6px 14px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          border-radius: 50px;
          display: inline-block;
          color: #fff;
        }

        .btn-action {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: #f8fafc;
          font-size: 1.1rem;
        }
        
        .btn-action.view { color: #0ea5e9; }
        .btn-action.view:hover { background: #0ea5e9; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }
        
        .btn-action.edit { color: #6366f1; }
        .btn-action.edit:hover { background: #6366f1; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
        
        .btn-action.print { color: #64748b; }
        .btn-action.print:hover { background: #64748b; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3); }
        
        .btn-action.delete { color: #ef4444; }
        .btn-action.delete:hover { background: #ef4444; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
        
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .form-check-input:checked {
          background-color: #ef4444;
          border-color: #ef4444;
        }
      `}} />
    </div>
  );
};

export default AllQuotations;
