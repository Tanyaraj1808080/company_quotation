import React, { useState, useEffect } from 'react';

const QuotationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'http://localhost:3000/api/quotation-templates';

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setEditName(template.name || '');
    setEditDescription(template.description || '');
    setEditContent(template.content || '');
  };

  const handleSave = async () => {
    const payload = {
      name: editName,
      description: editDescription,
      content: editContent
    };

    try {
      if (editingTemplate && editingTemplate.id) {
        // Update existing
        await fetch(`${API_URL}/${editingTemplate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleAddNew = () => {
      setEditingTemplate({});
      setEditName('');
      setEditDescription('');
      setEditContent('');
  };

  const handleDelete = async (id) => {
      if(window.confirm('Are you sure you want to delete this template?')) {
          try {
              await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
              fetchTemplates();
          } catch (error) {
              console.error('Error deleting template:', error);
          }
      }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 fw-bold">Quotation Templates</h2>
        <button className="btn btn-primary shadow-sm" onClick={handleAddNew}>
          <i className="bi bi-plus-lg me-2"></i>Add New Template
        </button>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Template Name</th>
                      <th>Description</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : templates.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          No templates found. Click "Add New Template" to create one.
                        </td>
                      </tr>
                    ) : templates.map((template) => (
                      <tr key={template.id}>
                        <td className="ps-4 fw-bold">{template.name}</td>
                        <td className="text-muted">{template.description}</td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(template)}
                          >
                            <i className="bi bi-pencil me-1"></i>Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(template.id)}
                          >
                            <i className="bi bi-trash me-1"></i>Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingTemplate && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  {editingTemplate.id ? 'Edit Template' : 'New Quotation Template'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditingTemplate(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-bold">Template Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Standard Service Quotation"
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Short description of when to use this template"
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)} 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Template Content</label>
                  <textarea 
                    className="form-control" 
                    rows="10" 
                    placeholder="Write your template content here..."
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                  ></textarea>
                  <div className="form-text mt-2">
                    <span className="badge bg-light text-dark border me-1">[Client Name]</span>
                    <span className="badge bg-light text-dark border me-1">[Amount]</span>
                    <span className="badge bg-light text-dark border me-1">[Date]</span>
                    <span className="text-muted small">Use these placeholders to auto-fill details.</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setEditingTemplate(null)}>Cancel</button>
                <button type="button" className="btn btn-primary px-4" onClick={handleSave}>
                  {editingTemplate.id ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationTemplates;
