import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { billingAPI } from '../../api'
import { toast } from 'react-toastify'

const NAV = [
  { path: '/distributor', icon: '🏠', label: 'Home' },
  { path: '/distributor/customers', icon: '👥', label: 'Customers' },
  { path: '/distributor/delivery-boys', icon: '🚴', label: 'Delivery Boys' },
  { path: '/distributor/billing', icon: '🧾', label: 'Billing' },
  { path: '/distributor/milk-prices', icon: '🥛', label: 'Prices' },
  { path: '/distributor/reports', icon: '📊', label: 'Reports' }
]

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Billing() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [payModal, setPayModal] = useState(null)
  const [payForm, setPayForm] = useState({ amount: '', paymentMode: 'CASH', paymentDate: now.toISOString().split('T')[0], notes: '' })
  const [lastPayments, setLastPayments] = useState({}) // track last payment per bill

  const loadBills = async () => {
    setLoading(true)
    try {
      const { data } = await billingAPI.getBills(month, year)
      setBills(data || [])
      // track last payment for each bill
      const lp = {}
      ;(data || []).forEach(b => {
        if (Number(b.paidAmount) > 0) {
          lp[b.id] = { amount: Number(b.paidAmount).toFixed(2), date: now.toISOString().split('T')[0] }
        }
      })
      setLastPayments(lp)
    } catch { toast.error('Failed to load bills') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadBills() }, [month, year])

  const generateBills = async () => {
    setGenerating(true)
    try {
      const { data } = await billingAPI.generateBills(month, year)
      setBills(data || [])
      toast.success(`${data.length} bills generated successfully`)
    } catch { toast.error('Failed to generate bills') }
    finally { setGenerating(false) }
  }

  const handlePayment = async e => {
    e.preventDefault()
    try {
      await billingAPI.recordPayment({
        customerId: payModal.customerId,
        billId: payModal.id,
        amount: parseFloat(payForm.amount),
        paymentDate: payForm.paymentDate,
        paymentMode: payForm.paymentMode,
        notes: payForm.notes
      })
      // save last payment for this bill
      setLastPayments(lp => ({
        ...lp,
        [payModal.id]: { amount: payForm.amount, date: payForm.paymentDate, mode: payForm.paymentMode }
      }))
      toast.success('Payment recorded successfully')
      setPayModal(null)
      loadBills()
    } catch { toast.error('Failed to record payment') }
  }

  const sendWhatsApp = bill => {
    if (!bill.customerMobile) {
      toast.error('No mobile number for this customer')
      return
    }
    // clean mobile: remove spaces, dashes, +91, 0 prefix
    const mobile = bill.customerMobile.replace(/[\s\-]/g, '').replace(/^(\+91|91|0)/, '')
    const msg = encodeURIComponent(bill.whatsappMessage)
    window.open(`https://wa.me/91${mobile}?text=${msg}`, '_blank')
  }

  const totalBilled   = bills.reduce((s, b) => s + Number(b.totalAmount || 0), 0)
  const totalReceived = bills.reduce((s, b) => s + Number(b.paidAmount || 0), 0)
  const totalPending  = bills.reduce((s, b) => s + Number(b.remainingAmount || 0), 0)
  const paidCount     = bills.filter(b => b.status === 'PAID').length
  const partialCount  = bills.filter(b => b.status === 'PARTIAL').length
  const unpaidCount   = bills.filter(b => b.status === 'GENERATED').length

  const statusConfig = {
    PAID:      { label: 'Paid',         cls: 'badge-success' },
    PARTIAL:   { label: 'Partial',      cls: 'badge-warning' },
    GENERATED: { label: 'Unpaid',       cls: 'badge-danger'  },
    SENT:      { label: 'Sent',         cls: 'badge-secondary'}
  }

  return (
    <Layout navItems={NAV} title="Billing">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {MONTHS[month - 1]} {year}
          </div>
        </div>
        <button className="btn btn-primary" onClick={generateBills} disabled={generating}>
          {generating ? 'Generating...' : '⚡ Generate Bills'}
        </button>
      </div>

      {/* Month / Year Selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={month} onChange={e => setMonth(+e.target.value)} style={{ width: 'auto' }}>
          {MONTHS_SHORT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)} style={{ width: 'auto' }}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary Stats */}
      {bills.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <span className="stat-icon">🧾</span>
            <span className="stat-value">{bills.length}</span>
            <span className="stat-label">Total Bills</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <span className="stat-value">₹{totalBilled.toFixed(0)}</span>
            <span className="stat-label">Total Billed</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>₹{totalReceived.toFixed(0)}</span>
            <span className="stat-label">Amount Received</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <span className="stat-value" style={{ color: totalPending > 0 ? 'var(--danger)' : 'var(--success)' }}>
              ₹{totalPending.toFixed(0)}
            </span>
            <span className="stat-label">Outstanding</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🟢</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>{paidCount}</span>
            <span className="stat-label">Fully Paid</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🟡</span>
            <span className="stat-value" style={{ color: 'var(--warning)' }}>{partialCount}</span>
            <span className="stat-label">Partial</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔴</span>
            <span className="stat-value" style={{ color: 'var(--danger)' }}>{unpaidCount}</span>
            <span className="stat-label">Unpaid</span>
          </div>
        </div>
      )}

      {/* Bills List */}
      {loading ? <Spinner /> : bills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <p>No bills found for {MONTHS[month - 1]} {year}.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Click "Generate Bills" to create bills for this period.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {bills.map(b => (
            <div key={b.id} className="card">

              {/* Bill Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{b.customerName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    📱 {b.customerMobile}
                    {b.deliveryBoyName && b.deliveryBoyName !== 'N/A' && (
                      <span> &nbsp;•&nbsp; 🚴 {b.deliveryBoyName}</span>
                    )}
                  </div>
                </div>
                <span className={`badge ${statusConfig[b.status]?.cls || 'badge-secondary'}`}>
                  {statusConfig[b.status]?.label || b.status}
                </span>
              </div>

              {/* Bill Amount Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  {
                    label: 'Monthly Charges',
                    value: `₹${Number(b.currentMonthAmount).toFixed(0)}`,
                    color: 'var(--text)'
                  },
                  {
                    label: 'Previous Balance',
                    value: `₹${Number(b.previousPending).toFixed(0)}`,
                    color: Number(b.previousPending) > 0 ? 'var(--warning)' : 'var(--text-secondary)'
                  },
                  {
                    label: 'Amount Paid',
                    value: `₹${Number(b.paidAmount).toFixed(0)}`,
                    color: 'var(--success)'
                  },
                  {
                    label: 'Balance Due',
                    value: `₹${Number(b.remainingAmount).toFixed(0)}`,
                    color: Number(b.remainingAmount) > 0 ? 'var(--danger)' : 'var(--success)'
                  }
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'var(--surface2)', borderRadius: 8,
                    padding: '10px 6px', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>
                      {item.label}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: item.color }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8,
                marginBottom: 12, fontSize: 13
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Total Bill = Monthly Charges + Previous Balance
                </span>
                <strong style={{ fontSize: 15 }}>₹{Number(b.totalAmount).toFixed(0)}</strong>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {Number(b.remainingAmount) > 0 && (
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    const lp = lastPayments[b.id]
                    setPayModal(b)
                    setPayForm({
                      amount: lp ? lp.amount : Number(b.remainingAmount).toFixed(2),
                      paymentMode: lp ? (lp.mode || 'CASH') : 'CASH',
                      paymentDate: now.toISOString().split('T')[0],
                      notes: ''
                    })
                  }}>
                    💳 Record Payment
                  </button>
                )}
                <button className="btn btn-whatsapp btn-sm" onClick={() => sendWhatsApp(b)}>
                  📱 Send via WhatsApp
                </button>
                {lastPayments[b.id] && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>
                    Last paid: ₹{lastPayments[b.id].amount} on {new Date(lastPayments[b.id].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Record Payment">
        {payModal && (
          <form onSubmit={handlePayment}>

            {/* Customer Info */}
            <div style={{ marginBottom: 16, padding: 14, background: 'var(--surface2)', borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{payModal.customerName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>📱 {payModal.customerMobile}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total Bill</div>
                  <div style={{ fontWeight: 700 }}>₹{Number(payModal.totalAmount).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Already Paid</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{Number(payModal.paidAmount).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Balance Due</div>
                  <div style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{Number(payModal.remainingAmount).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Amount *</label>
                <input
                  type="number" step="0.01" min="0.01"
                  value={payForm.amount}
                  onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={payForm.paymentDate}
                  onChange={e => setPayForm(p => ({ ...p, paymentDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select value={payForm.paymentMode} onChange={e => setPayForm(p => ({ ...p, paymentMode: e.target.value }))}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Remarks (Optional)</label>
              <input
                placeholder="e.g. Partial payment, advance..."
                value={payForm.notes}
                onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setPayModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">✅ Confirm Payment</button>
            </div>
          </form>
        )}
      </Modal>

    </Layout>
  )
}
