import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = '/api';

const Automation = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Form State
  const [ruleForm, setRuleForm] = useState({ 
    name: '', 
    trigger: 'Quotation Pending', 
    timing: 'Immediately',
    timingValue: 1,
    action: 'Send Email',
    recipient: 'Client',
    status: 'Active'
  });

  const triggers = [
    { id: 'Quotation Pending', module: 'Quotation', icon: 'bi-file-earmark-text' },
    { id: 'Invoice Overdue', module: 'Invoice', icon: 'bi-receipt' },
    { id: 'Task Due', module: 'Tasks', icon: 'bi-check2-square' },
    { id: 'New Lead Created', module: 'Leads', icon: 'bi-person-plus' }
  ];

  const actions = ['Send Email', 'Send System Notification', 'Assign Task'];
  const recipients = ['Client', 'Assigned User', 'Specific Email'];

  const mockRules = [
    { id: 1, name: 'Pending Quotation Reminder', trigger: 'Quotation Pending', timing: '3 days after', action: 'Send Email', recipient: 'Client', status: 'Active', lastRun: '2024-03-01 10:00' },
    { id: 2, name: 'Overdue Invoice Notification', trigger: 'Invoice Overdue', timing: '1 day after', action: 'Send Email', recipient: 'Client', status: 'Active', lastRun: '2024-03-02 09:30' },
    { id: 3, name: 'New Lead Welcome Email', trigger: 'New Lead Created', timing: 'Immediately', action: 'Send Email', recipient: 'Client', status: 'Draft', lastRun: '-' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Attempt to fetch from real endpoint, fallback to mock
      const res = await axios.get(`${API_URL}/automation-rules`).catch(() => ({ data: mockRules }));
      setRules(res.data || mockRules);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to fetch rules', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (rule = null) => {
    if (rule) {
      setIsEditing(true);
      setCurrentId(rule.id);
      setRuleForm({ ...rule });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setRuleForm({ name: '', trigger: 'Quotation Pending', timing: 'Immediately', timingValue: 1, action: 'Send Email', recipient: 'Client', status: 'Active' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      if (isEditing) {
        // Mock update logic
        const updatedRules = rules.map(r => r.id === currentId ? { ...ruleForm, id: currentId, lastRun: r.lastRun } : r);
        setRules(updatedRules);
        showToast('Rule updated successfully');
      } else {
        // Mock create logic
        const newRule = { ...ruleForm, id: Date.now(), lastRun: '-' };
        setRules([...rules, newRule]);
        showToast('Rule created successfully');
      }
      setShowModal(false);
    } catch (error) {
      showToast('Operation failed', 'danger');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this automation rule?')) {
      setRules(rules.filter(r => r.id !== id));
      showToast('Rule deleted');
    }
  };

  const toggleStatus = (id) => {
    setRules(rules.map(r => {
      if (r.id === id) {
        const newStatus = r.status === 'Active' ? 'Draft' : 'Active';
        showToast(`Rule marked as ${newStatus}`);
        return { ...r, status: newStatus };
      }
      return r;
    }));
  };

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || rule.status === statusFilter;
      const ruleTrigger = triggers.find(t => t.id === rule.trigger);
      const matchesModule = moduleFilter === 'All' || (ruleTrigger && ruleTrigger.module === moduleFilter);
      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [rules, searchQuery, statusFilter, moduleFilter]);

  const getTriggerBadge = (triggerId) => {
    const trigger = triggers.find(t => t.id === triggerId);
    if (!trigger) return triggerId;
    return (
      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-3 py-2 fw-medium d-inline-flex align-items-center gap-2">
        <i className={`bi ${trigger.icon}`}></i>
        {triggerId}
      </span>
    );
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="p-4 bg-light min-vh-100 animate-fade-in">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`alert alert-${toast.type} position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg z-3`} style={{ minWidth: '300px' }}>
          <i className={`bi bi-${toast.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {toast.message}
        </div>
      )}

      <div className="container-xl">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1">Automation Rules</h2>
            <p className="text-muted small mb-0">Streamline your workflow with automated reminders and actions.</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2" onClick={() => openModal()}>
            <i className="bi bi-plus-lg fs-5"></i>
            <span className="fw-bold">Create New Rule</span>
          </button>
        </div>

        {/* Filters Card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-lg-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Search Rules</label>
                <div className="input-group border rounded-3 overflow-hidden bg-light bg-opacity-50">
                  <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
                  <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Search by rule name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Module</label>
                <select className="form-select border-light-subtle rounded-3 shadow-none bg-light bg-opacity-50" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
                  <option value="All">All Modules</option>
                  <option value="Quotation">Quotations</option>
                  <option value="Invoice">Invoices</option>
                  <option value="Tasks">Tasks</option>
                  <option value="Leads">Leads</option>
                </select>
              </div>
              <div className="col-md-6 col-lg-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Status</label>
                <select className="form-select border-light-subtle rounded-3 shadow-none bg-light bg-opacity-50" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Rules Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th className="ps-4 py-3 border-0 small fw-bold text-uppercase text-muted">Rule Name</th>
                    <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Trigger Event</th>
                    <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Action</th>
                    <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Status</th>
                    <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Last Run</th>
                    <th className="pe-4 py-3 border-0 text-end small fw-bold text-uppercase text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.length > 0 ? (
                    filteredRules.map(rule => (
                      <tr key={rule.id} className="transition-all">
                        <td className="ps-4"><div className="fw-bold text-dark">{rule.name}</div></td>
                        <td>{getTriggerBadge(rule.trigger)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <i className={`bi ${rule.action === 'Send Email' ? 'bi-envelope' : rule.action === 'Assign Task' ? 'bi-person-check' : 'bi-bell'} text-muted`}></i>
                            <span className="small text-muted">{rule.action} to {rule.recipient}</span>
                          </div>
                        </td>
                        <td>
                          <div className="form-check form-switch">
                            <input className="form-check-input shadow-none cursor-pointer" type="checkbox" checked={rule.status === 'Active'} onChange={() => toggleStatus(rule.id)} />
                            <span className={`x-small fw-bold ms-1 ${rule.status === 'Active' ? 'text-success' : 'text-warning'}`}>{rule.status}</span>
                          </div>
                        </td>
                        <td><span className="text-muted small">{rule.lastRun}</span></td>
                        <td className="text-end pe-4">
                          <button className="btn btn-icon btn-light btn-sm rounded-circle me-1 shadow-sm" onClick={() => openModal(rule)}><i className="bi bi-pencil text-primary"></i></button>
                          <button className="btn btn-icon btn-light btn-sm rounded-circle shadow-sm" onClick={() => handleDelete(rule.id)}><i className="bi bi-trash text-danger"></i></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-robot display-4 d-block mb-3 opacity-25"></i>
                        <p className="fw-medium mb-0">No automation rules found</p>
                        <p className="small opacity-75">Click "Create New Rule" to get started</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-0 bg-primary text-white p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-white bg-opacity-25 p-2 rounded-3"><i className="bi bi-lightning-charge fs-4"></i></div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">{isEditing ? 'Edit Automation Rule' : 'New Automation Rule'}</h5>
                    <p className="small mb-0 opacity-75">Trigger actions automatically based on system events</p>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row g-4">
                    {/* Basic Info */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase">Rule Name</label>
                      <input type="text" className="form-control rounded-3 shadow-none border-light-subtle bg-light bg-opacity-50" required placeholder="e.g. Follow-up on pending quotes" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} />
                    </div>

                    {/* Trigger Section */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Select Trigger</label>
                      <select className="form-select rounded-3 shadow-none border-light-subtle bg-light bg-opacity-50" value={ruleForm.trigger} onChange={(e) => setRuleForm({ ...ruleForm, trigger: e.target.value })}>
                        {triggers.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Execution Timing</label>
                      <div className="input-group">
                        <select className="form-select rounded-start-3 shadow-none border-light-subtle bg-light bg-opacity-50" value={ruleForm.timing} onChange={(e) => setRuleForm({ ...ruleForm, timing: e.target.value })}>
                          <option value="Immediately">Immediately</option>
                          <option value="hours after">Hours after</option>
                          <option value="days after">Days after</option>
                          <option value="days before due">Days before due</option>
                        </select>
                        {ruleForm.timing !== 'Immediately' && (
                          <input type="number" min="1" className="form-control rounded-end-3 shadow-none border-light-subtle bg-light bg-opacity-50" style={{ maxWidth: '80px' }} value={ruleForm.timingValue} onChange={(e) => setRuleForm({ ...ruleForm, timingValue: e.target.value })} />
                        )}
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Action to Perform</label>
                      <select className="form-select rounded-3 shadow-none border-light-subtle bg-light bg-opacity-50" value={ruleForm.action} onChange={(e) => setRuleForm({ ...ruleForm, action: e.target.value })}>
                        {actions.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">To Whom (Recipient)</label>
                      <select className="form-select rounded-3 shadow-none border-light-subtle bg-light bg-opacity-50" value={ruleForm.recipient} onChange={(e) => setRuleForm({ ...ruleForm, recipient: e.target.value })}>
                        {recipients.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div className="col-12 mt-4 pt-2">
                       <div className="p-3 bg-light rounded-3 border-start border-primary border-4">
                          <div className="d-flex gap-3 align-items-center">
                             <i className="bi bi-info-circle-fill text-primary fs-4"></i>
                             <div>
                                <h6 className="mb-1 fw-bold small text-uppercase">Automation Summary</h6>
                                <p className="mb-0 small text-muted">When <b>{ruleForm.trigger}</b> happens, the system will <b>{ruleForm.action}</b> to <b>{ruleForm.recipient}</b> <b>{ruleForm.timing === 'Immediately' ? 'immediately' : `${ruleForm.timingValue} ${ruleForm.timing}`}</b>.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0 gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" disabled={btnLoading}>
                    {btnLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg me-2"></i>}
                    {isEditing ? 'Update Rule' : 'Save Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .transition-all { transition: all 0.2s ease-in-out; }
        .transition-all:hover { background-color: rgba(13, 110, 253, 0.02); }
        .x-small { font-size: 0.75rem; }
        .cursor-pointer { cursor: pointer; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .btn-icon:hover { transform: scale(1.1); }
        .last-child-mb-0:last-child { margin-bottom: 0 !important; }
      `}} />
    </div>
  );
};

export default Automation;
