import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { deliveryAPI } from '../../api'
import { toast } from 'react-toastify'

const NAV = [
  { path: '/delivery', icon: '🏠', label: 'Home' },
  { path: '/delivery/entry', icon: '🥛', label: 'Delivery' },
  { path: '/delivery/customers', icon: '👥', label: 'Customers' },
  { path: '/settings', icon: '⚙️', label: 'Settings' }
]

const EMPTY = { name: '', mobile: '', address: '', milkType: 'COW', defaultQuantity: '1' }

export default function MyCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await deliveryAPI.getMyCustomers()
      setCustomers(data || [])
    } catch { toast.error('Failed to load customers') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await deliveryAPI.addMyCustomer({ ...form, defaultQuantity: parseFloat(form.defaultQuantity) })
      toast.success('Customer added!')
      setShowModal(false)
      setForm(EMPTY)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer')
    } finally { setSaving(false) }
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Layout navItems={NAV} title="My Customers">
      <div className="page-header">
        <h1 className="page-title">My Customers ({customers.length})</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>

      {loading ? <Spinner /> : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>No customers assigned yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {customers.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, flexShrink: 0
              }}>
                {c.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📱 {c.mobile}</div>
                {c.address && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📍 {c.address}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${c.milkType === 'COW' ? 'badge-info' : 'badge-warning'}`}>
                  {c.milkType === 'COW' ? '🐄 Cow' : '🐃 Buffalo'}
                </span>
                <div style={{ fontSize: 13, marginTop: 4 }}>{c.defaultQuantity}L/day</div>
                {c.pendingBalance > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
                    ₹{Number(c.pendingBalance).toFixed(0)} pending
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Customer">
        <form onSubmit={handleAdd}>
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
          <div className="form-row">
            <div className="form-group">
              <label>Milk Type</label>
              <select value={form.milkType} onChange={f('milkType')}>
                <option value="COW">🐄 Cow Milk</option>
                <option value="BUFFALO">🐃 Buffalo Milk</option>
              </select>
            </div>
            <div className="form-group">
              <label>Default Qty (L)</label>
              <input type="number" step="0.5" min="0.5" value={form.defaultQuantity} onChange={f('defaultQuantity')} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
