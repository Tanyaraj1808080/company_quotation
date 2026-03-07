import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    quotationDate: '',
    items: [],
    currency: 'INR',
    status: 'Pending',
    discountRate: 0,
    taxRate: 0,
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    totalValue: 0
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
            items = [];
          }
        }

        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const discRate = parseFloat(q.discountRate) || 0;
        const txRate = parseFloat(q.taxRate) || 0;
        const discAmount = (subtotal * discRate) / 100;
        const taxAmount = (subtotal * txRate) / 100;

        setFormData({
          clientName: q.clientName || '',
          clientAddress: q.clientAddress || '',
          quotationDate: q.dateCreated || '',
          items: items,
          currency: q.currency || 'INR',
          status: q.status || 'Pending',
          discountRate: discRate,
          taxRate: txRate,
          subtotal: subtotal,
          discountAmount: discAmount,
          taxAmount: taxAmount,
          totalValue: subtotal - discAmount + taxAmount
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quotation for edit:', error);
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  const calculateTotals = (data) => {
    const subtotal = data.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const discAmount = (subtotal * parseFloat(data.discountRate || 0)) / 100;
    const taxAmount = (subtotal * parseFloat(data.taxRate || 0)) / 100;
    const total = subtotal - discAmount + taxAmount;

    return {
      ...data,
      subtotal,
      discountAmount: discAmount,
      taxAmount: taxAmount,
      totalValue: total
    };
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    let newData = { ...formData, [id]: value };
    
    if (id === 'discountRate' || id === 'taxRate') {
      newData = calculateTotals(newData);
    }
    
    setFormData(newData);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'price') {
      const qty = parseFloat(item.quantity) || 0;
      const prc = parseFloat(item.price) || 0;
      item.amount = (qty * prc).toFixed(2);
    }

    newItems[index] = item;
    const newData = calculateTotals({ ...formData, items: newItems });
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        totalValue: formData.totalValue,
        discount: formData.discountAmount,
        discountRate: formData.discountRate,
        tax: formData.taxAmount,
        taxRate: formData.taxRate,
        currency: formData.currency,
        dateCreated: formData.quotationDate,
        status: formData.status,
        items: JSON.stringify(formData.items)
      };
      await axios.patch(`/api/quotations/${id}`, payload);
      alert('Quotation updated successfully!');
      navigate('/all-quotations');
    } catch (error) {
      console.error('Error updating quotation:', error);
      alert('Failed to update quotation.');
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <section className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Edit Quotation: {id}</h2>
        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/all-quotations')}>
          <i className="bi bi-arrow-left me-2"></i>Back to List
        </button>
      </div>
      
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="mb-0 fw-bold"><i className="bi bi-pencil-square me-2"></i>Modify Quotation Details</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold text-muted">CLIENT NAME</label>
                <input type="text" className="form-control" id="clientName" value={formData.clientName} onChange={handleChange} required />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label small fw-bold text-muted">DATE</label>
                <input type="date" className="form-control" id="quotationDate" value={formData.quotationDate} onChange={handleChange} required />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label small fw-bold text-muted">STATUS</label>
                <select id="status" className="form-select" value={formData.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label small fw-bold text-muted">CLIENT ADDRESS</label>
                <textarea className="form-control" id="clientAddress" rows="2" value={formData.clientAddress} onChange={handleChange}></textarea>
              </div>
            </div>

            <h6 className="mb-3 fw-bold text-primary border-bottom pb-2">Line Items</h6>
            {formData.items.map((item, index) => (
              <div key={index} className="row align-items-end mb-3 bg-light p-3 rounded-3 mx-0">
                <div className="col-md-5 mb-2">
                  <label className="form-label small fw-bold text-muted">DESCRIPTION</label>
                  <input type="text" className="form-control" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label small fw-bold text-muted">QTY</label>
                  <input type="number" className="form-control" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label small fw-bold text-muted">PRICE</label>
                  <input type="number" className="form-control" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label small fw-bold text-muted">AMOUNT</label>
                  <div className="form-control bg-white fw-bold">₹{parseFloat(item.amount).toLocaleString()}</div>
                </div>
              </div>
            ))}

            <div className="row justify-content-end mt-4">
              <div className="col-md-4">
                <div className="card border-0 bg-light rounded-4 p-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span className="fw-bold">₹{formData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Tax (%):</span>
                    <input type="number" className="form-control form-control-sm w-25 text-end" id="taxRate" value={formData.taxRate} onChange={handleChange} />
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Discount (%):</span>
                    <input type="number" className="form-control form-control-sm w-25 text-end" id="discountRate" value={formData.discountRate} onChange={handleChange} />
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary">TOTAL:</span>
                    <span className="fw-bold text-primary fs-4">₹{formData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-end mt-4">
              <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm">
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
