import React from 'react';

const AuditLogs = () => {
  return (
    <div className="p-4">
      <h2 className="mb-4">System Audit Logs</h2>

      <div className="card mb-4">
        <div className="card-header">Filters</div>
        <div className="card-body">
          <form className="row g-3 align-items-center">
            <div className="col-md-3">
              <label htmlFor="eventType" className="form-label visually-hidden">Event Type</label>
              <select id="eventType" className="form-select" defaultValue="All Event Types">
                <option>All Event Types</option>
                <option>Login</option>
                <option>Logout</option>
                <option>User Created</option>
                <option>Setting Changed</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="user" className="form-label visually-hidden">User</label>
              <input type="text" className="form-control" id="user" placeholder="Filter by User" />
            </div>
            <div className="col-md-3">
              <label htmlFor="dateRange" className="form-label visually-hidden">Date Range</label>
              <input type="text" className="form-control" id="dateRange" placeholder="Date Range" />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Apply Filters</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Recent Activities</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Event Type</th>
                  <th>Description</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2024-02-15 10:30:00</td>
                  <td>admin@example.com</td>
                  <td>Login Success</td>
                  <td>User logged in successfully.</td>
                  <td>192.168.1.100</td>
                </tr>
                <tr>
                  <td>2024-02-15 10:25:00</td>
                  <td>john.doe@example.com</td>
                  <td>Setting Changed</td>
                  <td>Updated profile picture.</td>
                  <td>192.168.1.101</td>
                </tr>
                <tr>
                  <td>2024-02-15 09:00:00</td>
                  <td>system</td>
                  <td>Report Generated</td>
                  <td>Monthly Quotation Report.</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
