import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [newPayment, setNewPayment] = useState({
    invoiceId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, invoicesRes] = await Promise.all([
        axios.get('/api/payments'),
        axios.get('/api/invoices')
      ]);
      setPayments(paymentsRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/payments', newPayment);
      setPayments([...payments, response.data]);
      
      // Update local invoices state to reflect payment
      setInvoices(invoices.map(inv => {
        if (inv.id === newPayment.invoiceId) {
          const totalPaid = (inv.amountPaid || 0) + parseFloat(newPayment.amount);
          return { ...inv, amountPaid: totalPaid, status: totalPaid >= inv.amount ? 'Paid' : 'Partial' };
        }
        return inv;
      }));

      setShowModal(false);
      setNewPayment({
        invoiceId: '', amount: '', 
        paymentDate: new Date().toISOString().split('T')[0], 
        paymentMethod: 'Bank Transfer', transactionId: '', notes: ''
      });
      alert('Payment recorded successfully!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const receivedAmount = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const pendingAmount = totalAmount - receivedAmount;
  const overdueCount = invoices.filter(inv => new Date(inv.dueDate) < new Date() && inv.status !== 'Paid').length;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">Paid</span>;
      case 'Partial': return <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3">Partial</span>;
      case 'Overdue': return <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3">Overdue</span>;
      default: return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-3">{status}</span>;
    }
  };

  return (
    <div className="p-4 bg-light min-vh-100 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Payment Management</h2>
          <p className="text-muted small mb-0">Track and record payments against client invoices</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg"></i>
          <span className="fw-bold">Record Payment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 text-primary"><i className="bi bi-wallet2 fs-4"></i></div>
                <span className="small fw-bold text-muted text-uppercase">Total Invoiced</span>
              </div>
              <h3 className="mb-0 fw-bold">₹{totalAmount.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-success bg-opacity-10 p-2 text-success"><i className="bi bi-cash-stack fs-4"></i></div>
                <span className="small fw-bold text-muted text-uppercase">Received</span>
              </div>
              <h3 className="mb-0 fw-bold text-success">₹{receivedAmount.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-warning bg-opacity-10 p-2 text-warning"><i className="bi bi-hourglass-split fs-4"></i></div>
                <span className="small fw-bold text-muted text-uppercase">Pending</span>
              </div>
              <h3 className="mb-0 fw-bold text-warning">₹{pendingAmount.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-danger bg-opacity-10 p-2 text-danger"><i className="bi bi-exclamation-triangle fs-4"></i></div>
                <span className="small fw-bold text-muted text-uppercase">Overdue</span>
              </div>
              <h3 className="mb-0 fw-bold text-danger">{overdueCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Payment List Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <h5 className="mb-0 fw-bold">Recent Billing Activity</h5>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm border rounded-pill overflow-hidden" style={{maxWidth: '250px'}}>
              <span className="input-group-text bg-white border-0"><i className="bi bi-search text-muted"></i></span>
              <input type="text" className="form-control border-0 shadow-none" placeholder="Search client or invoice..." value={searchTerm} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="form-select form-select-sm rounded-pill border shadow-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{width: '140px'}}>
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 border-0 small fw-bold text-uppercase text-muted">Client Name</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Invoice #</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Total Amount</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Amount Paid</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Balance</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Status</th>
                  <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Due Date</th>
                  <th className="pe-4 py-3 border-0 text-end small fw-bold text-uppercase text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-5 text-muted">No records found matching filters.</td></tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id} className="transition-all">
                      <td className="ps-4 fw-bold text-dark">{inv.clientName}</td>
                      <td><span className="text-primary fw-medium">{inv.id}</span></td>
                      <td>₹{inv.amount.toLocaleString()}</td>
                      <td className="text-success fw-medium">₹{(inv.amountPaid || 0).toLocaleString()}</td>
                      <td className="text-danger fw-medium">₹{(inv.amount - (inv.amountPaid || 0)).toLocaleString()}</td>
                      <td>{getStatusBadge(new Date(inv.dueDate) < new Date() && inv.status !== 'Paid' ? 'Overdue' : inv.status)}</td>
                      <td><span className="text-muted small">{inv.dueDate}</span></td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-light rounded-pill px-3 shadow-sm" onClick={() => { setNewPayment({...newPayment, invoiceId: inv.id}); setShowModal(true); }}>
                          Record Payment
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

      {/* Record Payment Modal */}
      {showModal && (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Record Received Payment</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleRecordPayment}>
                <div className="modal-body py-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase">Select Invoice</label>
                      <select className="form-select rounded-3 shadow-none bg-light border-0" required value={newPayment.invoiceId} onChange={(e) => setNewPayment({...newPayment, invoiceId: e.target.value})}>
                        <option value="">Select Invoice...</option>
                        {invoices.filter(i => i.status !== 'Paid').map(i => (
                          <option key={i.id} value={i.id}>{i.id} - {i.clientName} (Bal: ₹{i.amount - (i.amountPaid || 0)})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Amount Received</label>
                      <div className="input-group border rounded-3 bg-light overflow-hidden">
                        <span className="input-group-text bg-transparent border-0">₹</span>
                        <input type="number" className="form-control bg-transparent border-0 shadow-none" required value={newPayment.amount} onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Payment Date</label>
                      <input type="date" className="form-control rounded-3 shadow-none bg-light border-0" required value={newPayment.paymentDate} onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Payment Method</label>
                      <select className="form-select rounded-3 shadow-none bg-light border-0" value={newPayment.paymentMethod} onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI / Digital Wallet</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Card">Credit/Debit Card</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Ref ID / Transaction ID</label>
                      <input type="text" className="form-control rounded-3 shadow-none bg-light border-0" placeholder="e.g. TXN12345" value={newPayment.transactionId} onChange={(e) => setNewPayment({...newPayment, transactionId: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase">Notes</label>
                      <textarea className="form-control rounded-3 shadow-none bg-light border-0" rows="2" placeholder="Internal notes..." value={newPayment.notes} onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">Save Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .transition-all { transition: all 0.2s ease-in-out; }
        .transition-all:hover { background-color: rgba(13, 110, 253, 0.02); }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default Payments;
