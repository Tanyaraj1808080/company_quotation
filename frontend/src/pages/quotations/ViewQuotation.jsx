import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/quotation-template.css';
import mindManthanLogo from '../../MIND MANTHAN LOGO2.svg 2 .svg';

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotRes, settingsRes] = await Promise.all([
          axios.get(`/api/quotations/${id}`),
          axios.get('/api/company-settings')
        ]);

        let data = quotRes.data;
        if (data && typeof data.items === 'string') {
          try {
            data.items = JSON.parse(data.items);
          } catch (e) {
            data.items = [];
          }
        }
        
        // Ensure items is an array
        if (!Array.isArray(data.items)) data.items = [];

        setQuotation(data);
        setCompanySettings(settingsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quotation data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
  if (!quotation) return <div className="p-5 text-center">Quotation not found.</div>;

  const logoToUse = companySettings?.companyLogo || mindManthanLogo;

  return (
    <div className="quotation-container">
      {/* Action Bar */}
      <div className="no-print mb-4 d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm">
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/all-quotations')}>
            <i className="bi bi-arrow-left me-1"></i>Back to List
          </button>
          <span className="fw-bold text-primary">Viewing Quotation: {quotation.id}</span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary shadow-sm" onClick={handlePrint}>
            <i className="bi bi-printer me-1"></i>Print / Export PDF
          </button>
          <button className="btn btn-outline-primary" onClick={() => navigate(`/edit-quotation/${id}`)}>
            <i className="bi bi-pencil me-1"></i>Edit Quotation
          </button>
        </div>
      </div>

      {/* Professional A4 Template Style */}
      <div className="quotation-page-wrapper">
        <div className="quotation-page shadow-lg" id="quotation-view-area">
          <div className="quotation-header">
            <div className="quotation-logo">
              <img 
                src={logoToUse} 
                alt="company logo" 
                style={{ width: '140px', height: '140px', objectFit: 'contain' }} 
              />
            </div>
            <div className="invoice-title text-end">
              <h1 className="mb-0">QUOTATION</h1>
              <div className="text-muted small">Status: <span className={`fw-bold ${quotation.status === 'Approved' ? 'text-success' : 'text-warning'}`}>{quotation.status}</span></div>
            </div>
          </div>

          <div className="quotation-client mt-4">
            <div className="client-details">
              <strong>Quote to:</strong><br />
              <span className="client-name fw-bold" style={{ fontSize: '1.2rem', color: '#003366' }}>
                {quotation.clientName}
              </span><br />
              <div className="text-muted mt-1" style={{ maxWidth: '300px' }}>
                {quotation.clientAddress || 'Client Address Not Specified'}
              </div>
            </div>
            <div className="text-end">
              <p className="mb-1"><strong>Quotation No:</strong> {quotation.id}</p>
              <p className="mb-1"><strong>Quotation Date:</strong> {quotation.dateCreated}</p>
              <p className="mb-1"><strong>Currency:</strong> {quotation.currency || 'INR'}</p>
            </div>
          </div>

          <table className="quotation-table mt-5">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>SR.</th>
                <th>ITEM DESCRIPTION</th>
                <th className="text-center">QTY</th>
                <th className="text-end">PRICE</th>
                <th className="text-end">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <div className="fw-bold">{item.description}</div>
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">₹{parseFloat(item.price).toLocaleString()}</td>
                  <td className="text-end fw-bold">₹{parseFloat(item.amount || (item.price * item.quantity)).toLocaleString()}</td>
                </tr>
              ))}
              {quotation.items.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted italic">No items listed in this quotation.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="bank-details-container mt-5">
            <div className="terms-section">
              <strong>Terms & Conditions :</strong><br />
              <div className="small text-muted mt-2" style={{ whiteSpace: 'pre-line' }}>
                {quotation.terms || "1. Above information is not an invoice and only an estimate.\n2. Payment will be due prior to provision or delivery of goods/services.\n3. This quote is valid for 30 days."}
              </div>
              <h6 className="mt-4 fw-bold" style={{ color: '#003366' }}>PLEASE CONFIRM YOUR ACCEPTANCE OF THIS QUOTE</h6>
              <div className="quotation-footer mt-2 border-top pt-2 italic small">
                Thank you for your business with us!
              </div>
            </div>
            <div className="total-section bg-light p-3 rounded">
              <div className="d-flex justify-content-between mb-2">
                <span>SUBTOTAL :</span>
                <span className="fw-bold">₹{((parseFloat(quotation.totalValue) || 0) + (parseFloat(quotation.discount) || 0) - (parseFloat(quotation.tax) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {parseFloat(quotation.tax) > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>TAX (+) :</span>
                  <span className="fw-bold">₹{parseFloat(quotation.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {parseFloat(quotation.discount) > 0 && (
                <div className="d-flex justify-content-between mb-2 text-danger">
                  <span>DISCOUNT (-) :</span>
                  <span className="fw-bold">₹{parseFloat(quotation.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center border-top pt-2">
                <h3 className="mb-0 fw-bold" style={{ color: '#003366' }}>TOTAL :</h3>
                <h3 className="mb-0 fw-bold" style={{ color: '#003366' }}>₹{parseFloat(quotation.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>
          </div>
          
          <div className="mt-5 pt-5 text-end no-screen-only print-only">
            <div className="d-inline-block border-top pt-2 text-center" style={{ width: '200px' }}>
              <div className="fw-bold">Authorized Signatory</div>
              <div className="small text-muted">MindManthan Software Solutions</div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .quotation-container { background: white !important; padding: 0 !important; margin: 0 !important; }
          .quotation-page { box-shadow: none !important; margin: 0 !important; border: none !important; width: 100% !important; }
          .layout-wrapper, .main-content { padding: 0 !important; margin: 0 !important; }
          body { background: white !important; }
        }
        .italic { font-style: italic; }
      `}} />
    </div>
  );
};

export default ViewQuotation;
