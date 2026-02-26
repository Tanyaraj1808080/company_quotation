import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showColModal, setShowColModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [todayAgenda, setTodayAgenda] = useState([]);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'master'
  const [filterRange, setFilterRange] = useState('0'); // '0' (today), '7', '15', '30', 'custom'
  const [customFilterDate, setCustomFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
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

  // Update agenda whenever leads change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const agendaMap = {};
    
    leads.forEach(lead => {
      if (!lead.clientName) return;
      const leadName = lead.clientName;
      
      const addEntry = (type, info) => {
        if (!agendaMap[leadName]) {
          agendaMap[leadName] = { client: leadName, company: lead.company, tasks: [] };
        }
        // Prevent duplicate tasks for the same client
        if (!agendaMap[leadName].tasks.some(t => t.type === type && t.info === info)) {
          agendaMap[leadName].tasks.push({ type, info });
        }
      };

      if (lead.meetingDate === today) addEntry('Meeting', 'Main Schedule');
      if (lead.followupDate === today) addEntry('Follow-up', 'Main Schedule');
      
      if (lead.interactions) {
        lead.interactions.forEach(int => {
          if (int.meetingDate === today) addEntry('Meeting', int.summary || 'Interaction Meeting');
          if (int.followupDate === today) addEntry('Follow-up', int.summary || 'Interaction Follow-up');
        });
      }
    });
    
    setTodayAgenda(Object.values(agendaMap));
  }, [leads]);

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
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePrintReport = (lead) => {
    const printWindow = window.open('', '_blank');
    
    // Find the latest interaction that has a value update
    const interactionsWithValues = (lead.interactions || [])
      .filter(i => i.dealValue && i.dealValue !== '0' && i.dealValue !== '');
    
    const latestValueUpdate = interactionsWithValues.length > 0 
      ? interactionsWithValues[interactionsWithValues.length - 1].dealValue 
      : lead.dealValue;

    const interactionsHtml = lead.interactions
      .filter(i => i.summary || i.status !== 'Follow-up')
      .map((i, idx, arr) => {
        const isLatest = idx === arr.length - 2; // Second to last is usually the latest real entry
        return `
        <tr class="${isLatest && i.dealValue ? 'highlight-row' : ''}">
          <td>${i.date || '-'}</td>
          <td>${i.summary || '-'}</td>
          <td>${i.followupDate || '-'}</td>
          <td><span class="status-badge">${i.status}</span></td>
          <td align="right" style="${isLatest && i.dealValue ? 'font-weight:bold; color:#d63384;' : ''}">
            ₹${i.dealValue || '0'}
            ${isLatest && i.dealValue ? '<br><small style="font-size:9px; color:#d63384;">(RECENT UPDATE)</small>' : ''}
          </td>
          <td>${i.meetingDate || '-'}</td>
        </tr>
      `}).join('');

    const customFieldsHtml = dynamicColumns.map(col => `
      <div class="info-item">
        <label>${col.name}:</label>
        <span>${(lead.customFields && lead.customFields[col.key]) || '-'}</span>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Lead Report - ${lead.clientName || 'Unnamed'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 3px solid #0d6efd; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { margin: 0; color: #0d6efd; font-size: 28px; }
            .header p { margin: 5px 0 0 0; color: #666; font-weight: bold; }
            
            .section-title { background: #f8f9fa; padding: 10px 15px; border-left: 5px solid #0d6efd; margin: 30px 0 15px 0; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-item { border-bottom: 1px solid #eee; padding: 8px 0; display: flex; justify-content: space-between; }
            .info-item label { font-weight: bold; color: #555; }
            .info-item span { color: #000; }
            
            .highlight-value { color: #d63384; font-weight: bold; font-size: 18px; animation: flash 1.5s infinite; }
            @keyframes flash { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th { background: #0d6efd; color: white; text-align: left; padding: 12px 10px; text-transform: uppercase; }
            td { border: 1px solid #dee2e6; padding: 10px; }
            tr:nth-child(even) { background: #f9f9f9; }
            .highlight-row { background-color: #fff0f3 !important; }
            
            .status-badge { background: #e7f1ff; color: #0d6efd; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #0d6efd; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
              Download / Print Report
            </button>
          </div>
          
          <div class="header">
            <div>
              <h1>LEAD PERFORMANCE REPORT</h1>
              <p>Client: ${lead.clientName || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold; color: #0d6efd;">MIND MANTHAN</div>
              <div style="font-size: 12px;">Generated on: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="section-title">Lead Overview</div>
          <div class="info-grid">
            <div class="info-item"><label>Company:</label> <span>${lead.company || '-'}</span></div>
            <div class="info-item"><label>Role / Project:</label> <span>${lead.roleProjectType || '-'}</span></div>
            <div class="info-item"><label>Current Status:</label> <span>${lead.status || '-'}</span></div>
            <div class="info-item">
              <label>Latest Updated Value:</label> 
              <span class="highlight-value">₹${latestValueUpdate || lead.dealValue || '0'}</span>
            </div>
            <div class="info-item"><label>Initial Deal Value:</label> <span>₹${lead.dealValue || '0'}</span></div>
            <div class="info-item"><label>Last Connect:</label> <span>${lead.dateToConnect || '-'}</span></div>
          </div>

          ${customFieldsHtml ? `
            <div class="section-title">Additional Information</div>
            <div class="info-grid">${customFieldsHtml}</div>
          ` : ''}

          <div class="section-title">Interaction History & Timeline</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Discussion Details</th>
                <th>Follow-up</th>
                <th>Status</th>
                <th>Value</th>
                <th>Meeting</th>
              </tr>
            </thead>
            <tbody>
              ${interactionsHtml || '<tr><td colspan="6" style="text-align: center;">No interaction history recorded.</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">Lead Notes</div>
          <div style="padding: 15px; background: #fffde7; border: 1px dashed #ffd600; min-height: 60px; border-radius: 4px;">
            ${lead.notes || 'No additional notes provided.'}
          </div>

          <div class="footer">
            © ${new Date().getFullYear()} Quotation Management System | Internal Lead Report
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportToExcel = () => {
    // Filter only rows that have data
    const leadsToExport = leads.filter(l => l.clientName || l.company);
    if (leadsToExport.length === 0) {
      alert('No data to export.');
      return;
    }

    // Define column headers
    const headers = [
      '#', 'Lead Name', 'Organization', 'Project/Role', 'Link', 
      'Connect Date', 'Followup Date', 'Status', 'Meeting Date', 'Value', 'Notes'
    ];
    dynamicColumns.forEach(col => headers.push(col.name));
    headers.push('Latest Interaction Summary', 'Total Interactions');

    // Convert data to a Tab-Separated format (best for Excel)
    const rows = leadsToExport.map((l, index) => {
      const interactions = l.interactions.filter(i => !i.isNewInteraction);
      const lastInt = interactions.length > 0 
        ? interactions[interactions.length - 1].summary.replace(/\n/g, ' ') 
        : 'No history';
      
      const row = [
        index + 1,
        l.clientName || '',
        l.company || '',
        l.roleProjectType || '',
        l.contactLink || '',
        l.dateToConnect || '',
        l.followupDate || '',
        l.status || '',
        l.meetingDate || '',
        l.dealValue || '0',
        (l.notes || '').replace(/\n/g, ' ')
      ];

      dynamicColumns.forEach(col => {
        row.push((l.customFields && l.customFields[col.key]) || '');
      });

      row.push(lastInt);
      row.push(interactions.length);

      return row.join('\t'); // Tab separation prevents column break issues
    });

    // Create a Blob with UTF-8 BOM so Excel recognizes it correctly
    const excelContent = [headers.join('\t'), ...rows].join('\n');
    const BOM = '\uFEFF'; 
    const blob = new Blob([BOM + excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `Master_Leads_Report_${new Date().toISOString().split('T')[0]}.xls`; // Saving as .xls for better Excel compatibility
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const isDateInRange = (dateStr) => {
    if (!dateStr) return false;
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (filterRange === 'custom') {
      return dateStr === customFilterDate;
    }

    const rangeDays = parseInt(filterRange);
    const diffTime = today - targetDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (rangeDays === 0) {
      return dateStr === today.toISOString().split('T')[0];
    }
    
    // Show leads from last X days up to today
    return diffDays >= 0 && diffDays <= rangeDays;
  };

  const getDisplayedLeads = () => {
    if (viewMode === 'master') return leads;
    
    return leads.filter(lead => {
      const hasDateInRange = isDateInRange(lead.meetingDate) || isDateInRange(lead.followupDate);
      const hasInteractionInRange = lead.interactions?.some(int => isDateInRange(int.meetingDate) || isDateInRange(int.followupDate));
      return hasDateInRange || hasInteractionInRange;
    });
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
            <div className="btn-group btn-group-sm me-3 border rounded-pill overflow-hidden">
              <button 
                className={`btn px-3 ${viewMode === 'today' ? 'btn-primary' : 'btn-light'}`} 
                onClick={() => setViewMode('today')}
              >
                <i className="bi bi-calendar-event me-1"></i> Today's Focus
              </button>
              <button 
                className={`btn px-3 ${viewMode === 'master' ? 'btn-primary' : 'btn-light'}`} 
                onClick={() => setViewMode('master')}
              >
                <i className="bi bi-database-fill me-1"></i> Master Sheet
              </button>
            </div>

            {viewMode === 'today' && (
              <div className="d-flex align-items-center gap-2 me-3">
                <select 
                  className="form-select form-select-sm border-primary rounded-pill px-3 fw-bold shadow-sm" 
                  value={filterRange} 
                  onChange={(e) => setFilterRange(e.target.value)}
                  style={{ width: 'auto', minWidth: '130px' }}
                >
                  <option value="0">Today Only</option>
                  <option value="7">Last 7 Days</option>
                  <option value="15">Last 15 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="custom">Specific Date</option>
                </select>

                {filterRange === 'custom' && (
                  <input 
                    type="date" 
                    className="form-control form-control-sm border-primary rounded-pill px-3 shadow-sm" 
                    value={customFilterDate} 
                    onChange={(e) => setCustomFilterDate(e.target.value)} 
                    style={{ width: 'auto' }}
                  />
                )}
              </div>
            )}

            {isDirty ? (
              <span className="badge bg-warning text-dark me-2 animated pulse infinite"><i className="bi bi-exclamation-triangle-fill me-1"></i>Unsaved Changes</span>
            ) : (
              <span className="badge bg-success me-2"><i className="bi bi-check-all me-1"></i>All Synced</span>
            )}
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className={`btn btn-sm rounded-pill px-3 shadow-sm ${todayAgenda.length > 0 ? 'btn-danger flash-urgent' : 'btn-outline-secondary'}`} onClick={() => setShowAgendaModal(true)}>
            <i className={`bi bi-alarm-fill me-1 ${todayAgenda.length > 0 ? 'text-white' : ''}`}></i> 
            Meeting Alerts {todayAgenda.length > 0 && <span className="badge bg-white text-danger ms-1">{todayAgenda.length}</span>}
          </button>
          <button className="btn btn-outline-success btn-sm rounded-pill px-3" onClick={exportToExcel}>
            <i className="bi bi-file-earmark-excel-fill me-1"></i> Export Excel
          </button>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setShowColModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> New Column
          </button>
          <button className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm" onClick={saveAll} disabled={saving || (!isDirty && leads.length > 0)}>
            {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-cloud-check-fill me-2"></i>}
            {saving ? 'Saving...' : 'Sync Master Sheet'}
          </button>
        </div>
      </div>

      {/* Agenda Modal */}
      {showAgendaModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white py-3">
                <h5 className="modal-title fw-bold"><i className="bi bi-calendar-check-fill me-2"></i>Today's Scheduled Agenda</h5>
                <button className="btn-close btn-close-white shadow-none" onClick={() => setShowAgendaModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                {todayAgenda.length === 0 ? (
                  <div className="p-5 text-center text-muted">
                    <i className="bi bi-calendar-x fs-1 opacity-25"></i>
                    <p className="mt-2 fw-bold">No meetings or follow-ups scheduled for today.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '250px' }}>Client / Lead Name</th>
                          <th>Scheduled Tasks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayAgenda.map((item, idx) => (
                          <tr key={idx}>
                            <td className="align-middle">
                              <div className="fw-bold text-dark">{item.client}</div>
                              <div className="small text-muted">{item.company || 'No Company'}</div>
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-2">
                                {item.tasks.map((task, tIdx) => (
                                  <div key={tIdx} className="d-flex align-items-center bg-light p-2 rounded border-start border-3 border-danger">
                                    <span className={`badge ${task.type === 'Meeting' ? 'bg-primary' : 'bg-warning text-dark'} me-2`} style={{minWidth: '80px'}}>
                                      {task.type}
                                    </span>
                                    <span className="small text-dark fw-medium">{task.info}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary btn-sm px-4" onClick={() => setShowAgendaModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }} ref={scrollRef}>
        <table className="table table-bordered table-sm lead-sheet mb-0">
          <thead className="bg-light sticky-top" style={{ top: '-1px' }}>
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
            {getDisplayedLeads().map((lead, lIndex) => {
              const rowId = lead.id || `new-${lIndex}`;
              const isExpanded = expandedRows[rowId];
              return (
                <React.Fragment key={lIndex}>
                  <tr className={isExpanded ? 'table-active' : ''}>
                    <td className="text-center align-middle bg-light small fw-bold text-muted">{lIndex + 1}</td>
                    <td className="col-client">
                      <div className="d-flex align-items-center">
                        <button className="btn btn-link btn-sm p-0 me-2 text-primary shadow-none" onClick={() => toggleExpand(rowId)}>
                          <i className={`bi bi-${isExpanded ? 'dash-square-fill' : 'plus-square-fill'} fs-5`}></i>
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
                      <input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={lead.contactLink || ''} onChange={(e) => handleInputChange(lIndex, 'contactLink', e.target.value)} />
                    </td>
                    <td className="col-date">
                      <input type="date" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={lead.dateToConnect || ''} onChange={(e) => handleInputChange(lIndex, 'dateToConnect', e.target.value)} />
                    </td>
                    <td className="col-followup">
                      <input type="date" className={`form-control form-control-sm border-0 bg-transparent shadow-none ${isDateInRange(lead.followupDate) ? 'today-highlight fw-bold' : ''}`} value={lead.followupDate || ''} onChange={(e) => handleInputChange(lIndex, 'followupDate', e.target.value)} />
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
                      <input type="date" className={`form-control form-control-sm border-0 bg-transparent shadow-none ${isDateInRange(lead.meetingDate) ? 'today-highlight fw-bold' : ''}`} value={lead.meetingDate || ''} onChange={(e) => handleInputChange(lIndex, 'meetingDate', e.target.value)} />
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
                      <div className="d-flex gap-1 justify-content-center">
                        <button className="btn btn-link btn-sm text-primary p-0 shadow-none" title="Print Report" onClick={() => handlePrintReport(lead)}>
                          <i className="bi bi-file-earmark-pdf-fill fs-5"></i>
                        </button>
                        <button className="btn btn-link btn-sm text-danger p-0 shadow-none" title="Delete Lead" onClick={() => removeLead(lIndex, lead.id)}>
                          <i className="bi bi-trash3 fs-5"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Sub-Excel Section */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={13 + dynamicColumns.length} className="p-0 bg-light">
                        <div className="p-3 border-start border-primary border-5 ms-5 my-2 shadow-sm rounded bg-white interaction-container">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                             <h6 className="mb-0 fw-bold text-dark"><i className="bi bi-layers-half me-2 text-primary"></i>Detailed Log: {lead.clientName || 'Unspecified Lead'}</h6>
                             <span className="badge bg-light text-dark border">Sub-Excel Interface</span>
                          </div>
                          <div className="table-responsive rounded border">
                            <table className="table table-bordered table-sm mb-0 sub-sheet">
                              <thead>
                                <tr>
                                  <th className="sub-col-date" style={{ width: '140px' }}>Date</th>
                                  <th className="sub-col-summary">Discussion Details / Summary</th>
                                  <th className="sub-col-followup" style={{ width: '140px' }}>Follow-up</th>
                                  <th className="sub-col-status" style={{ width: '140px' }}>Status</th>
                                  <th className="sub-col-value" style={{ width: '120px' }}>Value</th>
                                  <th className="sub-col-meeting" style={{ width: '140px' }}>Meeting</th>
                                  <th style={{ width: '40px' }} className="bg-light"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {lead.interactions.map((int, iIndex) => (
                                  <tr key={iIndex}>
                                  <td className="sub-col-date"><input type="date" className="form-control form-control-sm border-0 bg-transparent shadow-none" value={int.date || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'date', e.target.value)} /></td>
                                  <td className="sub-col-summary"><input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none" placeholder="Enter notes..." value={int.summary || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'summary', e.target.value)} /></td>
                                  <td className="sub-col-followup"><input type="date" className={`form-control form-control-sm border-0 bg-transparent shadow-none ${isDateInRange(int.followupDate) ? 'today-highlight fw-bold' : ''}`} value={int.followupDate || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'followupDate', e.target.value)} /></td>
                                  <td className="sub-col-status">
                                    <select className="form-select form-select-sm border-0 bg-transparent shadow-none fw-bold" value={int.status || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'status', e.target.value)}>
                                      <option value="Follow-up">Follow-up</option>
                                      <option value="Interested">Interested</option>
                                      <option value="Call Back">Call Back</option>
                                      <option value="Not Interested">Not Interested</option>
                                      <option value="Demo Done">Demo Done</option>
                                    </select>
                                  </td>
                                  <td className="sub-col-value"><input type="text" className="form-control form-control-sm border-0 bg-transparent shadow-none text-end fw-bold" value={int.dealValue || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'dealValue', e.target.value)} placeholder="0" /></td>
                                  <td className="sub-col-meeting"><input type="date" className={`form-control form-control-sm border-0 bg-transparent shadow-none ${isDateInRange(int.meetingDate) ? 'today-highlight fw-bold' : ''}`} value={int.meetingDate || ''} onChange={(e) => handleInteractionChange(lIndex, iIndex, 'meetingDate', e.target.value)} /></td>
                                    <td className="text-center align-middle bg-light">
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
              );
            })}
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
        .lead-sheet th { 
          padding: 10px !important; 
          font-size: 0.75rem; 
          text-transform: uppercase; 
          letter-spacing: 0.8px; 
          font-weight: 700; 
          color: #000 !important;
          background-color: #f8f9fa !important;
        }
        
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
          color: #000 !important;
        }
        
        .lead-sheet td:focus-within { 
          background-color: #fff !important;
          box-shadow: inset 0 0 0 2px #0d6efd; 
          z-index: 5; 
          position: relative; 
        }
        
        .sub-sheet th { 
          font-size: 0.7rem; 
          padding: 8px !important; 
          color: #000 !important;
          border: 1px solid #dee2e6 !important;
          text-transform: uppercase;
          font-weight: 700;
        }
        .sub-sheet td { background-color: #fff !important; }
        .sub-sheet input, .sub-sheet select { height: 34px !important; font-size: 0.8rem !important; color: #000 !important; }
        
        .sub-col-date { background-color: #f4eefd !important; }
        .sub-col-summary { background-color: #f8f9fa !important; }
        .sub-col-followup { background-color: #fff5eb !important; }
        .sub-col-status { background-color: #e7f1ff !important; }
        .sub-col-value { background-color: #fff0f3 !important; }
        .sub-col-meeting { background-color: #e3f9fb !important; }
        
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

        .flash-urgent {
          animation: flash-red 1s infinite;
        }
        @keyframes flash-red {
          0% { background-color: #dc3545; box-shadow: 0 0 0px rgba(220,53,69,0); }
          50% { background-color: #ff0000; box-shadow: 0 0 10px rgba(220,53,69,0.7); }
          100% { background-color: #dc3545; box-shadow: 0 0 0px rgba(220,53,69,0); }
        }

        .agenda-ticker {
          height: 45px;
          display: flex;
          align-items: center;
          background-color: #fff5f5 !important;
          border-bottom: 2px solid #ffcfcf !important;
        }

        .ticker-container {
          animation: ticker-move 30s linear infinite;
          white-space: nowrap;
        }
        @keyframes ticker-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .today-highlight {
          background-color: #fff0f3 !important;
          border: 2px solid #dc3545 !important;
          animation: soft-flash 2s infinite;
        }
        @keyframes soft-flash {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default Leads;
