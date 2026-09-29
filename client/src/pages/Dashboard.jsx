import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ContactBookLayout from "../components/ContactBookLayout";
import BookPage from "../components/BookPage";
import ContactCard from "../components/ContactCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { getContactStats, getContacts, toggleFavourite } from "../services/contacts";

export default function Dashboard() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]); const [stats, setStats] = useState({ total: 0, favourites: 0 }); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { Promise.all([getContacts(1, 3), getContactStats()]).then(([contactsResponse, statsResponse]) => { setContacts(contactsResponse.data.data); setStats(statsResponse.data); }).catch(() => setError("Your book could not be opened right now.")).finally(() => setLoading(false)); }, []);
  const favourite = async (contact) => { setContacts((items) => items.map((item) => item._id === contact._id ? { ...item, isFavourite: !item.isFavourite } : item)); try { await toggleFavourite(contact._id); } catch { setError("Could not update that bookmark."); } };
  return <ContactBookLayout><div className="book-spread dashboard-spread"><BookPage className="welcome-page" eyebrow="THE FIRST PAGE" title={`Welcome back, ${user?.name?.split(" ")[0] || "friend"}.`}><p className="lead-copy">Your people, gathered in one warm and wonderfully organized place.</p><div className="stats-grid"><div><strong>{stats.total}</strong><span>Total contacts</span></div><div><strong>{stats.favourites}</strong><span>Favorite contacts</span></div><div><strong>{contacts.length}</strong><span>Recently added</span></div></div><div className="page-quote">“The best way to remember someone is to make room for them.”</div><Link to="/contacts/new" className="gold-button">＋ Add a contact</Link></BookPage><BookPage className="preview-page" eyebrow="A QUICK LOOK" title="Recent pages"><div className="page-tools"><Link to="/contacts">View all contacts →</Link></div>{error && <p className="form-error">{error}</p>}{loading ? <Loader label="Opening your book..." /> : contacts.length ? <div className="preview-list">{contacts.map((contact) => <ContactCard key={contact._id} contact={contact} onFavourite={favourite} />)}</div> : <div className="empty-note"><span>✦</span><strong>Your book is waiting for its first name.</strong><Link to="/contacts/new">Write a contact</Link></div>}</BookPage></div></ContactBookLayout>;
}
