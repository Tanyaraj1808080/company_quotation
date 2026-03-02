import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [newTask, setNewTask] = useState({
    subject: '',
    description: '',
    relatedType: '',
    relatedId: '',
    assignedTo: '',
    dueAt: '',
    priority: 'Medium',
    status: 'Pending',
    reminderEnabled: false,
    reminderAt: '',
    attachments: []
  });

  // Local Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    
    if (!newTask.subject) newErrors.subject = "Subject is required";
    if (!newTask.assignedTo) newErrors.assignedTo = "Assignee is required";
    
    if (newTask.dueAt) {
      const dueDate = new Date(newTask.dueAt);
      if (dueDate < now) {
        newErrors.dueAt = "Due date cannot be in the past";
      }
    }

    if (newTask.reminderEnabled && newTask.reminderAt) {
      const reminderDate = new Date(newTask.reminderAt);
      const dueDate = new Date(newTask.dueAt);
      
      if (newTask.dueAt && reminderDate >= dueDate) {
        newErrors.reminderAt = "Reminder must be before due date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const taskData = {
        ...newTask,
        attachments: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      };

      const response = await axios.post('/api/tasks', taskData);
      setTasks([...tasks, response.data]);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task.');
    }
  };

  const resetForm = () => {
    setNewTask({
      subject: '',
      description: '',
      relatedType: '',
      relatedId: '',
      assignedTo: '',
      dueAt: '',
      priority: 'Medium',
      status: 'Pending',
      reminderEnabled: false,
      reminderAt: '',
      attachments: []
    });
    setErrors({});
    setSelectedFiles([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await axios.patch(`/api/tasks/${id}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${id}`);
        setTasks(tasks.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Date Filtering Helper
  const isWithinThisWeek = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return date >= startOfWeek && date <= endOfWeek;
  };

  // Unique Assignees for Filter
  const assignees = [...new Set(tasks.map(t => t.assignedTo).filter(Boolean))];

  // Filtering Logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.relatedTo && t.relatedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Active' ? t.status !== 'Completed' :
      t.status === statusFilter;

    const matchesAssignee = 
      assigneeFilter === 'All' ? true :
      t.assignedTo === assigneeFilter;

    const today = new Date().toISOString().split('T')[0];
    const taskDate = (t.dueAt || t.dueDate || '').split('T')[0];
    const matchesDate = 
      dateFilter === 'All' ? true :
      dateFilter === 'Today' ? taskDate === today :
      dateFilter === 'This Week' ? isWithinThisWeek(t.dueAt || t.dueDate) : true;

    return matchesSearch && matchesStatus && matchesAssignee && matchesDate;
  });

  const todayTasks = tasks.filter(t => t.status !== 'Completed').length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
  const completedToday = tasks.filter(t => t.status === 'Completed').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold text-dark">Task Management</h2>

      <div className="row mb-4">
        <div className="col-md-4" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(statusFilter === 'Active' ? 'All' : 'Active')}>
          <div className={`card shadow-sm border-0 bg-primary text-white transition-all ${statusFilter === 'Active' ? 'shadow-lg border border-white' : ''}`} style={{ transition: 'all 0.2s' }}>
            <div className="card-body py-4 text-center">
              <h6 className="text-uppercase opacity-75 mb-2">Active Tasks</h6>
              <h2 className="mb-0 fw-bold">{todayTasks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(statusFilter === 'Overdue' ? 'All' : 'Overdue')}>
          <div className={`card shadow-sm border-0 bg-danger text-white transition-all ${statusFilter === 'Overdue' ? 'shadow-lg border border-white' : ''}`} style={{ transition: 'all 0.2s' }}>
            <div className="card-body py-4 text-center">
              <h6 className="text-uppercase opacity-75 mb-2">Overdue</h6>
              <h2 className="mb-0 fw-bold">{overdueTasks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed')}>
          <div className={`card shadow-sm border-0 bg-success text-white transition-all ${statusFilter === 'Completed' ? 'shadow-lg border border-white' : ''}`} style={{ transition: 'all 0.2s' }}>
            <div className="card-body py-4 text-center">
              <h6 className="text-uppercase opacity-75 mb-2">Completed</h6>
              <h2 className="mb-0 fw-bold">{completedToday}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Daily Tasks</h5>
          <div>
            <button className="btn btn-primary btn-sm px-3" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Create Task
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Local Filters Row */}
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0 shadow-none" 
                  placeholder="Search tasks..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm shadow-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm shadow-none" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
                <option value="All">All Assignees</option>
                {assignees.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm shadow-none" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
              </select>
            </div>
            <div className="col-md-2 text-end">
              <button 
                className="btn btn-sm btn-outline-secondary w-100 shadow-none" 
                onClick={() => {
                  setSearchTerm(''); 
                  setStatusFilter('All');
                  setAssigneeFilter('All');
                  setDateFilter('All');
                }}
                disabled={searchTerm === '' && statusFilter === 'All' && assigneeFilter === 'All' && dateFilter === 'All'}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>Reset
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Subject</th>
                  <th>Related To</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Due At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No tasks match your filters.</td></tr>
                ) : (
                  filteredTasks.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div className={t.status === 'Completed' ? 'text-decoration-line-through text-muted' : 'fw-medium'}>
                          {t.subject}
                        </div>
                        {t.description && <small className="text-muted d-block text-truncate" style={{maxWidth: '200px'}}>{t.description}</small>}
                      </td>
                      <td>
                        {t.relatedType ? (
                          <span className="badge bg-light text-dark border">
                            {t.relatedType}: {t.relatedId || 'N/A'}
                          </span>
                        ) : (t.relatedTo || '-')}
                      </td>
                      <td>{t.assignedTo}</td>
                      <td>
                        <span className={`badge ${
                          t.priority === 'High' ? 'bg-danger' : 
                          t.priority === 'Medium' || t.priority === 'Normal' ? 'bg-warning text-dark' : 
                          'bg-success'
                        }`}>
                          {t.priority === 'Normal' ? 'Medium' : t.priority || 'Medium'}
                        </span>
                      </td>
                      <td>{formatDate(t.dueAt || t.dueDate)}</td>
                      <td>
                        <span className={`badge ${
                          t.status === 'Completed' ? 'bg-success' : 
                          t.status === 'Overdue' ? 'bg-danger' : 
                          'bg-warning'
                        }`}>{t.status}</span>
                      </td>
                      <td>
                        <button 
                          className={`btn btn-sm ${t.status === 'Completed' ? 'btn-success' : 'btn-outline-success'} me-1 shadow-none`} 
                          onClick={() => toggleComplete(t.id)}
                        >
                          <i className={`bi ${t.status === 'Completed' ? 'bi-check-all' : 'bi-check'}`}></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger shadow-none" onClick={() => deleteTask(t.id)}><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Create Task Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-white border-bottom py-3">
                <h5 className="modal-title fw-bold text-dark"><i className="bi bi-calendar-plus me-2 text-primary"></i>New Task Assignment</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    {/* Basic Info */}
                    <div className="col-12">
                      <label className="form-label small fw-bold">Task Subject <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className={`form-control shadow-none ${errors.subject ? 'is-invalid' : ''}`}
                        placeholder="What needs to be done?"
                        value={newTask.subject}
                        onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      />
                      {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Description / Notes</label>
                      <textarea 
                        className="form-control shadow-none" 
                        rows="3"
                        placeholder="Add additional details here..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      ></textarea>
                    </div>

                    {/* Related Entities */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Related To</label>
                      <select 
                        className="form-select shadow-none"
                        value={newTask.relatedType}
                        onChange={(e) => setNewTask({ ...newTask, relatedType: e.target.value, relatedId: '' })}
                      >
                        <option value="">None</option>
                        <option value="Client">Client</option>
                        <option value="Lead">Lead</option>
                        <option value="Opportunity">Opportunity</option>
                        <option value="Quotation">Quotation</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Meeting">Meeting</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Related ID / Reference</label>
                      <input 
                        type="text" 
                        className="form-control shadow-none"
                        placeholder="e.g. Q-001 or Lead Name"
                        disabled={!newTask.relatedType}
                        value={newTask.relatedId}
                        onChange={(e) => setNewTask({ ...newTask, relatedId: e.target.value })}
                      />
                    </div>

                    {/* Assignee & Priority */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Assignee <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className={`form-control shadow-none ${errors.assignedTo ? 'is-invalid' : ''}`}
                        placeholder="Who is responsible?"
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      />
                      {errors.assignedTo && <div className="invalid-feedback">{errors.assignedTo}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Priority</label>
                      <select 
                        className="form-select shadow-none"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    {/* Schedule */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Due Date & Time</label>
                      <input 
                        type="datetime-local" 
                        className={`form-control shadow-none ${errors.dueAt ? 'is-invalid' : ''}`}
                        value={newTask.dueAt}
                        onChange={(e) => setNewTask({ ...newTask, dueAt: e.target.value })}
                      />
                      {errors.dueAt && <div className="invalid-feedback">{errors.dueAt}</div>}
                    </div>

                    {/* Reminder Logic */}
                    <div className="col-md-6 d-flex align-items-end">
                      <div className="form-check form-switch mb-2">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="reminderSwitch"
                          checked={newTask.reminderEnabled}
                          onChange={(e) => setNewTask({ ...newTask, reminderEnabled: e.target.checked })}
                        />
                        <label className="form-check-label small fw-bold" htmlFor="reminderSwitch">Enable Reminder</label>
                      </div>
                    </div>

                    {newTask.reminderEnabled && (
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-primary">Set Reminder Time</label>
                        <input 
                          type="datetime-local" 
                          className={`form-control shadow-none border-primary ${errors.reminderAt ? 'is-invalid' : ''}`}
                          value={newTask.reminderAt}
                          onChange={(e) => setNewTask({ ...newTask, reminderAt: e.target.value })}
                        />
                        {errors.reminderAt && <div className="invalid-feedback">{errors.reminderAt}</div>}
                      </div>
                    )}

                    {/* Attachments */}
                    <div className="col-12 mt-2">
                      <label className="form-label small fw-bold">Attachments</label>
                      <div className="border rounded p-3 bg-light text-center">
                        <input 
                          type="file" 
                          className="d-none" 
                          id="fileInput" 
                          multiple 
                          onChange={handleFileChange}
                        />
                        <label htmlFor="fileInput" className="btn btn-sm btn-outline-primary px-4 mb-2">
                          <i className="bi bi-cloud-upload me-2"></i>Select Files
                        </label>
                        <div className="text-muted small">You can upload multiple documents or images</div>
                      </div>
                      
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 d-flex flex-wrap gap-2">
                          {selectedFiles.map((file, idx) => (
                            <div key={idx} className="badge bg-white text-dark border p-2 d-flex align-items-center">
                              <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                              {file.name}
                              <button type="button" className="btn-close ms-2" style={{fontSize: '0.6rem'}} onClick={() => removeFile(idx)}></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light p-3">
                  <button type="button" className="btn btn-secondary btn-sm px-4" onClick={() => setShowModal(false)}>Discard</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">Create Task Assignment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .transition-all:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; }
        .is-invalid { border-color: #dc3545 !important; }
        .form-control:focus, .form-select:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1) !important; }
      `}} />
    </div>
  );
};

export default Tasks;
