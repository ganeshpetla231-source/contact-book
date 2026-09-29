import { Link, useNavigate } from "react-router-dom";

const initials = (name = "?") => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export default function ContactCard({ contact, onFavourite, onDelete }) {
  const navigate = useNavigate();

  const openContact = (event) => {
    const target = event.target;
    if (target.closest("button") || target.closest("a")) return;
    navigate(`/contacts/${contact._id}`);
  };

  return <article className="contact-card" onClick={openContact} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); navigate(`/contacts/${contact._id}`); } }}>
    <div className="card-bookmark" aria-hidden="true" />
    <div className="contact-card-head">{contact.photo ? <img className="avatar avatar-photo" src={contact.photo} alt={`${contact.name} portrait`} /> : <span className="avatar">{initials(contact.name)}</span>}<button className={`favorite-button ${contact.isFavourite ? "is-favorite" : ""}`} onClick={(event) => { event.stopPropagation(); onFavourite?.(contact); }} aria-label={`${contact.isFavourite ? "Remove" : "Add"} ${contact.name} ${contact.isFavourite ? "from" : "to"} favorites`}>{contact.isFavourite ? "★" : "☆"}</button></div>
    <h3>{contact.name}</h3>
    <p className="card-category">{contact.group?.name || "Unsorted"}</p>
    <dl className="contact-lines"><div><dt>Phone</dt><dd>{contact.phone}</dd></div><div><dt>Email</dt><dd>{contact.email || "Not added"}</dd></div></dl>
    <div className="card-actions"><Link className="small-button" to={`/contacts/${contact._id}`} onClick={(event) => event.stopPropagation()}>View</Link><Link className="small-button" to={`/contacts/${contact._id}/edit`} onClick={(event) => event.stopPropagation()}>Edit</Link>{onDelete && <button className="small-button danger" onClick={(event) => { event.stopPropagation(); onDelete(contact); }}>Delete</button>}</div>
  </article>;
}
