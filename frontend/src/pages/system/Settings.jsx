import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const Settings = () => {
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form States
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+91 9876543210',
    avatar: null
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    quotationUpdates: true,
    newLeads: true
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
  }, [location.search]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage('Image size should be less than 2MB', 'danger');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
        showMessage('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    showMessage('Profile updated successfully!');
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

  const handleNotificationSave = () => {
    showMessage('Notification preferences saved!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Profile Settings</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileSubmit}>
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="d-none" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                    <div 
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center overflow-hidden border" 
                      style={{ width: '100px', height: '100px', fontSize: '2rem' }}
                    >
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <span className="text-muted">{profile.name.charAt(0)}</span>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '30px', height: '30px' }}
                      onClick={handleImageClick}
                    >
                      <i className="bi bi-camera"></i>
                    </button>
                  </div>
                  <p className="mt-2 small text-muted">Click camera to upload</p>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-2">Update Profile</button>
              </form>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Notification Preferences</h5>
            </div>
            <div className="card-body">
              <h6 className="mb-3 text-muted">Delivery Channels</h6>
              <div className="list-group list-group-flush mb-4">
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <div className="fw-bold">Email Notifications</div>
                    <small className="text-muted">Receive updates via your registered email</small>
                  </div>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    />
                  </div>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <div className="fw-bold">Push Notifications</div>
                    <small className="text-muted">Receive alerts on your browser or device</small>
                  </div>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    />
                  </div>
                </div>
              </div>

              <h6 className="mb-3 text-muted">System Events</h6>
              <div className="list-group list-group-flush mb-4">
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <div className="fw-bold">Quotation Updates</div>
                    <small className="text-muted">When a quotation is approved or rejected</small>
                  </div>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={notifications.quotationUpdates}
                      onChange={(e) => setNotifications({...notifications, quotationUpdates: e.target.checked})}
                    />
                  </div>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <div className="fw-bold">New Leads</div>
                    <small className="text-muted">When a new lead is assigned to you</small>
                  </div>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={notifications.newLeads}
                      onChange={(e) => setNotifications({...notifications, newLeads: e.target.checked})}
                    />
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleNotificationSave}>Save Preferences</button>
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
                    <input 
                      type="password" 
                      className="form-control" 
                      required
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      required
                      value={security.newPassword}
                      onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      required
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
                <hr />
                <div className="mb-0">
                  <h6 className="text-muted mb-3">Two-Factor Authentication</h6>
                  <p className="small text-muted mb-3">Add an extra layer of security to your account by enabling 2FA.</p>
                  <button type="button" className="btn btn-outline-primary btn-sm">Enable 2FA</button>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn btn-primary">Update Security Settings</button>
                </div>
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
              <form>
                <div className="mb-3">
                  <label className="form-label">Organization Name</label>
                  <input type="text" className="form-control" defaultValue="Mindmanthan Software Solutions" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Primary Timezone</label>
                  <select className="form-select" defaultValue="IST">
                    <option value="IST">(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Currency Symbol</label>
                  <select className="form-select" defaultValue="INR">
                    <option value="INR">₹ (INR)</option>
                    <option value="USD">$ (USD)</option>
                    <option value="EUR">€ (EUR)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Save General Settings</button>
              </form>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Settings</h2>
        {message.text && (
          <div className={`alert alert-${message.type} py-2 px-3 mb-0`} role="alert">
            {message.text}
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 mb-4">
            <div className="list-group list-group-flush rounded">
              <button 
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === 'general' ? 'active bg-primary' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="bi bi-sliders me-2"></i> General
              </button>
              <button 
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === 'profile' ? 'active bg-primary' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-person me-2"></i> Profile
              </button>
              <button 
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === 'notifications' ? 'active bg-primary' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="bi bi-bell me-2"></i> Notifications
              </button>
              <button 
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === 'security' ? 'active bg-primary' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="bi bi-shield-lock me-2"></i> Security
              </button>
            </div>
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
