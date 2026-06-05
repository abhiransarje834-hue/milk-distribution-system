import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { distributorAPI } from '../../api'
import { toast } from 'react-toastify'

const NAV = [
  { path: '/distributor', icon: '🏠', label: 'Home' },
  { path: '/distributor/customers', icon: '👥', label: 'Customers' },
  { path: '/distributor/delivery-boys', icon: '🚴', label: 'Delivery' },
  { path: '/distributor/billing', icon: '💰', label: 'Billing' },
  { path: '/distributor/milk-prices', icon: '🥛', label: 'Prices' },
  { path: '/distributor/reports', icon: '📊', label: 'Reports' }
]

const EMPTY = { name: '', mobile: '', address: '', username: '', password: '' }

export default function DeliveryBoys() {
  const [boys, setBoys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await distributorAPI.getDeliveryBoys()
      setBoys(data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = b => {
    setEditing(b)
    setForm({ name: b.name, mobile: b.mobile, address: b.address || '', username: b.username || '', password: '' })
    setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await distributorAPI.updateDeliveryBoy(editing.id, form)
      else await distributorAPI.addDeliveryBoy(form)
      toast.success(editing ? 'Updated!' : 'Delivery boy added!')
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Deactivate this delivery boy?')) return
    try {
      await distributorAPI.deleteDeliveryBoy(id)
      toast.success('Deactivated')
      load()
    } catch { toast.error('Failed') }
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Layout navItems={NAV} title="Delivery Boys">
      <div className="page-header">
        <h1 className="page-title">Delivery Boys ({boys.length})</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add</button>
      </div>

      {loading ? <Spinner /> : boys.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚴</div>
          <p>No delivery boys yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {boys.map(b => (
            <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, flexShrink: 0
              }}>
                {b.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{b.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📱 {b.mobile}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{b.username}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className={`badge ${b.active ? 'badge-success' : 'badge-danger'}`}>
                  {b.active ? 'Active' : 'Inactive'}
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>Edit</button>
                {b.active && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Delivery Boy' : 'Add Delivery Boy'}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input value={form.name} onChange={f('name')} required />
            </div>
            <div className="form-group">
              <label>Mobile *</label>
              <input value={form.mobile} onChange={f('mobile')} required />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={f('address')} />
          </div>
          {!editing && (
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input value={form.username} onChange={f('username')} required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" value={form.password} onChange={f('password')} required />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
