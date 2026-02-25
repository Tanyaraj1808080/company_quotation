import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OpportunitiesPipeline = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    name: '',
    client: '',
    stage: 'Discovery',
    value: '',
    closeDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get('/api/opportunities');
      setOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const handleAddOpportunity = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/opportunities', newOpportunity);
      setOpportunities([...opportunities, response.data]);
      setShowModal(false);
      setNewOpportunity({ 
        name: '', client: '', stage: 'Discovery', value: '', 
        closeDate: new Date().toISOString().split('T')[0] 
      });
    } catch (error) {
      console.error('Error adding opportunity:', error);
      alert('Failed to add opportunity.');
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await axios.delete(`/api/opportunities/${id}`);
        setOpportunities(opportunities.filter(o => o.id !== id));
      } catch (error) {
        console.error('Error deleting opportunity:', error);
        alert('Failed to delete opportunity.');
      }
    }
  };

  const getOpportunitiesByStage = (stage) => {
    return opportunities.filter(o => o.stage === stage);
  };

  const renderCard = (opp) => (
    <div className="card mb-2 shadow-sm border-0 kanban-card" key={opp.id}>
      <div className="card-body p-2">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6 className="card-title mb-0 fw-bold small">{opp.name}</h6>
          <button 
            className="btn btn-sm text-danger p-0" 
            onClick={() => handleDeleteOpportunity(opp.id)}
            title="Delete"
          >
            <i className="bi bi-trash fs-6"></i>
          </button>
        </div>
        <p className="card-text small text-muted mb-1">{opp.client}</p>
        <div className="d-flex justify-content-between align-items-center">
          <span className="badge bg-light text-dark border">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(opp.value || 0)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="mb-0 fw-bold text-dark">Opportunity Pipeline</h2>
        <div className="d-flex align-items-center gap-3">
            <button className="btn btn-primary px-4 shadow-sm d-flex align-items-center" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg me-2"></i> Add Opportunity
            </button>
            <div className="input-group shadow-sm" style={{ width: '300px' }}>
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input type="text" className="form-control border-start-0 ps-0" placeholder="Search pipeline..." />
            </div>
        </div>
      </div>

      <div className="kanban-board-container" style={{ overflowX: 'auto' }}>
        <div className="kanban-board d-flex gap-3 pb-3" style={{ minWidth: '1200px' }}>
          
          {['Discovery', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'].map(stage => (
            <div className="kanban-column card border-0 shadow-sm" style={{ minWidth: '280px', backgroundColor: '#f1f3f5' }} key={stage}>
              <div className={`card-header fw-bold text-center border-0 text-white py-3 ${
                stage === 'Discovery' ? 'bg-primary' :
                stage === 'Proposal Sent' ? 'bg-info text-dark' :
                stage === 'Negotiation' ? 'bg-warning text-dark' :
                stage === 'Won' ? 'bg-success' : 'bg-danger'
              }`}>
                {stage} ({getOpportunitiesByStage(stage).length})
                <div className="small opacity-75 mt-1">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    getOpportunitiesByStage(stage).reduce((acc, o) => acc + (o.value || 0), 0)
                  )}
                </div>
              </div>
              <div className="card-body p-2" style={{ minHeight: '600px' }}>
                {getOpportunitiesByStage(stage).map(renderCard)}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Add Opportunity Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Pipeline Entry</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddOpportunity}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Opportunity Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Cloud Migration"
                      value={newOpportunity.name}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Client</label>
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
                      <label className="form-label small fw-bold">Value (USD)</label>
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
                    <label className="form-label small fw-bold">Expected Close Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={newOpportunity.closeDate}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, closeDate: e.target.value })}
                      required 
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Add to Pipeline</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPipeline;
