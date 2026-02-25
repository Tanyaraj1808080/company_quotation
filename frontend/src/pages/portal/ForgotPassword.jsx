import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'Loading...',
    companyLogo: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const res = await axios.get('/api/company-settings');
        if (res.data) {
          setCompanyInfo({
            companyName: res.data.companyName || 'Mindmanthan',
            companyLogo: res.data.companyLogo
          });
        }
      } catch (error) {
        console.error("Error fetching company settings:", error);
      }
    };
    fetchCompanySettings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would call an API to send a reset email
    setSubmitted(true);
  };

  return (
    <div className="bg-light d-flex align-items-center justify-content-center min-vh-100 w-100 position-fixed top-0 start-0" style={{ zIndex: 2000 }}>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-lg p-4 border-0">
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <img src={companyInfo.companyLogo || "/logo.svg"} alt={`${companyInfo.companyName} Logo`} style={{ height: '50px' }} className="mb-3" />
                                <h3 className="fw-bold">Reset Password</h3>
                                {!submitted ? (
                                    <p className="text-muted">Enter your email to receive a password reset link</p>
                                ) : (
                                    <div className="alert alert-success">
                                        If an account exists for {email}, a reset link has been sent.
                                    </div>
                                )}
                            </div>
                            
                            {!submitted ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="email" className="form-label">Email address</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            id="email" 
                                            placeholder="Enter your email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary btn-lg">Send Reset Link</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="d-grid gap-2">
                                    <button onClick={() => navigate('/client-login')} className="btn btn-outline-primary btn-lg">Back to Login</button>
                                </div>
                            )}
                            
                            <div className="text-center mt-3">
                                <Link to="/client-login" className="text-decoration-none">Return to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ForgotPassword;
