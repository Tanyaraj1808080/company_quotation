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
    primaryColor: '#0d6efd',
    secondaryColor: '#6c757d',
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

  // Dummy Sessions Data
  const [sessions] = useState([
    { id: 1, device: 'Chrome on Windows 11', location: 'Noida, India', lastActive: 'Active now', isCurrent: true },
    { id: 2, device: 'Safari on iPhone 15', location: 'Delhi, India', lastActive: '2 hours ago', isCurrent: false }
  ]);

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
                <p className="text-muted small mb-0">Configure your organization's visual identity and style</p>
              </div>
              <button onClick={handleCompanySubmit} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-palette2 fs-5"></i>
                )}
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
                        <div className="avatar-overlay position-absolute inset-0 w-100 h-100 bg-dark bg-opacity-50 d-flex flex-column align-items-center justify-content-center text-white opacity-0 transition-all rounded-4"
                             style={{ top: 0, left: 0 }}>
                          <span className="small fw-medium">Replace Logo</span>
                        </div>
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

                <div className="card border-light-subtle rounded-4 shadow-sm overflow-hidden">
                  <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                    <h6 className="mb-0 fw-bold small text-uppercase text-muted">Real-time Preview</h6>
                  </div>
                  <div className="card-body p-4 pt-2">
                    <div className="preview-widget p-3 rounded-3 border bg-white mb-3">
                       <h6 style={{ color: company.primaryColor }} className="fw-bold mb-2">Heading Style</h6>
                       <p className="small text-muted mb-3">Sample paragraph showing how the brand colors affect your dashboard components.</p>
                       <div className="d-flex gap-2">
                          <button className="btn btn-sm text-white" style={{ backgroundColor: company.primaryColor, border: 'none' }}>Primary Button</button>
                          <button className="btn btn-sm text-white" style={{ backgroundColor: company.secondaryColor, border: 'none' }}>Secondary</button>
                       </div>
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

                <div className="row g-4">
                   <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Primary Brand Color</label>
                      <div className="d-flex align-items-center gap-3 p-2 border rounded-3 bg-light bg-opacity-50">
                        <input type="color" className="form-control form-control-color border-0 bg-transparent p-0" 
                               style={{ width: '40px', height: '40px' }} value={company.primaryColor} 
                               onChange={(e) => setCompany({...company, primaryColor: e.target.value})} />
                        <span className="fw-mono small text-uppercase">{company.primaryColor}</span>
                      </div>
                   </div>
                   <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Secondary Accent Color</label>
                      <div className="d-flex align-items-center gap-3 p-2 border rounded-3 bg-light bg-opacity-50">
                        <input type="color" className="form-control form-control-color border-0 bg-transparent p-0" 
                               style={{ width: '40px', height: '40px' }} value={company.secondaryColor} 
                               onChange={(e) => setCompany({...company, secondaryColor: e.target.value})} />
                        <span className="fw-mono small text-uppercase">{company.secondaryColor}</span>
                      </div>
                   </div>
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
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-check2-circle fs-5"></i>
                )}
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
                    <div className="avatar-overlay position-absolute inset-0 w-100 h-100 bg-dark bg-opacity-50 d-flex flex-column align-items-center justify-content-center text-white opacity-0 transition-all rounded-circle"
                         style={{ top: 0, left: 0 }}>
                      <i className="bi bi-camera fs-3 mb-1"></i>
                      <span className="small fw-medium">Change Photo</span>
                    </div>
                  </div>
                </div>
                <h5 className="mb-1 fw-bold">{profile.name}</h5>
                <p className="text-muted small mb-3">{profile.email}</p>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold border border-primary border-opacity-25">
                  <i className="bi bi-shield-check me-1"></i> ADMINISTRATOR
                </span>
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
                <p className="text-muted small mb-0">Manage your password, authentication and active sessions</p>
              </div>
              <button onClick={handleSecuritySubmit} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-shield-lock-fill fs-5"></i>
                )}
                <span className="fw-medium">{loading ? 'Updating...' : 'Update Security'}</span>
              </button>
            </div>

            <div className="row g-4">
              <div className="col-12">
                <div className="card border-light-subtle rounded-4 shadow-none bg-light bg-opacity-25">
                  <div className="card-header bg-transparent border-0 pt-4 px-4">
                    <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                      <i className="bi bi-key text-primary"></i> Password Management
                    </h6>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted text-uppercase">Current Password</label>
                        <div className="input-group">
                          <input type={showPasswords.current ? "text" : "password"} className="form-control border-light-subtle shadow-none bg-white" 
                                 value={security.currentPassword} onChange={(e) => setSecurity({...security, currentPassword: e.target.value})} />
                          <button className="btn btn-outline-light border-light-subtle text-muted" type="button" onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}>
                            <i className={`bi ${showPasswords.current ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">New Password</label>
                        <div className="input-group mb-2">
                          <input type={showPasswords.new ? "text" : "password"} className="form-control border-light-subtle shadow-none bg-white" 
                                 value={security.newPassword} onChange={(e) => setSecurity({...security, newPassword: e.target.value})} />
                          <button className="btn btn-outline-light border-light-subtle text-muted" type="button" onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}>
                            <i className={`bi ${showPasswords.new ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                        <div className="progress" style={{ height: '4px' }}>
                          <div className={`progress-bar ${getPasswordStrength() === 100 ? 'bg-success' : getPasswordStrength() === 60 ? 'bg-warning' : 'bg-danger'}`} 
                               role="progressbar" style={{ width: `${getPasswordStrength()}%` }}></div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">Confirm New Password</label>
                        <div className="input-group">
                          <input type={showPasswords.confirm ? "text" : "password"} className="form-control border-light-subtle shadow-none bg-white" 
                                 value={security.confirmPassword} onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})} />
                          <button className="btn btn-outline-light border-light-subtle text-muted" type="button" onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}>
                            <i className={`bi ${showPasswords.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>
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
                <p className="text-muted small mb-0">Configure regional settings, formats, and system-wide behavior</p>
              </div>
              <button onClick={handleCompanySubmit} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-globe-americas fs-5"></i>
                )}
                <span className="fw-medium">{loading ? 'Saving Settings...' : 'Save General Settings'}</span>
              </button>
            </div>

            <div className="row g-4">
              {/* Localization Group */}
              <div className="col-12">
                <div className="card border-light-subtle rounded-4 shadow-none bg-light bg-opacity-25">
                  <div className="card-header bg-transparent border-0 pt-4 px-4">
                    <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                      <i className="bi bi-geo-alt text-primary"></i> Localization Settings
                    </h6>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-4">
                      {/* Primary Timezone */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Primary Timezone</label>
                        <select className="form-select shadow-none bg-white border-light-subtle" value={company.timezone}
                                onChange={(e) => setCompany({...company, timezone: e.target.value})}>
                          <option value="IST">(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                          <option value="UTC">UTC (Universal Coordinated Time)</option>
                        </select>
                        <div className="form-text x-small">The global timezone for all dates and logs.</div>
                      </div>

                      {/* Date Format */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Date Format</label>
                        <select className="form-select shadow-none bg-white border-light-subtle" value={company.dateFormat}
                                onChange={(e) => setCompany({...company, dateFormat: e.target.value})}>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                        </select>
                        <div className="form-text x-small">Select how dates are displayed across the platform.</div>
                      </div>

                      {/* Time Format */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Time Format</label>
                        <select className="form-select shadow-none bg-white border-light-subtle" value={company.timeFormat}
                                onChange={(e) => setCompany({...company, timeFormat: e.target.value})}>
                          <option value="12-hour">12-hour (01:00 PM)</option>
                          <option value="24-hour">24-hour (13:00)</option>
                        </select>
                        <div className="form-text x-small">Format for time displays and notifications.</div>
                      </div>

                      {/* Week Starts On */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Week Starts On</label>
                        <select className="form-select shadow-none bg-white border-light-subtle" value={company.weekStartsOn}
                                onChange={(e) => setCompany({...company, weekStartsOn: e.target.value})}>
                          <option value="Monday">Monday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                        <div className="form-text x-small">Defines the first day of the week in calendars.</div>
                      </div>

                      {/* Currency Position */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Currency Position</label>
                        <select className="form-select shadow-none bg-white border-light-subtle" value={company.currencyPosition}
                                onChange={(e) => setCompany({...company, currencyPosition: e.target.value})}>
                          <option value="Before Amount">Before Amount (₹1,000)</option>
                          <option value="After Amount">After Amount (1,000₹)</option>
                        </select>
                        <div className="form-text x-small">Where the symbol appears relative to the price.</div>
                      </div>

                      {/* Decimal Places */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Decimal Places</label>
                        <select className="form-select shadow-none bg-white border-light-subtle" value={company.decimalPlaces}
                                onChange={(e) => setCompany({...company, decimalPlaces: parseInt(e.target.value)})}>
                          <option value="0">0 (Fixed)</option>
                          <option value="2">2 (Standard)</option>
                          <option value="3">3 (Precision)</option>
                        </select>
                        <div className="form-text x-small">Number of digits shown after the decimal point.</div>
                      </div>

                      {/* Thousand Separator Style */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Thousand Separator Style</label>
                        <select className="form-select shadow-none bg-white border-light-subtle" value={company.thousandSeparatorStyle}
                                onChange={(e) => setCompany({...company, thousandSeparatorStyle: e.target.value})}>
                          <option value="Indian">Indian (1,00,000)</option>
                          <option value="International">International (100,000)</option>
                        </select>
                        <div className="form-text x-small"> Regional style for grouping large numbers.</div>
                      </div>

                      {/* Default Reminder Time */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Default Reminder Time</label>
                        <select className="form-select shadow-none bg-white border-light-subtle" value={company.defaultReminderTime}
                                onChange={(e) => setCompany({...company, defaultReminderTime: e.target.value})}>
                          <option value="15 minutes">15 minutes</option>
                          <option value="30 minutes">30 minutes</option>
                          <option value="1 hour">1 hour</option>
                          <option value="1 day">1 day</option>
                        </select>
                        <div className="form-text x-small">Initial reminder setting for new tasks and follow-ups.</div>
                      </div>

                      {/* Currency Symbol */}
                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Currency Symbol</label>
                        <select className="form-select shadow-none bg-white border-light-subtle w-50" value={company.currencySymbol}
                                onChange={(e) => setCompany({...company, currencySymbol: e.target.value})}>
                          <option value="INR">₹ (INR)</option>
                          <option value="USD">$ (USD)</option>
                          <option value="EUR">€ (EUR)</option>
                        </select>
                        <div className="form-text x-small">Base currency used for all financial calculations.</div>
                      </div>
                    </div>
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
          <div>
            <h2 className="mb-1 fw-bold text-dark">System Settings</h2>
            <p className="text-muted small mb-0">Customize your workspace and account preferences</p>
          </div>
          {message.text && (
            <div className={`alert alert-${message.type} py-2 px-4 mb-0 shadow-sm border-0 rounded-pill animate-fade-in`} role="alert">
              <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
              {message.text}
            </div>
          )}
        </div>

        <div className="row g-4">
          <div className="col-md-3">
            <div className="card shadow-sm border-light-subtle rounded-4 overflow-hidden mb-4">
              <div className="p-3 bg-white">
                <div className="nav flex-column gap-2">
                  <button className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 transition-all ${activeTab === 'profile' ? 'btn-primary shadow-sm' : 'btn-link text-dark text-decoration-none'}`}
                          onClick={() => setActiveTab('profile')}>
                    <i className={`bi bi-person-circle fs-5 ${activeTab === 'profile' ? 'text-white' : 'text-primary'}`}></i>
                    <span className="fw-medium">My Profile</span>
                  </button>
                  <button className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 transition-all ${activeTab === 'branding' ? 'btn-primary shadow-sm' : 'btn-link text-dark text-decoration-none'}`}
                          onClick={() => setActiveTab('branding')}>
                    <i className={`bi bi-brush fs-5 ${activeTab === 'branding' ? 'text-white' : 'text-primary'}`}></i>
                    <span className="fw-medium">Branding</span>
                  </button>
                  <button className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 transition-all ${activeTab === 'general' ? 'btn-primary shadow-sm' : 'btn-link text-dark text-decoration-none'}`}
                          onClick={() => setActiveTab('general')}>
                    <i className={`bi bi-gear-wide-connected fs-5 ${activeTab === 'general' ? 'text-white' : 'text-primary'}`}></i>
                    <span className="fw-medium">Localization</span>
                  </button>
                  <button className={`btn text-start d-flex align-items-center gap-3 py-3 px-3 rounded-3 transition-all ${activeTab === 'security' ? 'btn-primary shadow-sm' : 'btn-link text-dark text-decoration-none'}`}
                          onClick={() => setActiveTab('security')}>
                    <i className={`bi bi-shield-lock fs-5 ${activeTab === 'security' ? 'text-white' : 'text-primary'}`}></i>
                    <span className="fw-medium">Security</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="card border-0 bg-dark text-white rounded-4 p-4 shadow-sm position-relative overflow-hidden">
               <div className="position-absolute top-0 end-0 p-3 opacity-25">
                  <i className="bi bi-shield-check display-4"></i>
               </div>
               <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-white bg-opacity-25 p-2 me-2">
                     <i className="bi bi-broadcast"></i>
                  </div>
                  <span className="small fw-bold text-uppercase tracking-wider">Status</span>
               </div>
               <p className="small mb-0 opacity-75 lh-base">All systems are online. Last sync: 10:00 AM</p>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card shadow-sm border-light-subtle rounded-4 bg-white">
              <div className="card-body p-5">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .transition-all { transition: all 0.25s ease; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .btn-link:hover { background-color: rgba(13, 110, 253, 0.05); color: #0d6efd !important; }
        .border-end-md { border-right: 1px solid #eee; }
        @media (max-width: 768px) { .border-end-md { border-right: none; } }
        .x-small { font-size: 0.75rem; color: #6c757d; }
        .last-child-mb-0:last-child { margin-bottom: 0 !important; }
      `}} />
    </div>
  );
};

export default Settings;
