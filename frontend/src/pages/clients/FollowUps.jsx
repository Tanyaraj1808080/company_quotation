import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const FollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFollowup, setNewFollowup] = useState({
    subject: '',
    client: '',
    dueDate: '',
    priority: 'Normal',
    method: 'Call',
    status: 'Pending'
  });

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      const response = await axios.get('/api/followups');
      setFollowups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      setLoading(false);
    }
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/followups', newFollowup);
      setFollowups([...followups, response.data]);
      setShowModal(false);
      setNewFollowup({ subject: '', client: '', dueDate: '', priority: 'Normal', method: 'Call', status: 'Pending' });
    } catch (error) {
      console.error('Error adding follow-up:', error);
      alert('Failed to add follow-up.');
    }
  };

  const deleteFollowup = async (id) => {
      if (window.confirm('Are you sure you want to delete this follow-up?')) {
          try {
              await axios.delete(`/api/followups/${id}`);
              setFollowups(followups.filter(f => f.id !== id));
          } catch (err) { console.error('Error deleting follow-up:', err); }
      }
  };

  const totalFollowups = followups.length;
  const completedFollowups = followups.filter(f => f.status === 'Completed').length;
  const pendingFollowups = followups.filter(f => f.status === 'Pending').length;

  const chartData = {
      labels: ['Pending', 'Completed'],
      datasets: [
        {
          data: [pendingFollowups, completedFollowups],
          backgroundColor: ['#ffc107', '#198754'],
          hoverOffset: 4
        },
      ],
    };

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold text-dark">Follow Ups Overview</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card kpi-card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-primary shadow-sm text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                <i className="bi bi-clock-history fs-4"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted small text-uppercase fw-bold">Total</p>
                <h3 className="mb-0 fw-bold">{totalFollowups}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-success shadow-sm text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                <i className="bi bi-check-circle fs-4"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted small text-uppercase fw-bold">Completed</p>
                <h3 className="mb-0 fw-bold">{completedFollowups}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-warning shadow-sm text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                <i className="bi bi-hourglass-split fs-4"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted small text-uppercase fw-bold">Pending</p>
                <h3 className="mb-0 fw-bold">{pendingFollowups}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Scheduled Follow Ups</h5>
          <div>
            <input type="text" className="form-control form-control-sm d-inline-block w-auto me-2" placeholder="Search..." />
            <button className="btn btn-sm btn-primary px-3" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Add Follow Up
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Subject</th>
                  <th>Client/Lead</th>
                  <th>Due Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {loading ? (
                      <tr><td colSpan="6" className="text-center py-4">Loading follow-ups...</td></tr>
                  ) : followups.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4">No follow-ups found.</td></tr>
                  ) : (
                      followups.map(f => (
                          <tr key={f.id}>
                              <td className="fw-medium">{f.subject}</td>
                              <td>{f.client || '-'}</td>
                              <td>{f.dueDate || '-'}</td>
                              <td>
                                <span className="small text-muted">
                                  {f.method === 'Call' && <i className="bi bi-telephone-fill me-1"></i>}
                                  {f.method === 'Email' && <i className="bi bi-envelope-fill me-1"></i>}
                                  {f.method === 'Meeting' && <i className="bi bi-people-fill me-1"></i>}
                                  {f.method}
                                </span>
                              </td>
                              <td><span className={`badge ${
                                  f.status === 'Completed' ? 'bg-success' :
                                  f.status === 'Pending' ? 'bg-warning' :
                                  'bg-danger'
                              }`}>{f.status}</span></td>
                              <td>
                                  <button className="btn btn-sm btn-outline-info me-1" title="View"><i className="bi bi-eye"></i></button>
                                  <button className="btn btn-sm btn-outline-primary me-1" title="Edit"><i className="bi bi-pencil"></i></button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteFollowup(f.id)} title="Delete"><i className="bi bi-trash"></i></button>
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Follow Up Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">New Follow-Up</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddFollowup}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Project Update Call"
                      value={newFollowup.subject}
                      onChange={(e) => setNewFollowup({ ...newFollowup, subject: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Client / Lead Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. John Smith"
                      value={newFollowup.client}
                      onChange={(e) => setNewFollowup({ ...newFollowup, client: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Due Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={newFollowup.dueDate}
                        onChange={(e) => setNewFollowup({ ...newFollowup, dueDate: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Method</label>
                      <select 
                        className="form-select"
                        value={newFollowup.method}
                        onChange={(e) => setNewFollowup({ ...newFollowup, method: e.target.value })}
                      >
                        <option value="Call">Call</option>
                        <option value="Email">Email</option>
                        <option value="Meeting">Meeting</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Priority</label>
                    <div className="d-flex gap-3 mt-1">
                      {['Low', 'Normal', 'High'].map(p => (
                        <div className="form-check" key={p}>
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="priority" 
                            id={`p-${p}`} 
                            checked={newFollowup.priority === p}
                            onChange={() => setNewFollowup({ ...newFollowup, priority: p })}
                          />
                          <label className="form-check-label small" htmlFor={`p-${p}`}>{p}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Schedule</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <div className="card chart-card shadow-sm border-0 mt-4">
          <div className="card-header">
              Follow Up Priority Distribution
          </div>
          <div className="card-body" style={{height: '300px'}}>
              <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
      </div>
    </div>
  );
};

export default FollowUps;
