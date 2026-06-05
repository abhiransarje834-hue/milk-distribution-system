import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { adminAPI } from '../../api'
import { toast } from 'react-toastify'

const NAV = [
  { path: '/admin', icon: '🏠', label: 'Dashboard' },
  { path: '/settings', icon: '⚙️', label: 'Settings' }
]

export default function AdminDashboard() {
  const [distributors, setDistributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', mobile: '', address: '', username: '', password: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await adminAPI.getDistributors()
      setDistributors(data.content || [])
    } catch { toast.error('Failed to load distributors') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.addDistributor(form)
      toast.success('Distributor added!')
      setShowAdd(false)
      setForm({ name: '', mobile: '', address: '', username: '', password: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add distributor')
    } finally { setSaving(false) }
  }

  const handleStatus = async (id, status) => {
    try {
      await adminAPI.updateStatus(id, status)
      toast.success('Status updated')
      load()
    } catch { toast.error('Failed to update status') }
  }

  const statusBadge = s => {
    const map = { PENDING: 'badge-warning', APPROVED: 'badge-info', ACTIVE: 'badge-success', INACTIVE: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  return (
    <Layout navItems={NAV} title="Admin Dashboard">
      <div className="page-header">
        <h1 className="page-title">Distributors</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Distributor</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))' }}>
        <div className="stat-card">
          <span className="stat-icon">🏪</span>
          <span className="stat-value">{distributors.length}</span>
          <span className="stat-label">Total Distributors</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{distributors.filter(d => d.status === 'ACTIVE').length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <span className="stat-value">{distributors.filter(d => d.status === 'PENDING').length}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Username</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {distributors.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-icon">🏪</div>
                    <p>No distributors yet</p>
                  </div>
                </td></tr>
              ) : distributors.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong><br /><small style={{ color: 'var(--text-secondary)' }}>{d.address}</small></td>
                  <td>{d.mobile}</td>
                  <td>{d.username}</td>
                  <td>{statusBadge(d.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {d.status === 'PENDING' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleStatus(d.id, 'APPROVED')}>Approve</button>
                      )}
                      {d.status === 'APPROVED' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatus(d.id, 'ACTIVE')}>Activate</button>
                      )}
                      {d.status === 'ACTIVE' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatus(d.id, 'INACTIVE')}>Deactivate</button>
                      )}
                      {d.status === 'INACTIVE' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleStatus(d.id, 'ACTIVE')}>Activate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Distributor">
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Mobile *</label>
              <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Adding...' : 'Add Distributor'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
