import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateQuotation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    quotationDate: '',
    itemDescription: '',
    itemQty: 1,
    itemPrice: '',
    currency: 'INR'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        totalValue: parseFloat(formData.itemQty) * parseFloat(formData.itemPrice),
        currency: formData.currency,
        dateCreated: formData.quotationDate,
        items: [{
          description: formData.itemDescription,
          quantity: formData.itemQty,
          price: formData.itemPrice
        }]
      };
      await axios.post('/api/quotations', payload);
      alert('Quotation saved successfully!');
      navigate('/all-quotations');
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert('Failed to save quotation.');
    }
  };

  return (
    <section className="p-2 p-md-4 fade-in">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h2 className="fw-bold text-dark mb-0">Create New Quotation</h2>
        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/all-quotations')}>
          <i className="bi bi-arrow-left me-2"></i>Back to List
        </button>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="mb-0 fw-bold"><i className="bi bi-file-earmark-plus me-2 text-primary"></i>Quotation Details</h5>
        </div>
        <div className="card-body p-3 p-md-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label htmlFor="clientName" className="form-label small fw-bold text-muted text-uppercase">Client Name</label>
                <input type="text" className="form-control form-control-lg border-light-subtle shadow-none bg-light bg-opacity-50" id="clientName" placeholder="Enter client name" value={formData.clientName} onChange={handleChange} required />
              </div>
              <div className="col-12 col-md-6">
                <label htmlFor="quotationDate" className="form-label small fw-bold text-muted text-uppercase">Quotation Date</label>
                <input type="date" className="form-control form-control-lg border-light-subtle shadow-none bg-light bg-opacity-50" id="quotationDate" value={formData.quotationDate} onChange={handleChange} required />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-12">
                <label htmlFor="clientAddress" className="form-label small fw-bold text-muted text-uppercase">Client Address</label>
                <textarea className="form-control border-light-subtle shadow-none bg-light bg-opacity-50" id="clientAddress" rows="2" placeholder="Enter full client address" value={formData.clientAddress} onChange={handleChange}></textarea>
              </div>
            </div>

            <h6 className="mb-3 fw-bold text-primary border-bottom pb-2">Line Items</h6>
            
            {/* Responsive Table Wrapper */}
            <div className="table-responsive rounded-3 border border-light-subtle mb-4">
              <table className="table align-middle mb-0">
                <thead className="bg-light">
                  <tr className="text-muted small fw-bold text-uppercase">
                    <th style={{ minWidth: '300px' }}>Description</th>
                    <th style={{ minWidth: '100px' }}>Qty</th>
                    <th style={{ minWidth: '150px' }}>Price</th>
                    <th className="text-end" style={{ minWidth: '150px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input type="text" className="form-control border-0 shadow-none" id="itemDescription" placeholder="e.g. Website Development" value={formData.itemDescription} onChange={handleChange} required />
                    </td>
                    <td>
                      <input type="number" className="form-control border-0 shadow-none" id="itemQty" value={formData.itemQty} onChange={handleChange} min="1" required />
                    </td>
                    <td>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-0 pe-1">₹</span>
                        <input type="number" className="form-control border-0 shadow-none" id="itemPrice" placeholder="0.00" value={formData.itemPrice} onChange={handleChange} required />
                      </div>
                    </td>
                    <td className="text-end fw-bold px-3">
                      ₹{(parseFloat(formData.itemQty || 0) * parseFloat(formData.itemPrice || 0)).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="row justify-content-end">
              <div className="col-12 col-md-4">
                <div className="card bg-primary bg-opacity-10 border-0 rounded-4 p-4 text-primary">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">ESTIMATED TOTAL</span>
                    <h3 className="mb-0 fw-bold">₹{(parseFloat(formData.itemQty || 0) * parseFloat(formData.itemPrice || 0)).toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-end mt-4 d-grid d-md-block">
              <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm">
                <i className="bi bi-save me-2"></i>Save Quotation
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .form-control-lg { font-size: 1rem; padding: 0.75rem 1rem; }
        .input-group-text { color: #64748b; }
        @media (max-width: 768px) {
          .btn-lg { width: 100%; padding: 12px; }
          h2 { font-size: 1.5rem; }
        }
      `}} />
    </section>
  );
};

export default CreateQuotation;
