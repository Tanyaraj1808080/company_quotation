import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showColModal, setShowColModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const scrollRef = useRef(null);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [leadsRes, colsRes] = await Promise.all([
        axios.get('/api/leads'),
        axios.get('/api/lead-columns')
      ]);
      
      setDynamicColumns(colsRes.data || []);
      
      if (leadsRes.data.length > 0) {
        const processedLeads = leadsRes.data.map(l => ({
          ...l,
          interactions: (l.interactions && l.interactions.length > 0) 
            ? [...l.interactions, getEmptyInteraction()] 
            : [getEmptyInteraction()]
        }));
        setLeads([...processedLeads, getEmptyRow()]);
      } else {
        setLeads([getEmptyRow()]);
      }
      setLoading(false);
      setIsDirty(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLeads([getEmptyRow()]);
      setLoading(false);
    }
  };

  const getEmptyRow = () => ({
    clientName: '',
    company: '',
    roleProjectType: '',
    contactLink: '',
    dateToConnect: '',
    followupDate: '',
    status: 'New',
    meetingDate: '',
    dealValue: '',
    notes: '',
    customFields: {},
    interactions: [getEmptyInteraction()],
    isNew: true
  });

  const getEmptyInteraction = () => ({
    date: new Date().toISOString().split('T')[0],
    summary: '',
    followupDate: '',
    status: 'Follow-up',
    dealValue: '',
    meetingDate: '',
    isNewInteraction: true
  });

  const handleInputChange = (index, field, value, isCustom = false) => {
    setIsDirty(true);
    const updatedLeads = [...leads];
    
    // Validation for dealValue
    if (field === 'dealValue' && value !== '' && isNaN(value)) return;

    if (isCustom) {
      updatedLeads[index].customFields = { ...updatedLeads[index].customFields, [field]: value };
    } else {
      updatedLeads[index][field] = value;
    }
    
    // Improved Auto-Row Trigger: Any field change in the last row
    if (index === leads.length - 1 && value !== '') {
      updatedLeads.push(getEmptyRow());
    }
    
    setLeads(updatedLeads);
  };

  const handleInteractionChange = (leadIndex, intIndex, field, value) => {
    setIsDirty(true);
    const updatedLeads = [...leads];
    const interaction = updatedLeads[leadIndex].interactions[intIndex];
    
    // Validation
    if (field === 'dealValue' && value !== '' && isNaN(value)) return;
    
    interaction[field] = value;
    
    // Interaction Auto-Row Add
    if (intIndex === updatedLeads[leadIndex].interactions.length - 1 && value !== '') {
      updatedLeads[leadIndex].interactions.push(getEmptyInteraction());
    }
    
    setLeads(updatedLeads);
  };

  const deleteInteraction = async (lIndex, iIndex, id) => {
    if (id) {
      if (!window.confirm('Delete this interaction permanently?')) return;
      try {
        await axios.delete(`/api/lead-interactions/${id}`);
      } catch (err) { console.error(err); }
    }
    const updated = [...leads];
    updated[lIndex].interactions = updated[lIndex].interactions.filter((_, i) => i !== iIndex);
    if (updated[lIndex].interactions.length === 0) updated[lIndex].interactions.push(getEmptyInteraction());
    setLeads(updated);
    setIsDirty(true);
  };

  const toggleExpand = (id) => {
    setExpandedLeadId(expandedLeadId === id ? null : id);
  };

  const saveAll = async () => {
    // Sanitize: Remove completely empty rows and empty interactions
    const leadsToSave = leads.filter(l => l.clientName || l.company || Object.values(l.customFields || {}).some(v => v));
    
    if (leadsToSave.length === 0) {
      alert('Nothing to save.');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/api/leads/bulk-sync', { leads: leadsToSave });
      setIsDirty(false);
      alert('All data synchronized successfully!');
      fetchInitialData();
    } catch (error) {
      console.error('Bulk save error:', error);
      alert('Error saving data. Please check connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const key = newColName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    try {
      const res = await axios.post('/api/lead-columns', { name: newColName, key, type: 'text' });
      setDynamicColumns([...dynamicColumns, res.data]);
      setNewColName('');
      setShowColModal(false);
      setIsDirty(true);
    } catch (err) { alert('Column key must be unique.'); }
  };

  const removeLead = async (index, id) => {
    if (id) {
      if (!window.confirm('Delete this lead and all history?')) return;
      try {
        await axios.delete(`/api/leads/${id}`);
        fetchInitialData();
      } catch (err) { console.error(err); }
    } else {
      const updated = leads.filter((_, i) => i !== index);
      setLeads(updated.length > 0 ? updated : [getEmptyRow()]);
    }
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div><p className="mt-2">Loading Master Spreadsheet...</p></div>;

  return (
    <div className="container-fluid p-0 position-relative">
      {/* Header Toolbar */}
      <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top shadow-sm" style={{ zIndex: 100 }}>
        <div>
          <h4 className="mb-0 fw-bold text-dark">
            <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>Lead Management System
          </h4>
          <div className="d-flex align-items-center mt-1">
            {isDirty ? (
              <span className="badge bg-warning text-dark me-2 animated pulse infinite"><i className="bi bi-exclamation-triangle-fill me-1"></i>Unsaved Changes</span>
            ) : (
              <span className="badge bg-success me-2"><i className="bi bi-check-all me-1"></i>All Synced</span>
            )}
            <span className="text-muted small">Excel-style interface with hierarchy</span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setShowColModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> New Column
          </button>
          <button className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm" onClick={saveAll} disabled={saving || (!isDirty && leads.length > 0)}>
            {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-cloud-check-fill me-2"></i>}
            {saving ? 'Saving...' : 'Sync Master Sheet'}
          </button>
        </div>
      </div>

      <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }} ref={scrollRef}>
        <table className="table table-bordered table-sm lead-sheet mb-0">
          <thead className="table-dark sticky-top" style={{ top: '-1px' }}>
            <tr>
              <th className="text-center" style={{ width: '40px' }}>#</th>
              <th className="col-client">Client / Lead Name</th>
              <th className="col-company">Organization</th>
              <th className="col-role">Project/Role</th>
              <th className="col-link">Link</th>
              <th className="col-date">Connect</th>
              <th className="col-followup">Followup</th>
              <th className="col-status">Status</th>
              <th className="col-meeting">Meeting</th>
              <th className="col-value">Value</th>
              {dynamicColumns.map(col => <th key={col.key} className="col-dynamic">{col.name}</th>)}
              <th className="col-notes">Notes</th>
              <th className="text-center" style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, lIndex) => (
              <React.Fragment key={lIndex}>
                <tr className={expandedLeadId === (lead.id || `new-${lIndex}`) ? 'table-active' : ''}>
                  <td className="text-center align-middle bg-light small fw-bold text-muted">{lIndex + 1}</td>
                  <td className="col-client">
                    <div className="d-flex align-items-center">
                      <button className="btn btn-link btn-sm p-0 me-2 text-primary shadow-none" onClick={() => toggleExpand(lead.id || `new-${lIndex}`)}>
                        <i className={`bi bi-${expandedLeadId === (lead.id || `new-${lIndex}`) ? 'dash-square-fill' : 'plus-square-fill'} fs-5`}></i>
                      </button>
                      <input 
                        type="text" 
                        className="form-control form-control-sm border-0 bg-transparent shadow-none fw-bold" 
                        value={lead.clientName || ''} 
                        onChange={(e) => handleInputChange(lIndex, 'clientName', e.target.value)}
                        placeholder="Lead Name..."
                      />
                    </div>
                  </td>
                  <td className="col-company">
                    <input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={lead.company || ''} onChange={(e) => handleInputChange(lIndex, 'company', e.target.value)} placeholder="..." />
                  </td>
                  <td className="col-role">
                    <input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={lead.roleProjectType || ''} onChange={(e) => handleInputChange(lIndex, 'roleProjectType', e.target.value)} />
                  </td>
                  <td className="col-link">
                    <input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none text-primary" value={lead.contactLink || ''} onChange={(e) => handleInputChange(lIndex, 'contactLink', e.target.value)} />
                  </td>
                  <td className="col-date">
                    <input type="date" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={lead.dateToConnect || ''} onChange={(e) => handleInputChange(lIndex, 'dateToConnect', e.target.value)} />
                  </td>
                  <td className="col-followup">
                    <input type="date" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={lead.followupDate || ''} onChange={(e) => handleInputChange(lIndex, 'followupDate', e.target.value)} />
                  </td>
                  <td className="col-status">
                    <select className="form-select form-select-sm border-0 bg-transparent shadow-none fw-bold" value={lead.status || 'New'} onChange={(e) => handleInputChange(lIndex, 'status', e.target.value)}>
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Meeting Scheduled">Meeting</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td className="col-meeting">
                    <input type="date" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={lead.meetingDate || ''} onChange={(e) => handleInputChange(lIndex, 'meetingDate', e.target.value)} />
                  </td>
                  <td className="col-value">
                    <input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none text-end fw-bold" value={lead.dealValue || ''} onChange={(e) => handleInputChange(lIndex, 'dealValue', e.target.value)} placeholder="0" />
                  </td>
                  {dynamicColumns.map(col => (
                    <td key={col.key} className="col-dynamic">
                      <input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={(lead.customFields && lead.customFields[col.key]) || ''} onChange={(e) => handleInputChange(lIndex, col.key, e.target.value, true)} />
                    </td>
                  ))}
                  <td className="col-notes">
                    <textarea className="form-control form-control-sm border-0 bg-transparent shadow-none" rows="1" value={lead.notes || ''} onChange={(e) => handleInputChange(lIndex, 'notes', e.target.value)} style={{resize:'none'}} />
                  </td>
                  <td className="text-center align-middle bg-light">
                    <button className="btn btn-link btn-sm text-danger p-0 shadow-none" onClick={() => removeLead(lIndex, lead.id)}><i className="bi bi-trash3"></i></button>
                  </td>
                </tr>

                {/* Sub-Excel Section */}
                {expandedLeadId === (lead.id || `new-${lIndex}`) && (
                  <tr>
                    <td colSpan={13 + dynamicColumns.length} className="p-0 bg-light">
                      <div className="p-4 border-start border-primary border-5 ms-5 my-2 shadow rounded bg-white interaction-container">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                           <h6 className="mb-0 fw-bold text-primary"><i className="bi bi-journal-text me-2"></i>History & Conversations: {lead.clientName || 'Unspecified Lead'}</h6>
                           <span className="small text-muted"><i className="bi bi-info-circle me-1"></i>Enter summary to add next interaction</span>
                        </div>
                        <div className="table-responsive rounded border">
                          <table className="table table-bordered table-sm mb-0 sub-sheet">
                            <thead className="table-secondary">
                              <tr>
                                <th style={{ width: '135px' }}>Date</th>
                                <th>Summary / Discussion Details</th>
                                <th style={{ width: '135px' }}>Follow-up</th>
                                <th style={{ width: '135px' }}>Status</th>
                                <th style={{ width: '110px' }}>Value</th>
                                <th style={{ width: '135px' }}>Meeting</th>
                                <th style={{ width: '40px' }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {lead.interactions.map((int, iIndex) => (
                                <tr key={iIndex}>
                                  <td><input type="date" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={int.date || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'date', e.target.value)} /></td>
                                  <td><input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none" placeholder="Add details..." value={int.summary || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'summary', e.target.value)} /></td>
                                  <td><input type="date" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={int.followupDate || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'followupDate', e.target.value)} /></td>
                                  <td>
                                    <select className="form-select form-select-sm border-0 bg-transparent shadow-none" value={int.status || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'status', e.target.value)}>
                                      <option value="Follow-up">Follow-up</option>
                                      <option value="Interested">Interested</option>
                                      <option value="Call Back">Call Back</option>
                                      <option value="Not Interested">Not Interested</option>
                                      <option value="Demo Done">Demo Done</option>
                                    </select>
                                  </td>
                                  <td><input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none text-end" value={int.dealValue || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'dealValue', e.target.value)} placeholder="0" /></td>
                                  <td><input type="date" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={int.meetingDate || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'meetingDate', e.target.value)} /></td>
                                  <td className="text-center align-middle">
                                    <button className="btn btn-link btn-sm text-danger p-0 shadow-none" onClick={() => deleteInteraction(lIndex, iIndex, int.id)}><i className="bi bi-x-circle"></i></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Column Modal */}
      {showColModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white py-2">
                <h6 className="modal-title fw-bold">Add Custom Column</h6>
                <button className="btn-close btn-close-white shadow-none" onClick={() => setShowColModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <label className="small fw-bold mb-1 text-muted">Column Header Name</label>
                <input type="text" className="form-control form-control-sm mb-3" value={newColName} onChange={(e) => setNewColName(e.target.value)} placeholder="e.g. LinkedIn ID" autoFocus />
                <button className="btn btn-primary btn-sm w-100 fw-bold" onClick={handleAddColumn}>Create Column</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .lead-sheet td, .lead-sheet th { border-color: #dee2e6 !important; padding: 0 !important; }
        .lead-sheet th { padding: 10px !important; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; }
        
        .col-client { background-color: #e7f1ff !important; min-width: 280px; }
        .col-company { background-color: #f8f9fa !important; min-width: 150px; }
        .col-role { background-color: #e9f7ef !important; min-width: 150px; }
        .col-link { background-color: #fff9e6 !important; min-width: 150px; }
        .col-date { background-color: #f4eefd !important; min-width: 135px; }
        .col-followup { background-color: #fff5eb !important; min-width: 135px; }
        .col-meeting { background-color: #e3f9fb !important; min-width: 135px; }
        .col-value { background-color: #fff0f3 !important; min-width: 110px; }
        .col-dynamic { background-color: #f0f4f8 !important; min-width: 150px; }
        .col-notes { background-color: #f0fff4 !important; min-width: 200px; }

        .lead-sheet input, .lead-sheet select, .lead-sheet textarea { 
          height: 40px; 
          font-size: 0.85rem; 
          border-radius: 0; 
        }
        
        .lead-sheet td:focus-within { 
          background-color: #fff !important;
          box-shadow: inset 0 0 0 2px #0d6efd; 
          z-index: 5; 
          position: relative; 
        }
        
        .sub-sheet th { font-size: 0.7rem; padding: 8px !important; background-color: #ececec; color: #555; }
        .sub-sheet td { background-color: #fff !important; }
        .sub-sheet input, .sub-sheet select { height: 34px !important; font-size: 0.8rem !important; }
        
        .interaction-container {
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animated { animation-duration: 2s; animation-fill-mode: both; }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .pulse { animation-name: pulse; }
        
        .lead-sheet tr:hover td { filter: brightness(0.98); }
      `}} />
    </div>
  );
};

export default Leads;
