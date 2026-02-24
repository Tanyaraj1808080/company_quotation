import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    source: 'Direct'
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/leads');
      setLeads(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/leads', newLead);
      setLeads([...leads, response.data]);
      setShowModal(false);
      setNewLead({ name: '', company: '', email: '', phone: '', status: 'New', source: 'Direct' });
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Failed to add lead. Please check the console.');
    }
  };

  const deleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`http://localhost:3000/api/leads/${id}`);
        setLeads(leads.filter(l => l.id !== id));
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">All Leads</h5>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-plus me-2"></i>Add Lead
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center">Loading...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan="5" className="text-center">No leads found.</td></tr>
                ) : (
                  leads.map(l => (
                    <tr key={l.id}>
                      <td>{l.name}</td>
                      <td>{l.company || '-'}</td>
                      <td><span className="small text-muted">{l.source || 'Direct'}</span></td>
                      <td>
                        <span className={`badge ${
                          l.status === 'Qualified' ? 'bg-success' : 
                          l.status === 'New' ? 'bg-warning' : 
                          l.status === 'Follow-up' ? 'bg-info' : 
                          'bg-secondary'
                        }`}>{l.status}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-1" title="View"><i className="bi bi-eye"></i></button>
                        <button className="btn btn-sm btn-outline-success me-1" title="Convert to Client"><i className="bi bi-person-check"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteLead(l.id)} title="Delete"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Add New Lead</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddLead}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. John Doe"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Company Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Alpha Corp"
                      value={newLead.company}
                      onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="john@example.com"
                        value={newLead.email}
                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Phone</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="+1 234 567"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Lead Source</label>
                      <select 
                        className="form-select"
                        value={newLead.source}
                        onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                      >
                        <option value="Direct">Direct</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Social Media">Social Media</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Initial Status</label>
                      <select 
                        className="form-select"
                        value={newLead.status}
                        onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                      >
                        <option value="New">New</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Create Lead</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leads;
