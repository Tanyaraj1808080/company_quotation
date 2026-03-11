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

  // Password Visibility States
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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
    companyLogo: null,
    timezone: 'IST',
    currencySymbol: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
    weekStartsOn: 'Monday',
    currencyPosition: 'Before Amount',
    decimalPlaces: 2,
    thousandSeparatorStyle: 'International',
    defaultReminderTime: '30 minutes',
    language: 'English (US)',
    pageSize: '10'
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
    loginAlerts: true
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
      const companyRes = await axios.get('/api/company-settings');
      if (companyRes.data) {
        setCompany(prev => ({ ...prev, ...companyRes.data }));
      }
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

  const handleImageChange = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (target === 'profile') {
          setProfile(prev => ({ ...prev, avatar: base64String }));
        } else {
          setCompany(prev => ({ ...prev, companyLogo: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteImage = (target) => {
    if (target === 'profile') setProfile(prev => ({ ...prev, avatar: null }));
    else setCompany(prev => ({ ...prev, companyLogo: null }));
  };

  const handleProfileSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (profile.id) {
        await axios.patch(`/api/users/${profile.id}`, profile);
        showMessage('Profile updated successfully!');
        fetchData();
      }
    } catch (error) {
      showMessage('Error updating profile', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await axios.patch('/api/company-settings', company);
      showMessage('Settings updated successfully!');
    } catch (error) {
      showMessage('Error updating settings', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    if (security.newPassword !== security.confirmPassword) {
      showMessage('Passwords do not match!', 'danger');
      setLoading(false);
      return;
    }
    setTimeout(() => {
      showMessage('Security settings updated successfully!');
      setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    }, 1000);
  };

  const getPasswordStrength = () => {
    if (!security.newPassword) return 0;
    if (security.newPassword.length < 6) return 30;
    if (security.newPassword.length < 10) return 60;
    return 100;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'branding':
        return (
          <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
              <div>
                <h4 className="mb-1 fw-bold">Company Branding</h4>
                <p className="text-muted small mb-0">Configure your organization's logo and identity</p>
              </div>
              <button onClick={handleCompanySubmit} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-save fs-5"></i>}
                <span className="fw-medium">{loading ? 'Saving...' : 'Save Branding'}</span>
              </button>
            </div>

            <div className="row g-5">
              <div className="col-lg-5">
                <div className="card border-light-subtle rounded-4 bg-light bg-opacity-50 mb-4 overflow-hidden">
                  <div className="card-body p-4 text-center">
                    <label className="form-label d-block small fw-bold text-muted text-uppercase mb-3">Company Logo</label>
                    <div className="position-relative d-inline-block group mb-3">
                      <input type="file" ref={logoInputRef} className="d-none" accept="image/*" onChange={(e) => handleImageChange(e, 'company')} />
                      <div className="logo-preview-container rounded-4 border-2 border-dashed border-primary border-opacity-25 d-flex align-items-center justify-content-center bg-white" 
                           style={{ width: '220px', height: '140px', cursor: 'pointer' }}
                           onClick={() => logoInputRef.current.click()}>
                        {company.companyLogo ? (
                          <img src={company.companyLogo} alt="Logo" className="w-100 h-100 object-fit-contain p-3" />
                        ) : (
                          <div className="text-center">
                            <i className="bi bi-cloud-arrow-up display-6 text-primary opacity-50"></i>
                            <p className="small text-muted mb-0 mt-2">Upload Logo</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-2">
                      <button className="btn btn-sm btn-outline-primary px-3 rounded-pill" onClick={() => logoInputRef.current.click()}>Change</button>
                      {company.companyLogo && (
                        <button className="btn btn-sm btn-outline-danger px-3 rounded-pill" onClick={() => deleteImage('company')}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Organization Name</label>
                  <input type="text" className="form-control form-control-lg border-light-subtle shadow-none bg-light bg-opacity-50 rounded-3" 
                         value={company.companyName} onChange={(e) => setCompany({...company, companyName: e.target.value})} />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Headquarters Address</label>
                  <textarea className="form-control border-light-subtle shadow-none bg-light bg-opacity-50 rounded-3" rows="3" 
                            value={company.companyAddress} onChange={(e) => setCompany({...company, companyAddress: e.target.value})}></textarea>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
              <div>
                <h4 className="mb-1 fw-bold">My Profile</h4>
                <p className="text-muted small mb-0">Manage your personal information and account identity</p>
              </div>
              <button onClick={handleProfileSubmit} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check2-circle fs-5"></i>}
                <span className="fw-medium">{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            <div className="row g-5">
              <div className="col-lg-4 text-center">
                <div className="position-relative d-inline-block group mb-4">
                  <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                  <div className="profile-avatar-container position-relative rounded-circle p-1 border-2 border-primary border-dashed overflow-hidden" 
                       style={{ width: '180px', height: '180px', cursor: 'pointer' }}
                       onClick={() => fileInputRef.current.click()}>
                    <div className="w-100 h-100 rounded-circle overflow-hidden bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <span className="display-4 fw-bold text-primary">{profile.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <h5 className="mb-1 fw-bold">{profile.name}</h5>
                <p className="text-muted small mb-3">{profile.email}</p>
              </div>

              <div className="col-lg-8">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="form-floating mb-1">
                        <input type="text" className="form-control border-light-subtle shadow-none bg-light bg-opacity-50 rounded-3 px-3 pt-4" 
                               id="profileName" placeholder="Full Name" value={profile.name}
                               onChange={(e) => setProfile({...profile, name: e.target.value})} />
                        <label htmlFor="profileName" className="small text-muted fw-bold">FULL NAME</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="email" className="form-control border-light-subtle shadow-none bg-light bg-opacity-50 rounded-3 px-3 pt-4" 
                               id="profileEmail" placeholder="Email" value={profile.email}
                               onChange={(e) => setProfile({...profile, email: e.target.value})} />
                        <label htmlFor="profileEmail" className="small text-muted fw-bold">EMAIL ADDRESS</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="text" className="form-control border-light-subtle shadow-none bg-light bg-opacity-50 rounded-3 px-3 pt-4" 
                               id="profilePhone" placeholder="Phone" value={profile.phone}
                               onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                        <label htmlFor="profilePhone" className="small text-muted fw-bold">PHONE NUMBER</label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
              <div>
                <h4 className="mb-1 fw-bold">Security & Protection</h4>
                <p className="text-muted small mb-0">Manage your password and authentication</p>
              </div>
              <button onClick={handleSecuritySubmit} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-shield-lock-fill fs-5"></i>}
                <span className="fw-medium">{loading ? 'Updating...' : 'Update Security'}</span>
              </button>
            </div>

            <div className="card border-light-subtle rounded-4 shadow-none bg-light bg-opacity-25">
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">Current Password</label>
                    <input type="password" className="form-control border-light-subtle shadow-none bg-white" value={security.currentPassword} onChange={(e) => setSecurity({...security, currentPassword: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">New Password</label>
                    <input type="password" className="form-control border-light-subtle shadow-none bg-white" value={security.newPassword} onChange={(e) => setSecurity({...security, newPassword: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Confirm New Password</label>
                    <input type="password" className="form-control border-light-subtle shadow-none bg-white" value={security.confirmPassword} onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
              <div>
                <h4 className="mb-1 fw-bold">Localization & System Defaults</h4>
                <p className="text-muted small mb-0">Configure regional settings and formats</p>
              </div>
              <button onClick={handleCompanySubmit} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-save fs-5"></i>}
                <span className="fw-medium">{loading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            <div className="card border-light-subtle rounded-4 shadow-none bg-light bg-opacity-25">
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Primary Timezone</label>
                    <select className="form-select" value={company.timezone} onChange={(e) => setCompany({...company, timezone: e.target.value})}>
                      <option value="IST">IST (India)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Currency Symbol</label>
                    <select className="form-select" value={company.currencySymbol} onChange={(e) => setCompany({...company, currencySymbol: e.target.value})}>
                      <option value="INR">₹ (INR)</option>
                      <option value="USD">$ (USD)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container-xl">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h2 className="mb-1 fw-bold text-dark">System Settings</h2>
          {message.text && (
            <div className={`alert alert-${message.type} py-2 px-4 mb-0 rounded-pill shadow-sm`} role="alert">
              {message.text}
            </div>
          )}
        </div>

        <div className="row g-4">
          <div className="col-md-3">
            <div className="card shadow-sm border-light-subtle rounded-4 overflow-hidden mb-4">
              <div className="p-3 bg-white nav flex-column gap-2">
                <button className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 ${activeTab === 'profile' ? 'btn-primary' : 'btn-link text-dark text-decoration-none'}`} onClick={() => setActiveTab('profile')}>
                  <i className="bi bi-person-circle"></i> My Profile
                </button>
                <button className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 ${activeTab === 'branding' ? 'btn-primary' : 'btn-link text-dark text-decoration-none'}`} onClick={() => setActiveTab('branding')}>
                  <i className="bi bi-brush"></i> Branding
                </button>
                <button className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 ${activeTab === 'general' ? 'btn-primary' : 'btn-link text-dark text-decoration-none'}`} onClick={() => setActiveTab('general')}>
                  <i className="bi bi-gear-wide-connected"></i> Localization
                </button>
                <button className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 ${activeTab === 'security' ? 'btn-primary' : 'btn-link text-dark text-decoration-none'}`} onClick={() => setActiveTab('security')}>
                  <i className="bi bi-shield-lock"></i> Security
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card shadow-sm border-light-subtle rounded-4 bg-white p-5">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
