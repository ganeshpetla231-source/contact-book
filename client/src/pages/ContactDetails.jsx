import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContactBookLayout from "../components/ContactBookLayout";
import BookPage from "../components/BookPage";
import Loader from "../components/Loader";
import { deleteContact, getContact, toggleFavourite } from "../services/contacts";

export default function ContactDetails() {
  const { id } = useParams(); const navigate = useNavigate(); const [contact, setContact] = useState(null); const [error, setError] = useState("");
  useEffect(() => { getContact(id).then((response) => setContact(response.data.data)).catch(() => setError("This contact could not be found.")); }, [id]);
  if (error) return <ContactBookLayout><BookPage eyebrow="MISSING PAGE" title="Contact not found"><p className="lead-copy">This page is no longer in your book.</p><Link className="gold-button" to="/contacts">Back to contacts</Link></BookPage></ContactBookLayout>;
  if (!contact) return <ContactBookLayout><Loader /></ContactBookLayout>;
  const initials = contact.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const favourite = async () => { setContact({ ...contact, isFavourite: !contact.isFavourite }); await toggleFavourite(contact._id); };
  const remove = async () => { if (!window.confirm(`Delete ${contact.name}?`)) return; await deleteContact(contact._id); navigate("/contacts"); };
  return <ContactBookLayout><BookPage className="details-page" eyebrow="A PERSONAL PAGE" title="Contact details"><div className="profile-hero">{contact.photo ? <img className="large-avatar avatar-photo" src={contact.photo} alt={`${contact.name} portrait`} /> : <span className="large-avatar">{initials}</span>}<div><p className="card-category">{contact.group?.name || contact.category || "Unsorted"}</p><h2>{contact.name}</h2><p className="lead-copy">A valued person in your address book.</p></div></div><div className="detail-grid"><div><span>Phone</span><strong>{contact.phone}</strong></div><div><span>Email</span><strong>{contact.email || "Not added"}</strong></div><div><span>Address</span><strong>{contact.address || "Not added"}</strong></div><div><span>Notes</span><strong>{contact.notes || "No notes yet"}</strong></div></div><div className="detail-actions"><Link className="gold-button" to={`/contacts/${contact._id}/edit`}>Edit contact</Link><button className="outline-button" onClick={favourite}>{contact.isFavourite ? "★ Favorited" : "☆ Favorite"}</button><button className="outline-button danger" onClick={remove}>Delete</button><Link className="text-link" to="/contacts">← Back to contacts</Link></div></BookPage></ContactBookLayout>;
}
