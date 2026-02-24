import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const UsersRoles = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  // Form State - User
  const [userForm, setUserForm] = useState({ name: '', email: '', roleId: '', status: 'Active' });
  // Form State - Role
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] });

  const permissionsList = [
    { id: 'quotation_view', label: 'View Quotations' },
    { id: 'quotation_create', label: 'Create Quotations' },
    { id: 'quotation_approve', label: 'Approve Quotations' },
    { id: 'lead_manage', label: 'Manage Leads' },
    { id: 'invoice_manage', label: 'Manage Invoices' },
    { id: 'report_view', label: 'View Reports' },
    { id: 'system_admin', label: 'System Admin Access' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Effect to handle query parameters for modals
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    
    if (action === 'add-user') {
      setShowUserModal(true);
      setShowRoleModal(false);
    } else if (action === 'add-role') {
      setShowRoleModal(true);
      setShowUserModal(false);
    }
  }, [location.search]);

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
      alert('Failed to fetch data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/users`, userForm);
      setUsers([...users, res.data]);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', roleId: '', status: 'Active' });
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error.response?.data?.message || 'Error adding user');
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/roles`, roleForm);
      setRoles([...roles, res.data]);
      setShowRoleModal(false);
      setRoleForm({ name: '', description: '', permissions: [] });
    } catch (error) {
      console.error('Error adding role:', error);
      alert(error.response?.data?.message || 'Error adding role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`${API_URL}/roles/${id}`);
        setRoles(roles.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const togglePermission = (permId) => {
    const current = [...roleForm.permissions];
    if (current.includes(permId)) {
      setRoleForm({ ...roleForm, permissions: current.filter(p => p !== permId) });
    } else {
      setRoleForm({ ...roleForm, permissions: [...current, permId] });
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-4 text-center">Loading users and roles...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-dark">Users & Roles Management</h2>
      </div>

      {/* User List Card */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">User List</h5>
          <div className="d-flex gap-2">
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Search user..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '250px' }}
            />
            <button className="btn btn-sm btn-primary shadow-sm" onClick={() => setShowUserModal(true)}>
              <i className="bi bi-person-plus me-1"></i> Add User
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-medium">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge bg-light text-dark border">{user.Role?.name || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge ${user.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary me-1"><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(user.id)}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Roles Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Roles & Permissions</h5>
          <button className="btn btn-sm btn-outline-primary shadow-sm" onClick={() => setShowRoleModal(true)}>
            <i className="bi bi-person-gear me-1"></i> Add Role
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Role Name</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id}>
                    <td className="ps-4 fw-bold text-primary">{role.name}</td>
                    <td className="text-muted small">{role.description}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {role.permissions?.length > 0 ? (
                          role.permissions.includes('all') ? 
                          <span className="badge bg-dark">All Access</span> :
                          role.permissions.map(p => (
                            <span key={p} className="badge bg-light text-dark border-0 small" style={{fontSize: '10px'}}>{p.replace('_', ' ').toUpperCase()}</span>
                          ))
                        ) : <span className="text-muted small italic">None</span>}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary me-1"><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRole(role.id)}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowUserModal(false)}></button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      required 
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select 
                      className="form-select" 
                      required 
                      value={userForm.roleId}
                      onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                    >
                      <option value="">Select a role...</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-select" 
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Role</h5>
                <button type="button" className="btn-close" onClick={() => setShowRoleModal(false)}></button>
              </div>
              <form onSubmit={handleAddRole}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Role Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      placeholder="e.g. Regional Manager"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label d-block">Permissions</label>
                    <div className="row g-2">
                      {permissionsList.map(perm => (
                        <div className="col-md-6" key={perm.id}>
                          <div className="form-check border rounded p-2">
                            <input 
                              className="form-check-input ms-0 me-2" 
                              type="checkbox" 
                              id={perm.id}
                              checked={roleForm.permissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                            />
                            <label className="form-check-label w-100" htmlFor={perm.id}>
                              {perm.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Role</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersRoles;
