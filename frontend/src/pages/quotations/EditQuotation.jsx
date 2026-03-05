import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientName: '',
    quotationDate: '',
    itemDescription: '',
    itemQty: 1,
    itemPrice: '',
    currency: 'USD',
    status: 'Pending'
  });

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const response = await axios.get(`/api/quotations/${id}`);
        const q = response.data;
        
        let items = [];
        if (q.items) {
          try {
            items = typeof q.items === 'string' ? JSON.parse(q.items) : q.items;
          } catch (e) {
            console.error("Error parsing items:", e);
            items = [];
          }
        }

        setFormData({
          clientName: q.clientName || '',
          quotationDate: q.dateCreated || '',
          itemDescription: items && items[0] ? items[0].description : '',
          itemQty: items && items[0] ? items[0].quantity : 1,
          itemPrice: items && items[0] ? items[0].price : '',
          currency: q.currency || 'USD',
          status: q.status || 'Pending'
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quotation for edit:', error);
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        clientName: formData.clientName,
        totalValue: parseFloat(formData.itemQty || 0) * parseFloat(formData.itemPrice || 0),
        currency: formData.currency,
        dateCreated: formData.quotationDate,
        status: formData.status,
        items: JSON.stringify([{
          description: formData.itemDescription,
          quantity: formData.itemQty,
          price: formData.itemPrice,
          amount: (parseFloat(formData.itemQty || 0) * parseFloat(formData.itemPrice || 0)).toFixed(2)
        }])
      };
      await axios.patch(`/api/quotations/${id}`, payload);
      alert('Quotation updated successfully!');
      navigate('/all-quotations');
    } catch (error) {
      console.error('Error updating quotation:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update quotation.';
      alert(errorMsg);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading quotation data...</div>;

  return (
    <section className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Quotation: {id}</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/all-quotations')}>
          <i className="bi bi-x-circle me-2"></i>Cancel
        </button>
      </div>
      
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Modify Details</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label htmlFor="clientName" className="form-label fw-bold">Client Name</label>
                <input type="text" className="form-control form-control-lg" id="clientName" value={formData.clientName} onChange={handleChange} required />
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="quotationDate" className="form-label fw-bold">Date Created</label>
                <input type="date" className="form-control form-control-lg" id="quotationDate" value={formData.quotationDate} onChange={handleChange} required />
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="status" className="form-label fw-bold">Status</label>
                <select id="status" className="form-select form-select-lg" value={formData.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <h5 className="mb-3 border-bottom pb-2">Line Items</h5>
            <div className="row align-items-end mb-4">
              <div className="col-md-5 mb-3">
                <label htmlFor="itemDescription" className="form-label">Description</label>
                <input type="text" className="form-control" id="itemDescription" value={formData.itemDescription} onChange={handleChange} />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="itemQty" className="form-label">Quantity</label>
                <input type="number" className="form-control" id="itemQty" value={formData.itemQty} onChange={handleChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="itemPrice" className="form-label">Price</label>
                <div className="input-group">
                  <span className="input-group-text">{formData.currency}</span>
                  <input type="number" className="form-control" id="itemPrice" value={formData.itemPrice} onChange={handleChange} required />
                </div>
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
            </div>

            <div className="alert alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-primary">Total Amount:</span>
                <strong className="fs-3 text-primary">
                  {formData.currency === 'INR' ? '₹' : 
                   formData.currency === 'USD' ? '$' : 
                   formData.currency === 'EUR' ? '€' : 
                   formData.currency === 'GBP' ? '£' : ''}
                  {(parseFloat(formData.itemQty || 0) * parseFloat(formData.itemPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            <div className="text-end mt-4">
              <button type="submit" className="btn btn-primary btn-lg px-5">
                <i className="bi bi-save me-2"></i>Update Quotation
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EditQuotation;
