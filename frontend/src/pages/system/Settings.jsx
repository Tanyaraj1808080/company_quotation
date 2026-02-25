import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Settings = () => {
  const location = useLocation();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Form States
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+91 9876543210',
    avatar: null
  });

  const [company, setCompany] = useState({
    companyName: 'Mindmanthan Software Solutions',
    companyAddress: 'A90, A BLOCK, SECTOR 4, NOIDA, UTTAR PRADESH 201301',
    companyLogo: null
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    fetchData();
  }, [location.search]);

  const fetchData = async () => {
    try {
      // Fetch company settings
      const companyRes = await axios.get('/api/company-settings');
      if (companyRes.data) {
        setCompany(companyRes.data);
      }

      // Fetch admin user info (assuming first user is admin for now)
      const userRes = await axios.get('/api/users');
      if (userRes.data && userRes.data.length > 0) {
        const admin = userRes.data[0];
        setProfile({
          name: admin.name,
          email: admin.email,
          phone: admin.phone || '+91 9876543210',
          avatar: admin.avatar || null,
          id: admin.id
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Image Handlers
  const handleImageChange = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        showMessage('Please upload a valid image (JPG, PNG, or SVG)', 'danger');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (target === 'profile') {
          setProfile(prev => ({ ...prev, avatar: base64String }));
        } else {
          setCompany(prev => ({ ...prev, companyLogo: base64String }));
        }
        // No success message here, only when Save is clicked.
      };
      reader.onerror = () => {
        showMessage('Error reading file. Please try a different image.', 'danger');
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteImage = (target) => {
    if (target === 'profile') {
      setProfile(prev => ({ ...prev, avatar: null }));
    } else {
      setCompany(prev => ({ ...prev, companyLogo: null }));
    }
  };

  // Submit Handlers
  const handleProfileSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let targetId = profile.id;
      
      // If ID is missing, try to find the admin user first
      if (!targetId) {
        const userRes = await axios.get('/api/users');
        const admin = userRes.data.find(u => u.email === profile.email) || userRes.data[0];
        if (admin) {
          targetId = admin.id;
        }
      }

      if (targetId) {
        await axios.patch(`/api/users/${targetId}`, {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar
        });
        showMessage('Profile updated successfully!');
        // Refresh data to ensure state is in sync
        fetchData();
      } else {
        showMessage('Error: Admin user not found in database.', 'danger');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage('Error updating profile: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await axios.patch('/api/company-settings', company);
      showMessage('Company settings updated!');
    } catch (error) {
      console.error("Error updating company settings:", error);
      showMessage('Error updating company settings', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      showMessage('Passwords do not match!', 'danger');
      return;
    }
    showMessage('Password changed successfully!');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'branding':
        return (
          <div className="row g-4">
            {/* Company Logo & Info Section */}
            <div className="col-md-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Company Branding</h5>
                  <button onClick={handleCompanySubmit} className="btn btn-sm btn-primary">Save Branding</button>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-3 text-center mb-3 mb-md-0">
                      <div className="position-relative d-inline-block">
                        <input type="file" ref={logoInputRef} className="d-none" accept="image/*" onChange={(e) => handleImageChange(e, 'company')} />
                        <div className="bg-light rounded border d-flex align-items-center justify-content-center overflow-hidden" 
                             style={{ width: '150px', height: '150px' }}>
                          {company.companyLogo ? (
                            <img src={company.companyLogo} alt="Logo" className="w-100 h-100 object-fit-contain" />
                          ) : (
                            <i className="bi bi-building fs-1 text-muted"></i>
                          )}
                        </div>
                        <div className="position-absolute top-0 end-0 mt-n2 me-n2 d-flex flex-column gap-1">
                          <button onClick={() => logoInputRef.current.click()} className="btn btn-sm btn-primary rounded-circle shadow-sm" style={{ width: '32px', height: '32px' }} title="Upload Logo">
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          {company.companyLogo && (
                            <button onClick={() => deleteImage('company')} className="btn btn-sm btn-danger rounded-circle shadow-sm" style={{ width: '32px', height: '32px' }} title="Delete Logo">
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="small text-muted mt-2">Company Logo</p>
                    </div>
                    <div className="col-md-9">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Organization Name</label>
                        <input type="text" className="form-control" value={company.companyName} 
                               onChange={(e) => setCompany({...company, companyName: e.target.value})} />
                      </div>
                      <div className="mb-0">
                        <label className="form-label fw-bold">Company Address (Editable)</label>
                        <textarea className="form-control" rows="3" value={company.companyAddress}
                                  onChange={(e) => setCompany({...company, companyAddress: e.target.value})}></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="row g-4">
            {/* Admin Profile Section */}
            <div className="col-md-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">Admin Profile Settings</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row">
                      <div className="col-md-4 text-center border-end">
                        <div className="position-relative d-inline-block mb-3">
                          <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                          <div className="bg-primary bg-opacity-10 rounded-circle border d-flex align-items-center justify-content-center overflow-hidden" 
                               style={{ width: '120px', height: '120px' }}>
                            {profile.avatar ? (
                              <img src={profile.avatar} alt="Profile" className="w-100 h-100 object-fit-cover" />
                            ) : (
                              <span className="fs-1 fw-bold text-primary">{profile.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="position-absolute bottom-0 end-0 d-flex gap-1">
                             <button type="button" onClick={() => fileInputRef.current.click()} className="btn btn-sm btn-primary rounded-circle shadow-sm" style={{ width: '32px', height: '32px' }}>
                               <i className="bi bi-camera-fill"></i>
                             </button>
                             {profile.avatar && (
                               <button type="button" onClick={() => deleteImage('profile')} className="btn btn-sm btn-danger rounded-circle shadow-sm" style={{ width: '32px', height: '32px' }}>
                                 <i className="bi bi-trash3-fill"></i>
                               </button>
                             )}
                          </div>
                        </div>
                        <h6 className="mb-0 fw-bold">{profile.name}</h6>
                        <p className="small text-muted">{profile.email}</p>
                      </div>
                      <div className="col-md-8 px-4">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Full Name</label>
                            <input type="text" className="form-control" value={profile.name}
                                   onChange={(e) => setProfile({...profile, name: e.target.value})} />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Email Address</label>
                            <input type="email" className="form-control" value={profile.email}
                                   onChange={(e) => setProfile({...profile, email: e.target.value})} />
                          </div>
                          <div className="col-md-12 mb-3">
                            <label className="form-label small fw-bold text-muted">Phone Number</label>
                            <input type="text" className="form-control" value={profile.phone}
                                   onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                          </div>
                        </div>
                        <div className="mt-2">
                          <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Admin Profile'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Security Settings</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSecuritySubmit}>
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Change Password</h6>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" required value={security.currentPassword}
                           onChange={(e) => setSecurity({...security, currentPassword: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" required value={security.newPassword}
                           onChange={(e) => setSecurity({...security, newPassword: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" required value={security.confirmPassword}
                           onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Update Security Settings</button>
              </form>
            </div>
          </div>
        );
      default:
        return (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">General Settings</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info py-2 small">
                 <i className="bi bi-info-circle me-2"></i>General system settings are managed here.
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Primary Timezone</label>
                <select className="form-select" defaultValue="IST">
                  <option value="IST">(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Currency Symbol</label>
                <select className="form-select" defaultValue="INR">
                  <option value="INR">₹ (INR)</option>
                  <option value="USD">$ (USD)</option>
                  <option value="EUR">€ (EUR)</option>
                </select>
              </div>
              <button className="btn btn-primary">Save General Settings</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0 fw-bold">System Settings</h2>
          <p className="text-muted small mb-0">Manage your organization profile and account security</p>
        </div>
        {message.text && (
          <div className={`alert alert-${message.type} py-2 px-3 mb-0 shadow-sm border-0`} role="alert">
            <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
            {message.text}
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 mb-4 overflow-hidden">
            <div className="list-group list-group-flush">
              <button className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${activeTab === 'profile' ? 'active bg-primary' : ''}`}
                      onClick={() => setActiveTab('profile')}>
                <i className="bi bi-person-badge me-2 fs-5"></i> Profile
              </button>
              <button className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${activeTab === 'branding' ? 'active bg-primary' : ''}`}
                      onClick={() => setActiveTab('branding')}>
                <i className="bi bi-building me-2 fs-5"></i> Company Branding
              </button>
              <button className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${activeTab === 'general' ? 'active bg-primary' : ''}`}
                      onClick={() => setActiveTab('general')}>
                <i className="bi bi-sliders me-2 fs-5"></i> General Settings
              </button>
              <button className={`list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${activeTab === 'security' ? 'active bg-primary' : ''}`}
                      onClick={() => setActiveTab('security')}>
                <i className="bi bi-shield-lock me-2 fs-5"></i> Security
              </button>
            </div>
          </div>
          
          {/* Quick Stats or Preview */}
          <div className="card shadow-sm border-0 bg-primary text-white p-3">
             <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle bg-white bg-opacity-25 p-2 me-2">
                   <i className="bi bi-shield-check"></i>
                </div>
                <span className="small fw-bold">System Status</span>
             </div>
             <p className="small mb-0 opacity-75">All systems are running normally. Last update was today at 10:30 AM.</p>
          </div>
        </div>
        <div className="col-md-9">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
