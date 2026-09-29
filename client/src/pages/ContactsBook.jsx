import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ContactBookLayout from "../components/ContactBookLayout";
import BookPage from "../components/BookPage";
import ContactCard from "../components/ContactCard";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { createContact, deleteContact, getContacts, getContactsByGroup, searchContacts, toggleFavourite } from "../services/contacts";
import { getGroups } from "../services/groups";
import { exportContactsToCsv, parseContactsCsv } from "../utils/csv";

export default function ContactsBook({ favoritesOnly = false }) {
  const [contacts, setContacts] = useState([]); const [groups, setGroups] = useState([]); const [query, setQuery] = useState(""); const [group, setGroup] = useState(""); const [page, setPage] = useState(1); const [meta, setMeta] = useState({ pages: 1, total: 0 }); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const { toast } = useToast();
  const csvInputRef = useRef(null);

  const load = async () => { setLoading(true); setError(""); try { const contactsRequest = query.trim() ? searchContacts(query.trim(), page, 6) : group ? getContactsByGroup(group, page, 6) : getContacts(page, 6, favoritesOnly); const [contactResponse, groupResponse] = await Promise.all([contactsRequest, getGroups()]); setContacts(contactResponse.data.data); setMeta(contactResponse.data); setGroups(groupResponse.data.data); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to open this page."); } finally { setLoading(false); } };

  const exportCsv = async () => {
    try {
      const response = query.trim() ? await searchContacts(query.trim(), 1, 500) : group ? await getContactsByGroup(group, 1, 500) : await getContacts(1, 500, favoritesOnly);
      const csv = exportContactsToCsv(response.data.data || []);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "contacts.csv";
      link.click();
      URL.revokeObjectURL(url);
      toast("Contacts exported successfully.", "success");
    } catch {
      toast("Unable to export contacts right now.", "error");
    }
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseContactsCsv(text);
      if (!rows.length) throw new Error("No valid rows found in the CSV file.");

      let created = 0;
      for (const contact of rows) {
        await createContact({
          name: contact.name,
          phone: contact.phone,
          email: contact.email || "",
          address: contact.address || "",
          category: contact.category || "",
          notes: contact.notes || "",
          group: contact.group || "",
          isFavourite: Boolean(contact.isFavourite),
        });
        created += 1;
      }

      toast(`${created} contacts imported successfully.`, "success");
      csvInputRef.current.value = "";
      setPage(1);
      await load();
    } catch (importError) {
      toast(importError?.response?.data?.message || importError.message || "Unable to import CSV.", "error");
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  useEffect(() => { load(); }, [page, query, group, favoritesOnly]);
  const favourite = async (contact) => { setContacts((items) => items.map((item) => item._id === contact._id ? { ...item, isFavourite: !item.isFavourite } : item)); try { await toggleFavourite(contact._id); if (favoritesOnly) load(); } catch { setError("Could not update that bookmark."); } };
  const remove = async (contact) => { if (!window.confirm(`Delete ${contact.name}?`)) return; try { await deleteContact(contact._id); load(); } catch { setError("Could not delete this contact."); } };
  return <ContactBookLayout><BookPage className={`contacts-page${favoritesOnly ? " favorites-page" : ""}`} eyebrow={favoritesOnly ? "BOOKMARKED PAGES" : "CONTACT INDEX"} title={favoritesOnly ? "Favorite contacts" : "All contacts"} action={<div className="page-action-group">{!favoritesOnly && <Link className="gold-button" to="/contacts/new">＋ Add contact</Link>}<button className="outline-button" type="button" onClick={exportCsv}>Export CSV</button><label className="outline-button import-button"><input ref={csvInputRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />Import CSV</label><Link className="outline-button" to="/groups">＋ New group</Link></div>}><div className="index-toolbar"><label className="book-search"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search your book..." aria-label="Search contacts" /></label><select value={group} onChange={(event) => { setGroup(event.target.value); setPage(1); }} aria-label="Filter by group"><option value="">All categories</option>{groups.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></div>{error && <p className="form-error">{error}</p>}{loading ? <Loader /> : contacts.length ? <div className="contact-card-grid">{contacts.map((contact) => <ContactCard key={contact._id} contact={contact} onFavourite={favourite} onDelete={remove} />)}</div> : <div className="empty-note"><span>✦</span><strong>{favoritesOnly ? "No bookmarked contacts yet." : "No contacts on this page."}</strong><Link to="/contacts/new">Add the first contact</Link></div>}{!loading && meta.pages > 1 && <div className="book-pagination"><button className="outline-button" disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page} of {meta.pages}</span><button className="outline-button" disabled={page === meta.pages} onClick={() => setPage(page + 1)}>Next →</button></div>}</BookPage></ContactBookLayout>;
}
