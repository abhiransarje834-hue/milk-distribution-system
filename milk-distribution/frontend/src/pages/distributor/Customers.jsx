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

const EMPTY_FORM = { name: '', mobile: '', address: '', milkType: 'COW', defaultQuantity: '1', deliveryBoyId: '' }
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Customers() {
  const now = new Date()
  const [customers, setCustomers] = useState([])
  const [deliveryBoys, setDeliveryBoys] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Detail modal
  const [detailCustomer, setDetailCustomer] = useState(null)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [detailMonth, setDetailMonth] = useState(now.getMonth() + 1)
  const [detailYear, setDetailYear] = useState(now.getFullYear())
  const [detailTab, setDetailTab] = useState('deliveries')

  const load = async (q = '') => {
    try {
      const [c, db] = await Promise.all([
        distributorAPI.getCustomers(q),
        distributorAPI.getDeliveryBoys()
      ])
      setCustomers(c.data.content || [])
      setDeliveryBoys(db.data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const loadHistory = async (customerId, month, year) => {
    setHistoryLoading(true)
    setHistory(null)
    try {
      const { data } = await distributorAPI.getCustomerHistory(customerId, month, year)
      setHistory(data)
    } catch (err) {
      toast.error('Failed to load history')
      console.error(err)
    } finally { setHistoryLoading(false) }
  }

  const openDetail = (c) => {
    setDetailCustomer(c)
    setDetailTab('deliveries')
    loadHistory(c.id, detailMonth, detailYear)
  }

  useEffect(() => {
    if (detailCustomer) loadHistory(detailCustomer.id, detailMonth, detailYear)
  }, [detailMonth, detailYear])

  const handleSearch = e => { setSearch(e.target.value); load(e.target.value) }

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = c => {
    setEditing(c)
    setForm({ name: c.name, mobile: c.mobile, address: c.address || '', milkType: c.milkType, defaultQuantity: c.defaultQuantity, deliveryBoyId: c.deliveryBoyId || '' })
    setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, defaultQuantity: parseFloat(form.defaultQuantity), deliveryBoyId: form.deliveryBoyId || null }
      if (editing) await distributorAPI.updateCustomer(editing.id, payload)
      else await distributorAPI.addCustomer(payload)
      toast.success(editing ? 'Customer updated!' : 'Customer added!')
      setShowModal(false)
      load(search)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const statusBadge = s => {
    const map = { DELIVERED: 'badge-success', SKIPPED: 'badge-warning', HOLIDAY: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Layout navItems={NAV} title="Customers">
      <div className="page-header">
        <h1 className="page-title">Customers ({customers.length})</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
      </div>

      <div className="search-bar">
        <span>🔍</span>
        <input placeholder="Search by name or mobile..." value={search} onChange={handleSearch} />
      </div>

      {loading ? <Spinner /> : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>No customers found</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Milk Type</th>
                <th>Qty/Day</th>
                <th>Delivery Boy</th>
                <th>Pending</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(c)}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.address && <><br /><small style={{ color: 'var(--text-secondary)' }}>{c.address}</small></>}
                  </td>
                  <td>{c.mobile}</td>
                  <td>
                    <span className={`badge ${c.milkType === 'COW' ? 'badge-info' : 'badge-warning'}`}>
                      {c.milkType === 'COW' ? '🐄 Cow' : '🐃 Buffalo'}
                    </span>
                  </td>
                  <td>{c.defaultQuantity}L</td>
                  <td>{c.deliveryBoyName || <span style={{ color: 'var(--text-secondary)' }}>Unassigned</span>}</td>
                  <td style={{ color: c.pendingBalance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                    ₹{Number(c.pendingBalance || 0).toFixed(0)}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail Modal */}
      <Modal open={!!detailCustomer} onClose={() => setDetailCustomer(null)}
        title={detailCustomer ? `📋 ${detailCustomer.name}` : ''}>
        {detailCustomer && (
          <div>
            {/* Customer Info */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, padding: 12, background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📱 {detailCustomer.mobile}</div>
                {detailCustomer.address && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 {detailCustomer.address}</div>}
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  <span className={`badge ${detailCustomer.milkType === 'COW' ? 'badge-info' : 'badge-warning'}`}>
                    {detailCustomer.milkType === 'COW' ? '🐄 Cow' : '🐃 Buffalo'}
                  </span>
                  <span style={{ marginLeft: 8 }}>{detailCustomer.defaultQuantity}L/day</span>
                </div>
                {history?.payments?.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                    Last Payment: <strong style={{ color: 'var(--success)' }}>₹{Number(history.payments[0].amount).toFixed(0)}</strong>
                    {' '}on {new Date(history.payments[0].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    {' '}via <span className="badge badge-info" style={{ fontSize: 11 }}>{history.payments[0].mode}</span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pending Balance</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: detailCustomer.pendingBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  ₹{Number(detailCustomer.pendingBalance || 0).toFixed(0)}
                </div>
              </div>
            </div>

            {/* Month/Year selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <select value={detailMonth} onChange={e => setDetailMonth(+e.target.value)} style={{ width: 'auto' }}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select value={detailYear} onChange={e => setDetailYear(+e.target.value)} style={{ width: 'auto' }}>
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className={`btn ${detailTab === 'deliveries' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setDetailTab('deliveries')}>🥛 Deliveries ({history?.deliveries?.length || 0})</button>
              <button className={`btn ${detailTab === 'payments' ? 'btn-success' : 'btn-outline'} btn-sm`}
                onClick={() => setDetailTab('payments')}>💳 All Payments ({history?.payments?.length || 0})</button>
            </div>

            {historyLoading ? <Spinner /> : !history ? null : (
              <>
                {detailTab === 'deliveries' && (
                  history.deliveries.length === 0
                    ? <div className="empty-state" style={{ padding: 24 }}><p>No deliveries this month</p></div>
                    : (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Qty</th>
                              <th>Rate</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.deliveries.map((d, i) => (
                              <tr key={i}>
                                <td>{new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                <td>{statusBadge(d.status)}</td>
                                <td>{d.status === 'DELIVERED' ? `${d.quantity}L` : '-'}</td>
                                <td>{d.status === 'DELIVERED' ? `₹${Number(d.pricePerLiter).toFixed(1)}` : '-'}</td>
                                <td style={{ fontWeight: 600, color: d.status === 'DELIVERED' ? 'var(--success)' : 'var(--text-secondary)' }}>
                                  {d.status === 'DELIVERED' ? `₹${Number(d.amount).toFixed(0)}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={4} style={{ fontWeight: 700, textAlign: 'right', padding: '10px 16px' }}>Total</td>
                              <td style={{ fontWeight: 700, color: 'var(--primary)', padding: '10px 16px' }}>
                                ₹{history.deliveries.filter(d => d.status === 'DELIVERED').reduce((s, d) => s + Number(d.amount), 0).toFixed(0)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )
                )}

                {detailTab === 'payments' && (
                  history.payments.length === 0
                    ? <div className="empty-state" style={{ padding: 24 }}><p>No payments recorded</p></div>
                    : (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Amount</th>
                              <th>Mode</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.payments.map((p, i) => (
                              <tr key={i}>
                                <td>{new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                                <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{Number(p.amount).toFixed(0)}</td>
                                <td><span className="badge badge-info">{p.mode}</span></td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{p.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td style={{ fontWeight: 700, textAlign: 'right', padding: '10px 16px' }}>Total Paid</td>
                              <td style={{ fontWeight: 700, color: 'var(--success)', padding: '10px 16px' }}>
                                ₹{history.payments.reduce((s, p) => s + Number(p.amount), 0).toFixed(0)}
                              </td>
                              <td colSpan={2} />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
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
          <div className="form-group">
            <label>Assign Delivery Boy</label>
            <select value={form.deliveryBoyId} onChange={f('deliveryBoyId')}>
              <option value="">-- Select --</option>
              {deliveryBoys.map(db => <option key={db.id} value={db.id}>{db.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
