import React, { useState } from 'react';

const TermsConditionsPage = () => {
  const [terms, setTerms] = useState([
    { id: 1, title: 'Payment Terms', content: '50% advance payment is required to commence work. Remaining 50% upon project completion and before handover.' },
    { id: 2, title: 'Validity', content: 'This quotation is valid for 30 days from the date of issue.' },
    { id: 3, title: 'Scope Change', content: 'Any changes outside the initial project scope will be charged additional at a rate of ₹1500 per hour.' },
    { id: 4, title: 'Delivery Timeline', content: 'Expected delivery is 4-6 weeks after initial payment and receipt of all required assets.' },
    { id: 5, title: 'Confidentiality', content: 'All project discussions and proprietary data will remain confidential between the provider and the client.' }
  ]);

  const [newClause, setNewClause] = useState({ title: '', content: '' });

  const handleAddClause = (e) => {
    e.preventDefault();
    if (!newClause.title || !newClause.content) return;
    const clauseToAdd = { ...newClause, id: Date.now() };
    setTerms([...terms, clauseToAdd]);
    setNewClause({ title: '', content: '' });
    
    // Close modal using standard Bootstrap approach
    try {
      const modalElement = document.getElementById('addClauseModal');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    } catch (err) {
      console.error("Modal close error:", err);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 fw-bold text-primary"><i className="bi bi-journal-check me-2"></i>Terms & Conditions</h2>
        <button className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" data-bs-toggle="modal" data-bs-target="#addClauseModal">
          <i className="bi bi-plus-lg me-1"></i> Add New Clause
        </button>
      </div>

      <div className="row g-4">
        {terms.map(term => (
          <div className="col-md-6 col-lg-4" key={term.id}>
            <div className="card h-100 shadow-sm border-0 rounded-4 transition-all hover-shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark mb-0">{term.title}</h6>
                  <div className="dropdown">
                    <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown"><i className="bi bi-three-dots-vertical"></i></button>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                      <li><button className="dropdown-item py-2" onClick={() => {}}><i className="bi bi-pencil me-2"></i>Edit</button></li>
                      <li><button className="dropdown-item py-2 text-danger" onClick={() => setTerms(terms.filter(t => t.id !== term.id))}><i className="bi bi-trash me-2"></i>Delete</button></li>
                    </ul>
                  </div>
                </div>
                <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>{term.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Clause Modal */}
      <div className="modal fade" id="addClauseModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pt-4 px-4">
              <h5 className="modal-title fw-bold">Add New Clause</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleAddClause}>
              <div className="modal-body px-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Clause Title</label>
                  <input type="text" className="form-control rounded-3" placeholder="e.g. Warranty Period" value={newClause.title} onChange={e => setNewClause({...newClause, title: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Content</label>
                  <textarea className="form-control rounded-3" rows="5" placeholder="Enter the full text of the clause..." value={newClause.content} onChange={e => setNewClause({...newClause, content: e.target.value})} required></textarea>
                </div>
              </div>
              <div className="modal-footer border-top-0 pb-4 px-4">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">Save Clause</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .hover-shadow:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
      `}} />
    </div>
  );
};

export default TermsConditionsPage;
