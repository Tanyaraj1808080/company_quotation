import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

const UsersRoles = () => {
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Form State - User
  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    roleId: '', 
    status: 'Active',
    password: '',
    avatar: null 
  });

  // Form State - Role
  const [roleForm, setRoleForm] = useState({ 
    name: '', 
    description: '', 
    permissions: [] 
  });

  const permissionModules = ['Sales', 'Clients', 'Quotations', 'Finance', 'Reports', 'System'];
  const permissionActions = ['View', 'Create', 'Edit', 'Delete', 'Approve'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    
    if (action === 'add-user') openUserModal();
    else if (action === 'add-role') openRoleModal();
  }, [location.search]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/roles`)
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to fetch data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentId(user.id);
      setUserForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        roleId: user.roleId,
        status: user.status,
        password: '',
        avatar: user.avatar || null
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setUserForm({ name: '', email: '', phone: '', roleId: '', status: 'Active', password: '', avatar: null });
    }
    setShowUserModal(true);
  };

  const openRoleModal = (role = null) => {
    if (role) {
      setIsEditing(true);
      setCurrentId(role.id);
      let perms = [];
      try { perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : (role.permissions || []); } catch (e) {}
      setRoleForm({ name: role.name, description: role.description || '', permissions: perms });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setRoleForm({ name: '', description: '', permissions: [] });
    }
    setShowRoleModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      if (isEditing) {
        const res = await axios.patch(`${API_URL}/users/${currentId}`, userForm);
        setUsers(users.map(u => u.id === currentId ? res.data : u));
        showToast('User updated successfully');
      } else {
        const res = await axios.post(`${API_URL}/users`, userForm);
        setUsers([...users, res.data]);
        showToast('User added successfully');
      }
      setShowUserModal(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'danger');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      if (isEditing) {
        const res = await axios.patch(`${API_URL}/roles/${currentId}`, roleForm);
        setRoles(roles.map(r => r.id === currentId ? res.data : r));
        showToast('Role updated successfully');
      } else {
        const res = await axios.post(`${API_URL}/roles`, roleForm);
        setRoles([...roles, res.data]);
        showToast('Role created successfully');
      }
      setShowRoleModal(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'danger');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
        showToast('User deleted');
      } catch (error) { showToast('Delete failed', 'danger'); }
    }
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`${API_URL}/roles/${id}`);
        setRoles(roles.filter(r => r.id !== id));
        showToast('Role deleted');
      } catch (error) { showToast('Delete failed', 'danger'); }
    }
  };

  const togglePermission = (module, action) => {
    const permKey = `${module.toLowerCase()}_${action.toLowerCase()}`;
    const current = [...roleForm.permissions];
    if (current.includes(permKey)) setRoleForm({ ...roleForm, permissions: current.filter(p => p !== permKey) });
    else setRoleForm({ ...roleForm, permissions: [...current, permKey] });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.Role?.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="d-flex justify-content-center align-items-center min-vh-100"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="p-4 bg-light min-vh-100">
      {toast.show && (
        <div className={`alert alert-${toast.type} position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg z-3`}>
          <i className={`bi bi-${toast.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {toast.message}
        </div>
      )}

      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Users & Access Control</h2>
        <p className="text-muted small">Manage system users, roles and granular permissions.</p>
      </div>

      <div className="row g-4">
        {/* User Management Section */}
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <h5 className="mb-0 fw-bold"><i className="bi bi-people me-2 text-primary"></i>Users</h5>
              <div className="d-flex flex-wrap gap-2">
                <input type="text" className="form-control form-control-sm rounded-pill px-3" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '200px' }} />
                <select className="form-select form-select-sm rounded-pill" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '140px' }}>
                  <option value="All">All Roles</option>
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
                <button className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" onClick={() => openUserModal()}><i className="bi bi-plus-lg"></i> Add User</button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 py-3 small fw-bold text-uppercase text-muted">User</th>
                      <th className="py-3 small fw-bold text-uppercase text-muted">Email</th>
                      <th className="py-3 small fw-bold text-uppercase text-muted">Role</th>
                      <th className="py-3 small fw-bold text-uppercase text-muted">Status</th>
                      <th className="pe-4 py-3 text-end small fw-bold text-uppercase text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="transition-all">
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold overflow-hidden" style={{ width: '40px', height: '40px' }}>
                              {user.avatar ? <img src={user.avatar} className="w-100 h-100 object-fit-cover" alt="" /> : user.name.charAt(0).toUpperCase()}
                            </div>
                            <div><div className="fw-bold text-dark">{user.name}</div><div className="text-muted x-small">{user.phone || 'No phone'}</div></div>
                          </div>
                        </td>
                        <td><span className="text-dark small">{user.email}</span></td>
                        <td><span className="badge bg-light text-primary border border-primary border-opacity-10 rounded-pill px-3">{user.Role?.name || 'No Role'}</span></td>
                        <td><span className={`badge rounded-pill px-3 ${user.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>{user.status}</span></td>
                        <td className="text-end pe-4">
                          <button className="btn btn-light btn-sm rounded-circle me-1" onClick={() => openUserModal(user)}><i className="bi bi-pencil text-primary"></i></button>
                          <button className="btn btn-light btn-sm rounded-circle" onClick={() => handleDeleteUser(user.id)}><i className="bi bi-trash text-danger"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold"><i className="bi bi-shield-lock me-2 text-primary"></i>Roles</h5>
              <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => openRoleModal()}><i className="bi bi-plus-lg"></i> New Role</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 py-3 small fw-bold text-uppercase text-muted">Role Name</th>
                      <th className="py-3 small fw-bold text-uppercase text-muted">Description</th>
                      <th className="pe-4 py-3 text-end small fw-bold text-uppercase text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map(role => (
                      <tr key={role.id}>
                        <td className="ps-4 fw-bold text-primary">{role.name}</td>
                        <td className="small text-muted">{role.description || 'N/A'}</td>
                        <td className="text-end pe-4">
                          <button className="btn btn-light btn-sm rounded-circle me-1" onClick={() => openRoleModal(role)}><i className="bi bi-pencil text-primary"></i></button>
                          <button className="btn btn-light btn-sm rounded-circle" onClick={() => handleDeleteRole(role.id)}><i className="bi bi-trash text-danger"></i></button>
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

      {/* User Modal with Profile Image Option */}
      {showUserModal && (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{isEditing ? 'Edit User' : 'Add New User'}</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowUserModal(false)}></button>
              </div>
              <form onSubmit={handleUserSubmit}>
                <div className="modal-body py-4">
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <div className="bg-light rounded-circle border-4 border-white shadow-sm overflow-hidden d-flex align-items-center justify-content-center" 
                           style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                           onClick={() => fileInputRef.current.click()}>
                        {userForm.avatar ? <img src={userForm.avatar} className="w-100 h-100 object-fit-cover" alt="" /> : <i className="bi bi-person-fill display-4 text-muted"></i>}
                      </div>
                      <button type="button" onClick={() => fileInputRef.current.click()} className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-1 shadow">
                        <i className="bi bi-camera-fill" style={{ fontSize: '12px' }}></i>
                      </button>
                      <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleImageChange} />
                    </div>
                    <p className="small text-muted mt-2">Click to {userForm.avatar ? 'change' : 'upload'} profile picture</p>
                  </div>

                  <div className="row g-3">
                    <div className="col-12"><label className="form-label small fw-bold text-muted">Full Name</label><input type="text" className="form-control rounded-3 shadow-none bg-light" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold text-muted">Email Address</label><input type="email" className="form-control rounded-3 shadow-none bg-light" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold text-muted">Phone Number</label><input type="text" className="form-control rounded-3 shadow-none bg-light" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Role</label>
                      <select className="form-select rounded-3 shadow-none bg-light" required value={userForm.roleId} onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}>
                        <option value="">Select Role</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Status</label>
                      <select className="form-select rounded-3 shadow-none bg-light" value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}>
                        <option value="Active">Active</option><option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12"><label className="form-label small fw-bold text-muted">Password {isEditing && '(Optional)'}</label><input type="password" placeholder={isEditing ? 'Leave blank to keep current' : '••••••••'} className="form-control rounded-3 shadow-none bg-light" required={!isEditing} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowUserModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm" disabled={btnLoading}>
                    {btnLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg me-2"></i>}
                    {isEditing ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{isEditing ? 'Edit Role' : 'Create New Role'}</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowRoleModal(false)}></button>
              </div>
              <form onSubmit={handleRoleSubmit}>
                <div className="modal-body py-4">
                  <div className="mb-4"><label className="form-label small fw-bold text-muted">Role Name</label><input type="text" className="form-control rounded-3 shadow-none bg-light" required placeholder="e.g. Sales Executive" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} /></div>
                  <div className="mb-4"><label className="form-label small fw-bold text-muted">Description</label><textarea className="form-control rounded-3 shadow-none bg-light" rows="2" placeholder="Describe role duties" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}></textarea></div>
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">Permission Matrix</label>
                  <div className="border rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                      <table className="table table-bordered mb-0 align-middle">
                        <thead className="bg-light text-center small fw-bold"><tr><th className="py-2 text-start ps-3" style={{ width: '150px' }}>Module</th>{permissionActions.map(action => <th key={action} className="py-2">{action}</th>)}</tr></thead>
                        <tbody>{permissionModules.map(module => (<tr key={module}><td className="ps-3 fw-bold small text-dark">{module}</td>{permissionActions.map(action => { const permKey = `${module.toLowerCase()}_${action.toLowerCase()}`; if (module !== 'Quotations' && action === 'Approve') return <td key={action} className="bg-light-subtle"></td>; return (<td key={action} className="text-center"><input className="form-check-input shadow-none cursor-pointer" type="checkbox" checked={roleForm.permissions.includes(permKey)} onChange={() => togglePermission(module, action)} /></td>); })}</tr>))}</tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowRoleModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm" disabled={btnLoading}>{btnLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg me-2"></i>}{isEditing ? 'Save Changes' : 'Create Role'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .transition-all { transition: all 0.2s ease-in-out; }
        .transition-all:hover { background-color: rgba(13, 110, 253, 0.02); }
        .x-small { font-size: 0.75rem; }
        .cursor-pointer { cursor: pointer; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default UsersRoles;
