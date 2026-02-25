import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/clients', newClient);
      setClients([...clients, response.data]);
      setShowModal(false);
      setNewClient({ name: '', contactPerson: '', email: '', phone: '', status: 'Active' });
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client. Please check the console.');
    }
  };

  const deleteClient = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`/api/clients/${id}`);
        setClients(clients.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">All Clients</h5>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-plus me-2"></i>Add Client
          </button>
        </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center">Loading...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan="6" className="text-center">No clients found.</td></tr>
              ) : (
                clients.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.contactPerson || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.phone || '-'}</td>
                    <td>
                      <span className={`badge ${c.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-info me-1"><i className="bi bi-eye"></i></button>
                      <button className="btn btn-sm btn-outline-primary me-1"><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteClient(c.id)}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Add New Client</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddClient}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Company Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Acme Corp"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Contact Person</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. John Doe"
                      value={newClient.contactPerson}
                      onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="client@example.com"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Phone</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="+91 9876543210"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Initial Status</label>
                    <select 
                      className="form-select"
                      value={newClient.status}
                      onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Create Client</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Clients;
