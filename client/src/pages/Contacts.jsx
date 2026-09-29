import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import { createContact, deleteContact, getContactStats, getContacts, getContactsByGroup, searchContacts, toggleFavourite, updateContact } from "../services/contacts";
import { getGroups } from "../services/groups";

const emptyForm = { name: "", phone: "", email: "", notes: "", group: "" };
const errorMessage = (error, fallback) => error.response?.data?.message || fallback;

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [stats, setStats] = useState({ total: 0, favourites: 0, byGroup: [] });

  const load = async () => {
    setLoading(true); setError("");
    try {
      const contactsRequest = debouncedSearch
        ? searchContacts(debouncedSearch, page)
        : selectedGroup
          ? getContactsByGroup(selectedGroup, page)
          : getContacts(page, 8, favouritesOnly);
      const [contactsResponse, groupsResponse, statsResponse] = await Promise.all([contactsRequest, getGroups(), getContactStats()]);
        setContacts(contactsResponse.data.data);
        setMeta(contactsResponse.data);
      setGroups(groupsResponse.data.data); setStats(statsResponse.data);
    } catch (requestError) { setError(errorMessage(requestError, "Unable to load your contacts.")); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { load(); }, [page, debouncedSearch, selectedGroup, favouritesOnly]);

  const resetFilters = () => { setSearch(""); setDebouncedSearch(""); setSelectedGroup(""); setFavouritesOnly(false); setPage(1); };

  const saveContact = async (form) => {
    try { if (modal.contact) await updateContact(modal.contact._id, form); else await createContact(form); setModal(null); await load(); }
    catch (requestError) { throw new Error(errorMessage(requestError, "Unable to save contact.")); }
  };
  const removeContact = async (contact) => {
    if (!window.confirm(`Delete ${contact.name}? This cannot be undone.`)) return;
    try { await deleteContact(contact._id); if (contacts.length === 1 && page > 1) setPage(page - 1); else await load(); }
    catch (requestError) { setError(errorMessage(requestError, "Unable to delete contact.")); }
  };
  const favourite = async (contact) => {
    setContacts((current) => current.map((item) => item._id === contact._id ? { ...item, isFavourite: !item.isFavourite } : item));
    try { await toggleFavourite(contact._id); } catch (requestError) { setContacts((current) => current.map((item) => item._id === contact._id ? contact : item)); setError(errorMessage(requestError, "Unable to update favourite.")); }
  };

  return <AppLayout><div className="page-heading"><div><p className="workspace-kicker">CONTACTS</p><h2>{favouritesOnly ? "Favourites" : "All contacts"}</h2><p className="workspace-muted">The people in your orbit, all in one place.</p></div><button className="primary-button" onClick={() => setModal({ contact: null })}>＋ Add contact</button></div><div className="stat-strip"><Stat value={stats.total} label="Total contacts" /><Stat value={stats.favourites} label="Favourites" /><Stat value={groups.length} label="Groups" /></div>{stats.byGroup.length > 0 && <div className="group-summary">{stats.byGroup.map((group) => <span key={group.groupId}><b>{group.count}</b> {group.groupName}</span>)}</div>}{error && <div className="inline-error">{error}</div>}<div className="contact-filters"><label className="search-input"><span>⌕</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, phone or email..." /></label><div className="filter-tabs"><button className={!favouritesOnly && !selectedGroup ? "active" : ""} onClick={resetFilters}>All</button><button className={favouritesOnly ? "active" : ""} onClick={() => { setFavouritesOnly(true); setSelectedGroup(""); setSearch(""); setPage(1); }}>★ Favourites</button><select value={selectedGroup} onChange={(event) => { setSelectedGroup(event.target.value); setFavouritesOnly(false); setSearch(""); setPage(1); }}><option value="">All groups</option>{groups.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}</select></div></div><div className="list-toolbar"><span>{debouncedSearch ? "SEARCH RESULTS" : favouritesOnly ? "FAVOURITES" : selectedGroup ? "GROUP CONTACTS" : "CONTACTS"}</span><span>{meta.total} people</span></div>{loading ? <Loading /> : contacts.length === 0 ? <Empty onAdd={() => setModal({ contact: null })} filtered={Boolean(search || selectedGroup || favouritesOnly)} /> : <div className="contact-table">{contacts.map((contact) => <ContactRow key={contact._id} contact={contact} onFavourite={() => favourite(contact)} onEdit={() => setModal({ contact })} onDelete={() => removeContact(contact)} />)}</div>}{!loading && meta.pages > 1 && <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />}{modal && <ContactModal contact={modal.contact} groups={groups} onClose={() => setModal(null)} onSave={saveContact} />}</AppLayout>;
}

