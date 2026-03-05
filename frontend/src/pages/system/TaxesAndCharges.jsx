import React, { useState } from 'react';

const TaxesAndCharges = () => {
  const [taxes, setTaxes] = useState([
    { id: 1, name: 'GST (Goods and Services Tax)', rate: '18%', type: 'Percentage', description: 'Standard tax for software services.' },
    { id: 2, name: 'VAT', rate: '5%', type: 'Percentage', description: 'Applied to international physical goods.' },
    { id: 3, name: 'Service Charge', rate: '₹500', type: 'Fixed', description: 'Standard processing fee for quotation handling.' },
    { id: 4, name: 'TDS (Tax Deducted at Source)', rate: '10%', type: 'Percentage', description: 'Withholding tax for professional fees.' }
  ]);

  const [newTax, setNewTax] = useState({ name: '', rate: '', type: 'Percentage', description: '' });

  const handleAddTax = (e) => {
    e.preventDefault();
    if (!newTax.name || !newTax.rate) return;
    const taxToAdd = { ...newTax, id: Date.now() };
    setTaxes([...taxes, taxToAdd]);
    setNewTax({ name: '', rate: '', type: 'Percentage', description: '' });
    
    // Close modal using standard Bootstrap approach
    const modalElement = document.getElementById('addTaxModal');
    const modal = window.bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 fw-bold text-primary"><i className="bi bi-calculator me-2"></i>Taxes & Charges</h2>
        <button className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" data-bs-toggle="modal" data-bs-target="#addTaxModal">
          <i className="bi bi-plus-lg me-1"></i> Add New Tax
        </button>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-uppercase small fw-bold text-muted">Tax Name</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Rate / Amount</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Type</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Description</th>
                  <th className="pe-4 py-3 text-end text-uppercase small fw-bold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {taxes.map(tax => (
                  <tr key={tax.id}>
                    <td className="ps-4 fw-bold text-dark">{tax.name}</td>
                    <td><span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">{tax.rate}</span></td>
                    <td>{tax.type}</td>
                    <td className="text-muted small" style={{maxWidth: '300px'}}>{tax.description}</td>
                    <td className="pe-4 text-end">
                      <button className="btn btn-sm btn-link text-primary p-0 me-2"><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-link text-danger p-0" onClick={() => setTaxes(taxes.filter(t => t.id !== tax.id))}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Tax Modal */}
      <div className="modal fade" id="addTaxModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pt-4 px-4">
              <h5 className="modal-title fw-bold">Add New Tax Setting</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleAddTax}>
              <div className="modal-body px-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Tax Name</label>
                  <input type="text" className="form-control rounded-3" placeholder="e.g. GST" value={newTax.name} onChange={e => setNewTax({...newTax, name: e.target.value})} required />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Rate / Amount</label>
                    <input type="text" className="form-control rounded-3" placeholder="e.g. 18% or 500" value={newTax.rate} onChange={e => setNewTax({...newTax, rate: e.target.value})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Type</label>
                    <select className="form-select rounded-3" value={newTax.type} onChange={e => setNewTax({...newTax, type: e.target.value})}>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Description</label>
                  <textarea className="form-control rounded-3" rows="3" placeholder="Brief details about this tax..." value={newTax.description} onChange={e => setNewTax({...newTax, description: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-footer border-top-0 pb-4 px-4">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">Save Tax</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxesAndCharges;
