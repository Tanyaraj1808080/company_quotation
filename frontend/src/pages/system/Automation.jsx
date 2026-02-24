import React from 'react';

const Automation = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Automated Follow-ups & Reminders</h2>
        <button className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i> Create New Rule</button>
      </div>

      <p className="mb-4 text-muted">
        Configure rules to automatically send reminders for pending quotations, overdue invoices, or upcoming follow-up tasks.
      </p>

      <div className="card mb-4">
        <div className="card-header">
          Active Automation Rules
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Trigger Event</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pending Quotation Reminder</td>
                  <td>Quotation Status = Pending (3 days after creation)</td>
                  <td>Email Client & Assignee</td>
                  <td><span className="badge bg-success">Active</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1"><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>Overdue Invoice Notification</td>
                  <td>Invoice Status = Overdue (1 day after due date)</td>
                  <td>Email Client & Finance Dept.</td>
                  <td><span className="badge bg-success">Active</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1"><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>New Lead Welcome Email</td>
                  <td>New Lead Assigned</td>
                  <td>Send Welcome Email to Lead</td>
                  <td><span className="badge bg-warning">Draft</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1"><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automation;
