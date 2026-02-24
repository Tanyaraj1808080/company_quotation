import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    name: '',
    client: '',
    stage: 'Discovery',
    value: '',
    closeDate: ''
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/opportunities');
      setOpportunities(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setLoading(false);
    }
  };

  const handleAddOpportunity = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/opportunities', newOpportunity);
      setOpportunities([...opportunities, response.data]);
      setShowModal(false);
      setNewOpportunity({ name: '', client: '', stage: 'Discovery', value: '', closeDate: '' });
    } catch (error) {
      console.error('Error adding opportunity:', error);
      alert('Failed to add opportunity.');
    }
  };

  const deleteOpportunity = async (id) => {
      if (window.confirm('Are you sure you want to delete this opportunity?')) {
          try {
              await axios.delete(`http://localhost:3000/api/opportunities/${id}`);
              setOpportunities(opportunities.filter(o => o.id !== id));
          } catch (err) { console.error('Error deleting opportunity:', err); }
      }
  };

  const chartData = {
      labels: ['Won', 'Lost', 'Open'],
      datasets: [
        {
          label: '# of Votes',
          data: [12, 19, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

  return (
    <div className="p-4">
      <h2 className="mb-4">Opportunities Overview</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-primary">
                <i className="bi bi-briefcase"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Total Opportunities</p>
                <h4 className="mb-0">{opportunities.length}</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-success">+10%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-success">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Won Opportunities</p>
                <h4 className="mb-0">10</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-success">+12%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card">
            <div className="card-body d-flex align-items-center">
              <div className="kpi-icon bg-danger">
                <i className="bi bi-x-circle"></i>
              </div>
              <div className="ms-3">
                <p className="mb-0 text-muted">Lost Opportunities</p>
                <h4 className="mb-0">5</h4>
              </div>
              <div className="ms-auto">
                <span className="badge bg-danger">-3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-primary">Opportunities List</h5>
          <div>
            <input type="text" className="form-control form-control-sm d-inline-block w-auto me-2" placeholder="Search..." />
            <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Add Opportunity
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Opportunity Name</th>
                  <th>Client</th>
                  <th>Stage</th>
                  <th>Value</th>
                  <th>Close Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {loading ? (
                      <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                  ) : opportunities.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4">No opportunities found.</td></tr>
                  ) : (
                      opportunities.map(o => (
                          <tr key={o.id}>
                              <td className="fw-medium">{o.name}</td>
                              <td>{o.client || '-'}</td>
                              <td><span className={`badge ${
                                  o.stage === 'Discovery' ? 'bg-primary' :
                                  o.stage === 'Proposal Sent' ? 'bg-info' :
                                  o.stage === 'Negotiation' ? 'bg-warning' :
                                  o.stage === 'Won' ? 'bg-success' :
                                  'bg-danger'
                              }`}>{o.stage}</span></td>
                              <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(o.value || 0)}</td>
                              <td>{o.closeDate || '-'}</td>
                              <td>
                                  <button className="btn btn-sm btn-outline-info me-1" title="View"><i className="bi bi-eye"></i></button>
                                  <button className="btn btn-sm btn-outline-primary me-1" title="Edit"><i className="bi bi-pencil"></i></button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteOpportunity(o.id)} title="Delete"><i className="bi bi-trash"></i></button>
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Opportunity Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Create New Opportunity</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddOpportunity}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Opportunity Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Website Redesign"
                      value={newOpportunity.name}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Client Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Acme Corp"
                      value={newOpportunity.client}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, client: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Expected Value</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="0.00"
                        value={newOpportunity.value}
                        onChange={(e) => setNewOpportunity({ ...newOpportunity, value: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Stage</label>
                      <select 
                        className="form-select"
                        value={newOpportunity.stage}
                        onChange={(e) => setNewOpportunity({ ...newOpportunity, stage: e.target.value })}
                      >
                        <option value="Discovery">Discovery</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Target Close Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={newOpportunity.closeDate}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, closeDate: e.target.value })}
                      required 
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Create Opportunity</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <div className="card chart-card shadow-sm border-0">
          <div className="card-header">
              Opportunity Stage Distribution
          </div>
          <div className="card-body" style={{height: '300px'}}>
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
      </div>
    </div>
  );
};

export default Opportunities;
