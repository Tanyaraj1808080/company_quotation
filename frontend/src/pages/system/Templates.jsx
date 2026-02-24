import React, { useState } from 'react';

const Templates = () => {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Standard Service Quotation', type: 'Quotation', lastModified: '2026-02-10', status: 'Active' },
    { id: 2, name: 'Product Sales Invoice', type: 'Invoice', lastModified: '2026-02-12', status: 'Active' },
    { id: 3, name: 'Professional Services Agreement', type: 'Contract', lastModified: '2026-01-25', status: 'Draft' },
    { id: 4, name: 'Monthly Performance Report', type: 'Report', lastModified: '2026-02-01', status: 'Active' },
  ]);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-dark">Document Templates</h2>
        <button className="btn btn-primary shadow-sm px-4">
          <i className="bi bi-plus-lg me-2"></i>Create New Template
        </button>
      </div>

      <div className="row g-4 mb-4">
        {['Quotation', 'Invoice', 'Report'].map(type => (
          <div className="col-md-4" key={type}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center py-4">
                <div className={`fs-1 mb-2 ${type === 'Quotation' ? 'text-primary' : type === 'Invoice' ? 'text-success' : 'text-info'}`}>
                  <i className={`bi ${type === 'Quotation' ? 'bi-file-earmark-text' : type === 'Invoice' ? 'bi-receipt' : 'bi-graph-up'}`}></i>
                </div>
                <h5 className="fw-bold mb-1">{type} Templates</h5>
                <p className="text-muted small mb-0">{templates.filter(t => t.type === type).length} Templates Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Template Library</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Template Name</th>
                  <th>Type</th>
                  <th>Last Modified</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id}>
                    <td className="fw-medium">{t.name}</td>
                    <td><span className="badge bg-light text-dark border">{t.type}</span></td>
                    <td>{t.lastModified}</td>
                    <td>
                      <span className={`badge ${t.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" title="Edit"><i className="bi bi-pencil-square"></i></button>
                      <button className="btn btn-sm btn-outline-info me-1" title="Preview"><i className="bi bi-eye"></i></button>
                      <button className="btn btn-sm btn-outline-secondary" title="Duplicate"><i className="bi bi-files"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
