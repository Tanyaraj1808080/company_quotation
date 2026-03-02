import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Mock data for demonstration since backend endpoint might not exist yet
  const mockLogs = [
    { id: 1, timestamp: '2024-03-02 10:30:45', user: { name: 'Admin User', email: 'admin@example.com' }, eventType: 'LOGIN', description: 'User logged in successfully from Chrome/Windows', ip: '192.168.1.105' },
    { id: 2, timestamp: '2024-03-02 09:15:20', user: { name: 'Sarah Connor', email: 'sarah.c@mindmanthan.com' }, eventType: 'CREATE', description: 'Created new quotation Q-2024-001 for Client: Tesla Inc.', ip: '10.0.0.45' },
    { id: 3, timestamp: '2024-03-01 16:45:10', user: { name: 'John Doe', email: 'john.doe@example.com' }, eventType: 'UPDATE', description: 'Updated company branding: Primary color changed to #0d6efd', ip: '172.16.0.12' },
    { id: 4, timestamp: '2024-03-01 14:20:00', user: { name: 'System', email: 'system@auto.internal' }, eventType: 'SYSTEM', description: 'Automated backup completed successfully', ip: '127.0.0.1' },
    { id: 5, timestamp: '2024-02-28 11:10:05', user: { name: 'Admin User', email: 'admin@example.com' }, eventType: 'DELETE', description: 'Deleted lead: Old Prospect #455', ip: '192.168.1.105' },
    { id: 6, timestamp: '2024-02-25 08:00:00', user: { name: 'Finance Bot', email: 'billing@mindmanthan.com' }, eventType: 'FINANCE', description: 'Generated monthly revenue forecast report', ip: '-' },
  ];

  useEffect(() => {
    fetchLogs();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 10000); // Refresh every 10s
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Attempt to fetch from real endpoint, fallback to mock
      const res = await axios.get('/api/audit-logs').catch(() => ({ data: mockLogs }));
      setLogs(res.data || mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const setQuickDate = (days) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ start, end });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setEventTypeFilter('All');
    setUserFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Event', 'Description', 'IP Address'];
    
    // Helper to escape values for CSV (wraps in quotes, handles existing quotes)
    const escapeCSV = (val) => {
      const stringVal = val === null || val === undefined ? "" : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    };

    const rows = filteredLogs.map(log => [
      escapeCSV(log.timestamp),
      escapeCSV(`${log.user.name} (${log.user.email})`),
      escapeCSV(log.eventType),
      escapeCSV(log.description),
      escapeCSV(log.ip)
    ]);
    
    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.map(escapeCSV).join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getEventBadgeClass = (type) => {
    switch (type) {
      case 'LOGIN': return 'bg-info-subtle text-info border-info-subtle';
      case 'CREATE': return 'bg-success-subtle text-success border-success-subtle';
      case 'UPDATE': return 'bg-warning-subtle text-warning border-warning-subtle';
      case 'DELETE': return 'bg-danger-subtle text-danger border-danger-subtle';
      case 'FINANCE': return 'bg-primary-subtle text-primary border-primary-subtle';
      default: return 'bg-secondary-subtle text-secondary border-secondary-subtle';
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.ip.includes(searchQuery);
      const matchesType = eventTypeFilter === 'All' || log.eventType === eventTypeFilter;
      const matchesUser = !userFilter || log.user.email.toLowerCase().includes(userFilter.toLowerCase());
      const logDate = log.timestamp.split(' ')[0];
      const matchesDate = (!dateRange.start || logDate >= dateRange.start) && 
                         (!dateRange.end || logDate <= dateRange.end);
      
      return matchesSearch && matchesType && matchesUser && matchesDate;
    });
  }, [logs, searchQuery, eventTypeFilter, userFilter, dateRange]);

  const paginatedLogs = useMemo(() => {
    const indexOfLast = currentPage * logsPerPage;
    const indexOfFirst = indexOfLast - logsPerPage;
    return filteredLogs.slice(indexOfFirst, indexOfLast);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="p-4 bg-light min-vh-100 animate-fade-in">
      <div className="container-xl">
        {/* Header Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1">System Audit Logs</h2>
            <p className="text-muted small mb-0">Monitor all system activities and security events</p>
          </div>
          <div className="d-flex gap-2">
            <div className="form-check form-switch bg-white px-3 py-2 rounded-pill border shadow-sm d-flex align-items-center gap-2">
              <input className="form-check-input ms-0" type="checkbox" checked={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} id="refreshSwitch" />
              <label className="form-check-label small fw-bold text-muted mb-0 cursor-pointer" htmlFor="refreshSwitch">Auto Refresh</label>
            </div>
            <button className="btn btn-white border shadow-sm rounded-pill px-3 d-flex align-items-center gap-2" onClick={exportToCSV} disabled={filteredLogs.length === 0}>
              <i className="bi bi-download text-primary"></i>
              <span className="small fw-bold">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-lg-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Search Logs</label>
                <div className="input-group border rounded-3 overflow-hidden bg-light bg-opacity-50">
                  <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
                  <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Description, user or IP..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="col-md-4 col-lg-2">
                <label className="form-label small fw-bold text-muted text-uppercase">Event Type</label>
                <select className="form-select border-light-subtle rounded-3 shadow-none bg-light bg-opacity-50" value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="LOGIN">Login</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="SYSTEM">System</option>
                  <option value="FINANCE">Finance</option>
                </select>
              </div>
              <div className="col-md-4 col-lg-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Start Date</label>
                <input type="date" className="form-control border-light-subtle rounded-3 shadow-none bg-light bg-opacity-50" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
              </div>
              <div className="col-md-4 col-lg-3">
                <label className="form-label small fw-bold text-muted text-uppercase">End Date</label>
                <input type="date" className="form-control border-light-subtle rounded-3 shadow-none bg-light bg-opacity-50" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between mt-4 pt-3 border-top gap-3">
              <div className="d-flex gap-2 align-items-center">
                <span className="small fw-bold text-muted text-uppercase me-2">Quick:</span>
                <button className="btn btn-xs btn-outline-primary rounded-pill px-3 py-1" onClick={() => setQuickDate(0)}>Today</button>
                <button className="btn btn-xs btn-outline-primary rounded-pill px-3 py-1" onClick={() => setQuickDate(7)}>Last 7 Days</button>
                <button className="btn btn-xs btn-outline-primary rounded-pill px-3 py-1" onClick={() => setQuickDate(30)}>Last 30 Days</button>
              </div>
              <button className="btn btn-link text-danger text-decoration-none small fw-bold p-0" onClick={clearFilters}>
                <i className="bi bi-x-circle me-1"></i> Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th className="ps-4 py-3 border-0 small fw-bold text-uppercase text-muted" style={{ width: '180px' }}>Timestamp</th>
                    <th className="py-3 border-0 small fw-bold text-uppercase text-muted">User</th>
                    <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Event</th>
                    <th className="py-3 border-0 small fw-bold text-uppercase text-muted">Description</th>
                    <th className="py-3 border-0 small fw-bold text-uppercase text-muted">IP Address</th>
                    <th className="pe-4 py-3 border-0 text-end small fw-bold text-uppercase text-muted">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary me-2"></div><span className="text-muted small">Loading logs...</span></td></tr>
                  ) : paginatedLogs.length > 0 ? (
                    paginatedLogs.map(log => (
                      <tr key={log.id} className="transition-all">
                        <td className="ps-4"><span className="text-dark small fw-medium">{log.timestamp}</span></td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                              {log.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-dark x-small">{log.user.name}</div>
                              <div className="text-muted x-small opacity-75">{log.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge border rounded-pill px-3 py-1 fw-bold x-small ${getEventBadgeClass(log.eventType)}`}>
                            {log.eventType}
                          </span>
                        </td>
                        <td><div className="text-muted x-small text-truncate" style={{ maxWidth: '300px' }}>{log.description}</div></td>
                        <td><span className="badge bg-light text-dark fw-normal border x-small">{log.ip}</span></td>
                        <td className="text-end pe-4">
                          <button className="btn btn-icon btn-light btn-sm rounded-circle shadow-sm hover-primary" onClick={() => { setSelectedLog(log); setShowModal(true); }}>
                            <i className="bi bi-eye text-primary"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="text-center py-5 text-muted"><i className="bi bi-inbox display-6 d-block mb-2 opacity-25"></i>No logs found matching your criteria</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
              <span className="small text-muted">Showing <b>{paginatedLogs.length}</b> of <b>{filteredLogs.length}</b> entries</span>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link rounded-start-3 shadow-none border-light-subtle" onClick={() => setCurrentPage(currentPage - 1)}><i className="bi bi-chevron-left"></i></button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link shadow-none border-light-subtle" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link rounded-end-3 shadow-none border-light-subtle" onClick={() => setCurrentPage(currentPage + 1)}><i className="bi bi-chevron-right"></i></button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedLog && (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-journal-text text-primary"></i> Log Entry Details
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="mb-4 d-flex justify-content-center">
                   <span className={`badge border rounded-pill px-4 py-2 fs-6 fw-bold ${getEventBadgeClass(selectedLog.eventType)}`}>
                      {selectedLog.eventType}
                   </span>
                </div>
                <div className="bg-light rounded-4 p-4 border border-light-subtle">
                   <div className="row g-3">
                      <div className="col-4 small fw-bold text-muted text-uppercase">Timestamp:</div>
                      <div className="col-8 small text-dark">{selectedLog.timestamp}</div>
                      
                      <div className="col-4 small fw-bold text-muted text-uppercase">Performed By:</div>
                      <div className="col-8 small text-dark">{selectedLog.user.name} ({selectedLog.user.email})</div>
                      
                      <div className="col-4 small fw-bold text-muted text-uppercase">IP Address:</div>
                      <div className="col-8 small text-dark">{selectedLog.ip}</div>
                      
                      <div className="col-12 mt-3 pt-3 border-top">
                         <div className="small fw-bold text-muted text-uppercase mb-2">Activity Description:</div>
                         <p className="small text-dark mb-0 lh-base bg-white p-3 rounded-3 border">{selectedLog.description}</p>
                      </div>
                   </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 px-4 pb-4 gap-2">
                <button className="btn btn-light rounded-pill px-4" onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2)); alert('Log copied to clipboard!'); }}>
                  <i className="bi bi-copy me-2"></i>Copy JSON
                </button>
                <button type="button" className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => setShowModal(false)}>Close</button>
              </div>
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
        .btn-xs { padding: 0.25rem 0.75rem; font-size: 0.7rem; font-weight: bold; text-uppercase: true; }
        .hover-primary:hover { background-color: #0d6efd !important; color: white !important; }
        .hover-primary:hover i { color: white !important; }
        .page-link { color: #6c757d; }
        .page-item.active .page-link { background-color: #0d6efd; border-color: #0d6efd; color: white; }
      `}} />
    </div>
  );
};

export default AuditLogs;
