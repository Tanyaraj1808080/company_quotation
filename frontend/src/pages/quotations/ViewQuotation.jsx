import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const response = await axios.get(`/api/quotations/${id}`);
        let data = response.data;
        
        // Robust JSON parsing and array verification
        if (data) {
          if (typeof data.items === 'string') {
            try {
              data.items = JSON.parse(data.items);
            } catch (e) {
              console.error("Failed to parse items string:", e);
              data.items = [];
            }
          }
          
          // Final check: if it's still not an array, force it to be one
          if (!Array.isArray(data.items)) {
            data.items = [];
          }
        }
        
        setQuotation(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quotation:', error);
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-4 text-center">Loading quotation details...</div>;
  if (!quotation) return <div className="p-4 text-center">Quotation not found.</div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-print-none mb-3 d-flex justify-content-between align-items-center">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/all-quotations')}>
          <i className="bi bi-arrow-left me-2"></i>Back to List
        </button>
        <div>
          <button className="btn btn-primary me-2" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i>Print / Save PDF
          </button>
          <button className="btn btn-success" onClick={() => navigate(`/edit-quotation/${id}`)}>
            <i className="bi bi-pencil me-2"></i>Edit
          </button>
        </div>
      </div>

      <div className="card shadow border-0" id="quotation-print-area">
        <div className="card-body p-5">
          <div className="row mb-4">
            <div className="col-sm-6">
              <h2 className="text-primary mb-3">QUOTATION</h2>
              <div className="text-muted">Quotation ID: <span className="text-dark fw-bold">{quotation.id}</span></div>
              <div className="text-muted">Date: <span className="text-dark">{quotation.dateCreated}</span></div>
              <div className="text-muted">Status: <span className={`badge ${quotation.status === 'Approved' ? 'bg-success' : quotation.status === 'Pending' ? 'bg-warning' : 'bg-danger'}`}>{quotation.status}</span></div>
            </div>
            <div className="col-sm-6 text-sm-end">
              <h4 className="fw-bold">MIND MANTHAN</h4>
              <p className="text-muted small">
                123 Business Square, Suite 456<br />
                Mumbai, Maharashtra, India<br />
                Phone: +91 98765 43210<br />
                Email: hello@mindmanthan.com
              </p>
            </div>
          </div>

          <hr className="my-4" />

          <div className="row mb-4">
            <div className="col-sm-6">
              <h6 className="text-muted mb-2">Quotation For:</h6>
              <h5 className="fw-bold">{quotation.clientName}</h5>
            </div>
          </div>

          <div className="table-responsive-sm">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className="center">#</th>
                  <th>Description</th>
                  <th className="right">Price</th>
                  <th className="center">Qty</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items && quotation.items.map((item, index) => (
                  <tr key={index}>
                    <td className="center">{index + 1}</td>
                    <td className="left strong">{item.description}</td>
                    <td className="right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: quotation.currency || 'USD' }).format(item.price)}</td>
                    <td className="center">{item.quantity}</td>
                    <td className="right fw-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: quotation.currency || 'USD' }).format(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row justify-content-end">
            <div className="col-lg-4 col-sm-5 ml-auto">
              <table className="table table-clear">
                <tbody>
                  <tr>
                    <td className="left"><strong>Subtotal</strong></td>
                    <td className="right text-end">{new Intl.NumberFormat('en-US', { style: 'currency', currency: quotation.currency || 'USD' }).format(quotation.totalValue)}</td>
                  </tr>
                  <tr>
                    <td className="left"><strong>Tax (0%)</strong></td>
                    <td className="right text-end">$0.00</td>
                  </tr>
                  <tr>
                    <td className="left"><strong>Total</strong></td>
                    <td className="right text-end">
                      <h4 className="fw-bold text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: quotation.currency || 'USD' }).format(quotation.totalValue)}</h4>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 pt-5 border-top">
            <div className="row">
              <div className="col-sm-6">
                <p className="text-muted small">
                  <strong>Terms & Conditions:</strong><br />
                  1. Payment within 15 days from approval.<br />
                  2. Price is valid for 30 days.
                </p>
              </div>
              <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
                <div className="border-bottom d-inline-block px-5 pb-2 mb-1" style={{width: '200px'}}></div>
                <p className="text-muted small">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;
