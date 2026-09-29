export default function Modal({ title, eyebrow, onClose, children }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={onClose} aria-label="Close">×</button><p className="workspace-kicker">{eyebrow}</p><h2 id="modal-title">{title}</h2>{children}</section></div>;
}
