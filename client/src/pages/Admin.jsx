import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookPage from "../components/BookPage";
import ContactBookLayout from "../components/ContactBookLayout";
import Loader from "../components/Loader";
import { getContactStats, getContacts } from "../services/contacts";

export default function Admin() {
  const [stats, setStats] = useState({ total: 0, favourites: 0, byGroup: [] });
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getContactStats(), getContacts(1, 5)])
      .then(([statsResponse, contactsResponse]) => {
        setStats(statsResponse.data);
        setRecentContacts(contactsResponse.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ContactBookLayout>
      <BookPage className="admin-page" eyebrow="ADMIN DASHBOARD" title="Book overview">
        <p className="lead-copy">A quick snapshot of your address book health, favorites, and active groups.</p>

        {loading ? (
          <Loader label="Loading admin panel..." />
        ) : (
          <>
            <div className="stats-grid admin-grid">
              <div>
                <strong>{stats.total}</strong>
                <span>Total contacts</span>
              </div>
              <div>
                <strong>{stats.favourites}</strong>
                <span>Favorites</span>
              </div>
              <div>
                <strong>{stats.byGroup?.length || 0}</strong>
                <span>Groups active</span>
              </div>
            </div>

            <div className="admin-panels">
              <div className="admin-panel">
                <h3>Group breakdown</h3>
                <ul>
                  {stats.byGroup?.length ? (
                    stats.byGroup.map((group) => (
                      <li key={group.groupId || group.groupName}>
                        <span>{group.groupName || "Ungrouped"}</span>
                        <strong>{group.count}</strong>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span>No groups yet</span>
                      <strong>0</strong>
                    </li>
                  )}
                </ul>
              </div>

              <div className="admin-panel">
                <h3>Recent contacts</h3>
                <ul className="recent-list">
                  {recentContacts.length ? (
                    recentContacts.map((contact) => (
                      <li key={contact._id}>
                        <span>{contact.name}</span>
                        <Link to={`/contacts/${contact._id}`}>Open</Link>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span>No contacts yet</span>
                      <strong>—</strong>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </BookPage>
    </ContactBookLayout>
  );
}