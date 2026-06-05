export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
