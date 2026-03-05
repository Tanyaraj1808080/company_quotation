import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../assets/styles/quotation-template.css';
import mindManthanLogo from '../../MIND MANTHAN LOGO2.svg 2 .svg';

const QuotationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const logoInputRef = useRef(null);
  
  // Template State (Editable Fields)
  const [templateData, setTemplateData] = useState({
    name: 'Standard Quotation',
    description: 'General purpose quotation template',
    clientName: '[CLIENT NAME]',
    clientAddress: '[ADDRESS]',
    quoteNo: '#212182818',
    dueDate: '2023-05-05',
    quoteDate: '2023-05-02',
    logo: null, // Custom logo for this template
    items: [
      { id: 1, quantity: 1, description: '[WEBSITE]', price: '[****]', amount: '[****]' },
      { id: 2, quantity: 2, description: '[APP IOS]', price: '[****]', amount: '[****]' },
      { id: 3, quantity: 3, description: '[APP ANDROID]', price: '[****]', amount: '[****]' },
      { id: 4, quantity: 4, description: '[CXBGNHGJ]', price: '[****]', amount: '[****]' },
      { id: 5, quantity: 5, description: '[CV Resume Design]', price: '[****]', amount: '[****]' },
      { id: 6, quantity: 6, description: '[Invoice Design]', price: '[****]', amount: '[****]' },
      { id: 7, quantity: 7, description: '[Social Media Design]', price: '[****]', amount: '[****]' },
    ],
    subtotal: '[****]',
    tax: '0.00',
    total: '[****]',
    paymentOptions: [
      {
        title: 'Option 1: Part Payment Method',
        totalProjectCost: '[*****]',
        milestones: [
          { stage: 'Payment 1', description: 'Project Kickoff (Setup & Foundation)', amount: '[*****]', percentage: '40%' },
          { stage: 'Payment 2', description: 'Core Development Completion', amount: '[*****]', percentage: '30%' },
          { stage: 'Payment 3', description: 'Final Delivery & Go-Live', amount: '[*****]', percentage: '30%' }
        ]
      },
      {
        title: 'Option 2: Alternative Method',
        milestones: [
          { stage: 'Payment 1', description: 'Setup & Architecture', amount: '[*****]', percentage: '25%' },
          { stage: 'Payment 2', description: 'Authentication & Device Onboarding', amount: '[*****]', percentage: '25%' },
          { stage: 'Payment 3', description: 'Core Features Completion', amount: '[*****]', percentage: '25%' },
          { stage: 'Payment 4', description: 'Final Delivery & Launch', amount: '[*****]', percentage: '25%' }
        ]
      }
    ],
    terms: 'Above information is not an invoice and only an estimate of goods/services.\nPayment will be due prior to provision or delivery of goods/services.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'
  const [companyLogo, setCompanyLogo] = useState(mindManthanLogo);

  const API_URL = '/api/quotation-templates';

  useEffect(() => {
    fetchTemplates();
    fetchCompanyLogo();
  }, []);

  const fetchCompanyLogo = async () => {
    try {
      const response = await axios.get('/api/company-settings');
      if (response.data && response.data.companyLogo) {
        setCompanyLogo(response.data.companyLogo);
      }
    } catch (error) {
      console.error('Error fetching company logo:', error);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplateData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteTemplateLogo = () => {
    if (window.confirm('Remove this custom logo and use company default?')) {
      setTemplateData(prev => ({ ...prev, logo: null }));
    }
  };

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    if (template.content) {
      try {
        setTemplateData(JSON.parse(template.content));
      } catch (e) {
        console.error("Error parsing template content", e);
      }
    }
    setShowEditor(true);
    setSaveStatus(null);
  };

  const handleAddNew = () => {
    setCurrentTemplate(null);
    setShowEditor(true);
    setSaveStatus(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const payload = {
      name: templateData.name,
      description: templateData.description,
      content: JSON.stringify(templateData)
    };

    try {
      if (currentTemplate && currentTemplate.id) {
        await axios.patch(`${API_URL}/${currentTemplate.id}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      setSaveStatus('success');
      setTimeout(() => setShowEditor(false), 1500);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitQuotation = async () => {
    if (!window.confirm('Are you sure you want to submit this as an active Quotation?')) return;
    
    setIsSubmitting(true);

    const cleanNum = (val) => {
      if (!val) return 0;
      const cleaned = val.toString().replace(/[^\d.]/g, '');
      return parseFloat(cleaned) || 0;
    };

    const payload = {
      clientName: templateData.clientName.replace(/[\[\]_]/g, '').trim() || 'New Client',
      totalValue: cleanNum(templateData.total),
      currency: 'INR',
      items: templateData.items.map(item => ({
        ...item,
        quantity: cleanNum(item.quantity),
        price: cleanNum(item.price),
        amount: cleanNum(item.amount),
        description: item.description.replace(/[\[\]]/g, '').trim()
      })),
      dateCreated: templateData.quoteDate || new Date().toISOString().split('T')[0]
    };

    try {
      console.log('Submitting Quotation Payload:', payload);
      await axios.post('/api/quotations', payload);
      setSaveStatus('success');
      alert('Quotation submitted successfully and added to "All Quotations"!');
      setTimeout(() => setShowEditor(false), 500);
    } catch (error) {
      console.error('Error submitting quotation:', error);
      const errorMsg = error.response?.data?.message || 'Error submitting quotation. Please check the data.';
      const detailMsg = error.response?.data?.details ? `\nDetails: ${error.response.data.details.join(', ')}` : '';
      alert(`${errorMsg}${detailMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const downloadQuotation = () => {
    window.print();
  };

  const updateField = (field, value) => {
    setTemplateData(prev => {
      const newData = { ...prev, [field]: value };
      // If subtotal or tax changes manually, recalculate total
      if (field === 'subtotal' || field === 'tax') {
        const sub = parseFloat(newData.subtotal) || 0;
        const tx = parseFloat(newData.tax) || 0;
        newData.total = (sub + tx).toFixed(2);
      }
      return newData;
    });
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const tax = subtotal * 0; // You can change 0 to 0.18 for 18% tax etc.
    const total = subtotal + tax;
    
    setTemplateData(prev => ({
      ...prev,
      items,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...templateData.items];
    const item = { ...newItems[index] };
    
    // Clean and update the specific field
    const cleanedValue = value.toString().replace(/[^\d.]/g, '');
    item[field] = cleanedValue;

    // Auto-calculate row amount if quantity or price changes
    if (field === 'quantity' || field === 'price') {
      const qty = parseFloat(item.quantity) || 0;
      const prc = parseFloat(item.price) || 0;
      item.amount = (qty * prc).toFixed(2);
    } else if (field === 'amount') {
      item.amount = parseFloat(cleanedValue) || 0;
    }

    newItems[index] = item;
    calculateTotals(newItems);
  };

  const updateMilestone = (optIdx, mileIdx, field, value) => {
    const newOptions = [...templateData.paymentOptions];
    newOptions[optIdx].milestones[mileIdx][field] = value;
    setTemplateData(prev => ({ ...prev, paymentOptions: newOptions }));
  };

  if (showEditor) {
    return (
      <div className="quotation-container">
        <div className="no-print mb-4 d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm">
          <div>
            <button className="btn btn-outline-secondary me-2" onClick={() => setShowEditor(false)}>
              <i className="bi bi-arrow-left me-1"></i>Back
            </button>
            <span className="fw-bold">Editing: {templateData.name}</span>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {saveStatus === 'success' && <span className="text-success small fw-bold"><i className="bi bi-check-circle-fill me-1"></i>Action Success!</span>}
            {saveStatus === 'error' && <span className="text-danger small fw-bold"><i className="bi bi-exclamation-triangle-fill me-1"></i>Error occurred</span>}
            
            <button className="btn btn-info text-white" onClick={downloadQuotation}>
              <i className="bi bi-download me-1"></i>Download
            </button>

            <button 
              className="btn btn-success shadow-sm" 
              onClick={handleSubmitQuotation}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
              ) : (
                <><i className="bi bi-send-check me-1"></i>Submit Quotation</>
              )}
            </button>
          </div>
        </div>

        <div className="no-print card mb-4 p-3 border-0 shadow-sm">
           <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Template Name</label>
                <input type="text" className="form-control form-control-sm" value={templateData.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Description</label>
                <input type="text" className="form-control form-control-sm" value={templateData.description} onChange={(e) => updateField('description', e.target.value)} />
              </div>
           </div>
        </div>

        <div className="quotation-page-wrapper">
          <div className="quotation-page" id="quotation-template">
            <div className="quotation-header">
              <div className="quotation-logo position-relative group">
                <input type="file" ref={logoInputRef} className="d-none" accept="image/*" onChange={handleLogoUpload} />
                <img src={templateData.logo || companyLogo} alt="logo" style={{ width: '140px', height: '140px', objectFit: 'contain' }} />
                <div className="no-print logo-controls position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 opacity-0 hover-opacity-100 transition-opacity">
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-light rounded-circle shadow-sm" onClick={() => logoInputRef.current.click()}><i className="bi bi-pencil-fill"></i></button>
                    {templateData.logo && <button className="btn btn-sm btn-danger rounded-circle shadow-sm" onClick={deleteTemplateLogo}><i className="bi bi-trash3-fill"></i></button>}
                  </div>
                </div>
              </div>
              <div className="invoice-title">
                <h1 contentEditable suppressContentEditableWarning>QUOTATION</h1>
              </div>
            </div>

            <div className="quotation-client">
              <div className="client-details">
                <strong>Quote to:</strong><br />
                <span className="client-name" contentEditable suppressContentEditableWarning onBlur={(e) => updateField('clientName', e.target.innerText)}>{templateData.clientName}</span><br />
                <div contentEditable suppressContentEditableWarning onBlur={(e) => updateField('clientAddress', e.target.innerText)}>{templateData.clientAddress}</div>
              </div>
              <div>
                <p>Quotation No: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField('quoteNo', e.target.innerText)}>{templateData.quoteNo}</span></p>
                <p>Due Date : <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField('dueDate', e.target.innerText)}>{templateData.dueDate}</span></p>
                <p>Quotation Date : <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField('quoteDate', e.target.innerText)}>{templateData.quoteDate}</span></p>
              </div>
            </div>

            <table className="quotation-table">
              <thead>
                <tr>
                  <th className="no-print" style={{ width: '40px' }}></th>
                  <th>QUANTITY</th>
                  <th>ITEM DESCRIPTION</th>
                  <th>PRICE</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {templateData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="no-print">
                      <button className="btn btn-sm btn-link text-danger p-0" onClick={() => updateField('items', templateData.items.filter((_, i) => i !== index))}><i className="bi bi-x-circle"></i></button>
                    </td>
                    <td contentEditable suppressContentEditableWarning onBlur={(e) => updateItem(index, 'quantity', e.target.innerText)}>{item.quantity}</td>
                    <td contentEditable suppressContentEditableWarning onBlur={(e) => updateItem(index, 'description', e.target.innerText)}>{item.description}</td>
                    <td contentEditable suppressContentEditableWarning onBlur={(e) => updateItem(index, 'price', e.target.innerText)}>{item.price}</td>
                    <td contentEditable suppressContentEditableWarning onBlur={(e) => updateItem(index, 'amount', e.target.innerText)}>{item.amount}</td>
                  </tr>
                ))}
                <tr className="no-print">
                  <td colSpan="5" className="text-center">
                    <button className="btn btn-sm btn-link text-primary text-decoration-none" onClick={() => updateField('items', [...templateData.items, { id: Date.now(), quantity: 1, description: 'New Item', price: 0, amount: 0 }])}>
                      <i className="bi bi-plus-circle me-1"></i>Add Row
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="bottom-info">
              <div className="payment-section">
                <h4><strong>Payment Method Options</strong></h4>
                <p>Total Project Cost: <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField('subtotal', e.target.innerText)}>{templateData.subtotal}</span></p>
                {templateData.paymentOptions.map((opt, optIdx) => (
                  <div key={optIdx} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <p className="mb-0"><strong>{opt.title}</strong></p>
                      <button className="btn btn-sm btn-link text-danger no-print" onClick={() => updateField('paymentOptions', templateData.paymentOptions.filter((_, i) => i !== optIdx))}><i className="bi bi-trash small"></i> Remove Option</button>
                    </div>
                    <table className="quotation-table">
                      <thead>
                        <tr>
                          <th className="no-print" style={{ width: '40px' }}></th>
                          <th>Stage</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opt.milestones.map((mile, mileIdx) => (
                          <tr key={mileIdx}>
                            <td className="no-print">
                              <button className="btn btn-sm btn-link text-danger p-0" onClick={() => {
                                const newOpts = [...templateData.paymentOptions];
                                newOpts[optIdx].milestones = newOpts[optIdx].milestones.filter((_, i) => i !== mileIdx);
                                updateField('paymentOptions', newOpts);
                              }}><i className="bi bi-dash-circle"></i></button>
                            </td>
                            <td contentEditable suppressContentEditableWarning onBlur={(e) => updateMilestone(optIdx, mileIdx, 'stage', e.target.innerText)}>{mile.stage}</td>
                            <td contentEditable suppressContentEditableWarning onBlur={(e) => updateMilestone(optIdx, mileIdx, 'description', e.target.innerText)}>{mile.description}</td>
                            <td contentEditable suppressContentEditableWarning onBlur={(e) => updateMilestone(optIdx, mileIdx, 'amount', e.target.innerText)}>{mile.amount}</td>
                            <td contentEditable suppressContentEditableWarning onBlur={(e) => updateMilestone(optIdx, mileIdx, 'percentage', e.target.innerText)}>{mile.percentage}</td>
                          </tr>
                        ))}
                        <tr className="no-print">
                          <td colSpan="5" className="text-center">
                            <button className="btn btn-sm btn-link text-primary text-decoration-none" onClick={() => {
                              const newOpts = [...templateData.paymentOptions];
                              newOpts[optIdx].milestones.push({ stage: 'New Stage', description: 'Description', amount: '0', percentage: '0%' });
                              updateField('paymentOptions', newOpts);
                            }}><i className="bi bi-plus-circle me-1"></i>Add Milestone</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
                <div className="no-print text-center mt-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => updateField('paymentOptions', [...templateData.paymentOptions, { title: 'New Payment Option', milestones: [] }])}>Add New Payment Option</button>
                </div>
              </div>
            </div>

            <p className="info-text">All payments are milestone-based and non-refundable once the respective phase has started. Final payment is mandatory before source code handover and production release.</p>
            
            <div className="bank-details-container">
              <div className="terms-section">
                <strong>Terms & Conditions :</strong><br />
                <div contentEditable suppressContentEditableWarning onBlur={(e) => updateField('terms', e.target.innerText)}>{templateData.terms}</div>
                <h4 className="mt-3">PLEASE CONFIRM YOUR ACCEPTANCE OF THIS QUOTE</h4>
                <div className="quotation-footer">Thank for your business with us !</div>
              </div>
              <div className="total-section">
                <p>SUBTOTAL : <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField('subtotal', e.target.innerText)}>₹{templateData.subtotal}</span></p>
                <p>TAX : <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField('tax', e.target.innerText)}>₹{templateData.tax}</span></p>
                <h3>TOTAL : <span contentEditable suppressContentEditableWarning onBlur={(e) => updateField('total', e.target.innerText)}>₹{templateData.total}</span></h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 fw-bold text-primary"><i className="bi bi-file-earmark-richtext me-2"></i>Quotation Templates</h2>
        <button className="btn btn-primary shadow-sm px-4" onClick={handleAddNew}><i className="bi bi-plus-lg me-2"></i>Create New Template</button>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 py-3">Template Name</th>
                      <th>Description</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                        </td>
                      </tr>
                    ) : templates.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-5 text-muted">No templates found. Click "Create New Template" to start.</td></tr>
                    ) : templates.map((template) => (
                      <tr key={template.id}>
                        <td className="ps-4 fw-bold">{template.name}</td>
                        <td className="text-muted">{template.description}</td>
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-outline-primary me-2 px-3" onClick={() => handleEdit(template)}><i className="bi bi-pencil me-1"></i>Visual Editor</button>
                          <button className="btn btn-sm btn-outline-danger px-3" onClick={() => handleDelete(template.id)}><i className="bi bi-trash me-1"></i>Delete</button>
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
    </div>
  );
};

export default QuotationTemplates;
