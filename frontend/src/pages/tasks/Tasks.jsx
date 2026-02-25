import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    subject: '',
    relatedTo: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Normal',
    status: 'Pending'
  });

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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/tasks', newTask);
      setTasks([...tasks, response.data]);
      setShowModal(false);
      setNewTask({ subject: '', relatedTo: '', assignedTo: '', dueDate: '', priority: 'Normal', status: 'Pending' });
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task.');
    }
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

  const todayTasks = tasks.filter(t => t.status !== 'Completed').length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
  const completedToday = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold text-dark">Task Management</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body py-4 text-center">
              <h6 className="text-uppercase opacity-75 mb-2">Active Tasks</h6>
              <h2 className="mb-0 fw-bold">{todayTasks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-danger text-white">
            <div className="card-body py-4 text-center">
              <h6 className="text-uppercase opacity-75 mb-2">Overdue</h6>
              <h2 className="mb-0 fw-bold">{overdueTasks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-success text-white">
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
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Subject</th>
                  <th>Related To</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className={t.status === 'Completed' ? 'text-decoration-line-through text-muted' : 'fw-medium'}>
                        {t.subject}
                      </div>
                      <span className={`badge ${t.priority === 'High' ? 'bg-danger-subtle text-danger' : t.priority === 'Medium' ? 'bg-warning-subtle text-warning' : 'bg-info-subtle text-info'} x-small`} style={{fontSize: '0.7em'}}>
                        {t.priority}
                      </span>
                    </td>
                    <td>{t.relatedTo}</td>
                    <td>{t.assignedTo}</td>
                    <td>{t.dueDate}</td>
                    <td>
                      <span className={`badge ${
                        t.status === 'Completed' ? 'bg-success' : 
                        t.status === 'Overdue' ? 'bg-danger' : 
                        'bg-warning'
                      }`}>{t.status}</span>
                    </td>
                    <td>
                      <button 
                        className={`btn btn-sm ${t.status === 'Completed' ? 'btn-success' : 'btn-outline-success'} me-1`} 
                        title="Toggle Status"
                        onClick={() => toggleComplete(t.id)}
                      >
                        <i className={`bi ${t.status === 'Completed' ? 'bi-check-all' : 'bi-check'}`}></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => deleteTask(t.id)}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Schedule New Task</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Task Subject</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Call Client for Approval"
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Related To</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Beta Ltd"
                        value={newTask.relatedTo}
                        onChange={(e) => setNewTask({ ...newTask, relatedTo: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Assignee</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Name"
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        required 
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Due Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Priority</label>
                      <select 
                        className="form-select"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">Save Task</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
