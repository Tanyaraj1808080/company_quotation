import React from 'react';

const AccountingIntegration = () => {
  return (
    <div className="p-4">
      <h2 className="mb-4">Accounting Software Integration</h2>

      <p className="mb-4 text-muted">
        Connect your Mindmanthan account with popular accounting software to streamline your financial workflows and data synchronization.
      </p>

      <div className="row">
        {/* QuickBooks Integration Card */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <span className="fw-bold">QuickBooks</span>
              <span className="badge bg-success"><i className="bi bi-check-circle-fill me-1"></i> Connected</span>
            </div>
            <div className="card-body">
              <p className="card-text text-muted">Integrate with QuickBooks to automatically sync invoices, payments, and client data.</p>
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button className="btn btn-outline-danger btn-sm"><i className="bi bi-link-45deg me-1"></i> Disconnect</button>
                <button className="btn btn-primary btn-sm"><i className="bi bi-arrow-clockwise me-1"></i> Sync Data Now</button>
              </div>
            </div>
            <div className="card-footer bg-light text-muted small border-0 py-2">
              Last synced: 2024-02-15 10:30 AM
            </div>
          </div>
        </div>

        {/* Xero Integration Card */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <span className="fw-bold">Xero</span>
              <span className="badge bg-secondary"><i className="bi bi-x-circle-fill me-1"></i> Disconnected</span>
            </div>
            <div className="card-body">
              <p className="card-text text-muted">Connect to Xero for seamless financial management and reconciliation.</p>
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button className="btn btn-success btn-sm"><i className="bi bi-plug me-1"></i> Connect Now</button>
                <button className="btn btn-outline-secondary btn-sm" disabled><i className="bi bi-arrow-clockwise me-1"></i> Sync Data Now</button>
              </div>
            </div>
            <div className="card-footer bg-light text-muted small border-0 py-2">
              Not connected
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Recent Synchronization Activity</h5>
        </div>
        <div className="card-body p-0">
          <div className="list-group list-group-flush">
            <div className="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <i className="bi bi-check2-circle text-success me-2"></i>
                QuickBooks: Manual sync initiated.
              </div>
              <small className="text-muted">2024-02-15 10:30 AM</small>
            </div>
            <div className="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <i className="bi bi-arrow-repeat text-primary me-2"></i>
                QuickBooks: Automatic sync completed (Invoices & Payments).
              </div>
              <small className="text-muted">2024-02-15 03:00 AM</small>
            </div>
            <div className="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                Xero: Connection attempt failed.
              </div>
              <small className="text-muted">2024-02-14 05:00 PM</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingIntegration;
