import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ClientLogin = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you would handle authentication here
    // For now, let's just navigate to the home dashboard or a placeholder
    navigate('/');
  };

  return (
    <div className="bg-light d-flex align-items-center justify-content-center min-vh-100 w-100 position-fixed top-0 start-0" style={{ zIndex: 2000 }}>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-lg p-4 border-0">
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <img src="/logo.svg" alt="Mindmanthan Logo" style={{ height: '50px' }} className="mb-3" />
                                <h3 className="fw-bold">Client Portal Login</h3>
                                <p className="text-muted">Access your quotations and invoices</p>
                            </div>
                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email address</label>
                                    <input type="email" className="form-control" id="email" placeholder="Enter your email" required />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input type="password" className="form-control" id="password" placeholder="Enter your password" required />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary btn-lg">Login</button>
                                </div>
                                <div className="text-center mt-3">
                                    <Link to="/forgot-password" title="Go to forgot password page" className="text-decoration-none">Forgot Password?</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ClientLogin;
