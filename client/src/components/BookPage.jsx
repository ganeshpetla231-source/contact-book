export default function BookPage({ children, className = "", eyebrow, title, action }) {
  return <section className={`book-page ${className}`}>
    {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
    {title && <div className="page-title-row"><div><h1>{title}</h1></div>{action}</div>}
    {children}
  </section>;
}