function ContactRow({ contact, onFavourite, onEdit, onDelete }) { return <article className="contact-row"><div className="contact-person"><span className="contact-avatar">{contact.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div><strong>{contact.name}</strong><span>{contact.email || "No email added"}</span></div></div><span className="contact-phone">{contact.phone}</span><span className="group-pill">{contact.group?.name || "Unsorted"}</span><button className={`icon-button${contact.isFavourite ? " favourite" : ""}`} onClick={onFavourite} aria-label="Toggle favourite">{contact.isFavourite ? "★" : "☆"}</button><div className="row-actions"><button className="text-button" onClick={onEdit}>Edit</button><button className="text-button danger" onClick={onDelete}>Delete</button></div></article>; }
function ContactModal({ contact, groups, onClose, onSave }) { const [form, setForm] = useState(contact ? { name: contact.name, phone: contact.phone, email: contact.email || "", notes: contact.notes || "", group: contact.group?._id || "" } : emptyForm); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const update = (event) => setForm({ ...form, [event.target.name]: event.target.value }); const submit = async (event) => { event.preventDefault(); setError(""); if (!form.name.trim() || !form.phone.trim()) return setError("Name and phone are required."); setSaving(true); try { await onSave({ ...form, name: form.name.trim(), phone: form.phone.trim() }); } catch (saveError) { setError(saveError.message); } finally { setSaving(false); } }; return <Modal eyebrow={contact ? "EDIT CONTACT" : "NEW CONTACT"} title={contact ? "Update contact" : "Add a contact"} onClose={onClose}><form className="modal-form" onSubmit={submit}><label className="field">Name<input name="name" value={form.name} onChange={update} placeholder="Maya Chen" /></label><div className="form-columns"><label className="field">Phone<input name="phone" value={form.phone} onChange={update} placeholder="+1 555 000 0000" /></label><label className="field">Email<input name="email" type="email" value={form.email} onChange={update} placeholder="maya@example.com" /></label></div><label className="field">Group<select name="group" value={form.group} onChange={update}><option value="">Unsorted</option>{groups.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}</select></label><label className="field">Notes<textarea name="notes" value={form.notes} onChange={update} rows="3" placeholder="A little context..." /></label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save contact"}</button></div></form></Modal>; }
function Stat({ value, label }) { return <div className="stat-card"><strong>{value}</strong><span>{label}</span></div>; }
function Loading() { return <div className="state-box"><div className="spinner" />Loading contacts...</div>; }
function Empty({ onAdd, filtered }) { return <div className="state-box"><strong>{filtered ? "No matching contacts" : "No contacts yet"}</strong><span>{filtered ? "Try another filter or search." : "Add your first contact to get started."}</span>{!filtered && <button className="secondary-button" onClick={onAdd}>Add contact</button>}</div>; }
function Pagination({ page, pages, onChange }) { return <div className="pagination"><button className="secondary-button" disabled={page === 1} onClick={() => onChange(page - 1)}>← Previous</button><span>Page {page} of {pages}</span><button className="secondary-button" disabled={page === pages} onClick={() => onChange(page + 1)}>Next →</button></div>; }
