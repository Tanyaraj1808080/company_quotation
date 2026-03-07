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
    currency: 'USD'
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
      alert('Quotation created successfully!');
      navigate('/all-quotations');
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert('Failed to create quotation.');
    }
  };

  return (
    <section className="p-4">
      <h2 className="mb-4">New Quotation Form</h2>
      <div className="card">
        <div className="card-header">Quotation Details</div>
        <div className="card-body">
          <form id="create-quotation-form" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label htmlFor="loadTemplate" className="form-label">Load from Template (Optional)</label>
                <select id="loadTemplate" className="form-select">
                  <option defaultValue>Choose a template...</option>
                  <option value="1">Standard Website Package</option>
                  <option value="2">Mobile App (Basic)</option>
                  <option value="3">Annual Maintenance Contract</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="clientName" className="form-label">Client Name</label>
                <input type="text" className="form-control" id="clientName" placeholder="Enter client name" value={formData.clientName} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="quotationDate" className="form-label">Date</label>
                <input type="date" className="form-control" id="quotationDate" value={formData.quotationDate} onChange={handleChange} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label htmlFor="clientAddress" className="form-label">Client Address</label>
                <textarea className="form-control" id="clientAddress" rows="3" placeholder="Enter full client address" value={formData.clientAddress} onChange={handleChange}></textarea>
              </div>
            </div>
            <hr />
            <h5>Items</h5>
            <div className="row align-items-end">
              <div className="col-md-5 mb-3">
                <label htmlFor="itemDescription" className="form-label">Description</label>
                <input type="text" className="form-control" id="itemDescription" placeholder="Service or product description" value={formData.itemDescription} onChange={handleChange} />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="itemQty" className="form-label">Quantity</label>
                <input type="number" className="form-control" id="itemQty" value={formData.itemQty} onChange={handleChange} />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="itemPrice" className="form-label">Price</label>
                <input type="number" className="form-control" id="itemPrice" placeholder="0.00" value={formData.itemPrice} onChange={handleChange} required />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="currency" className="form-label">Currency</label>
                <select id="currency" className="form-select" value={formData.currency} onChange={handleChange}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="col-md-1 mb-3">
                <button type="button" className="btn btn-primary w-100"><i className="bi bi-plus"></i></button>
              </div>
            </div>
            <hr />
            <div className="text-end">
              <button type="submit" className="btn btn-success"><i className="bi bi-check-lg me-1"></i> Save Quotation</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/all-quotations')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateQuotation;
