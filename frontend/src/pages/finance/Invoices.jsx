import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    amount: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/invoices');
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/invoices', newInvoice);
      setInvoices([...invoices, response.data]);
      setShowModal(false);
      setNewInvoice({ 
        clientName: '', amount: '', 
        issueDate: new Date().toISOString().split('T')[0], 
        dueDate: '', status: 'Pending' 
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice.');
    }
  };

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      // Assuming a patch route exists or using the same pattern as quotations
      await axios.patch(`http://localhost:3000/api/invoices/${id}/status`, { status: newStatus });
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteInvoice = async (id) => {
    if (window.confirm(`Are you sure you want to delete invoice ${id}?`)) {
      try {
        await axios.delete(`http://localhost:3000/api/invoices/${id}`);
        setInvoices(invoices.filter(i => i.id !== id));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
  const outstandingAmount = totalInvoiced - paidAmount;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-dark">Invoice Management</h2>
        <button className="btn btn-primary px-4 shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>Create Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold text-muted">Total Invoiced</h6>
              <h2 className="mb-0 fw-bold text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalInvoiced)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold text-muted">Total Paid</h6>
              <h2 className="mb-0 fw-bold text-success">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paidAmount)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-4">
              <h6 className="text-uppercase opacity-75 mb-2 small fw-bold text-muted">Outstanding</h6>
              <h2 className="mb-0 fw-bold text-danger">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(outstandingAmount)}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Recent Invoices</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Invoice ID</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4">No invoices found.</td></tr>
                ) : (
                  invoices.map(i => (
                    <tr key={i.id}>
                      <td className="fw-bold">{i.id}</td>
                      <td>{i.clientName}</td>
                      <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: i.currency || 'USD' }).format(i.amount)}</td>
                      <td>
                        <span className={new Date(i.dueDate) < new Date() && i.status !== 'Paid' ? 'text-danger fw-bold' : ''}>
                          {i.dueDate}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          i.status === 'Paid' ? 'bg-success' : 
                          i.status === 'Pending' ? 'bg-warning' : 
                          'bg-danger'
                        }`}>{i.status}</span>
                      </td>
                      <td>
                        <button 
                          className={`btn btn-sm ${i.status === 'Paid' ? 'btn-success' : 'btn-outline-success'} me-1`}
                          title="Toggle Payment"
                          onClick={() => updatePaymentStatus(i.id, i.status === 'Paid' ? 'Pending' : 'Paid')}
                        >
                          <i className="bi bi-cash-coin"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-info me-1" title="View"><i className="bi bi-eye"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteInvoice(i.id)} title="Delete"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Generate New Invoice</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateInvoice}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Client Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Acme Corp"
                      value={newInvoice.clientName}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Total Amount (USD)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="0.00"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Issue Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={newInvoice.issueDate}
                        onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Due Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={newInvoice.dueDate}
                        onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                        required 
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">Generate Invoice</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
