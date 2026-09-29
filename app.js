const seedContacts = [
  { id: "1", name: "Maya Chen", phone: "+1 415 555 0182", email: "maya.chen@example.com", group: "Family", notes: "Sunday dinner person", favourite: true },
  { id: "2", name: "Jordan Bell", phone: "+1 415 555 0146", email: "jordan.bell@example.com", group: "Work", notes: "Product design partner", favourite: false },
  { id: "3", name: "Samir Patel", phone: "+1 628 555 0129", email: "samir.patel@example.com", group: "Friends", notes: "Runs on excellent coffee", favourite: true },
  { id: "4", name: "Olivia Brooks", phone: "+1 415 555 0198", email: "olivia.brooks@example.com", group: "Work", notes: "Ask about the new studio", favourite: false },
  { id: "5", name: "Noah Williams", phone: "+1 628 555 0163", email: "noah.williams@example.com", group: "Family", notes: "Has the spare keys", favourite: false }
];
const defaultGroups = ["Family", "Work", "Friends"];
let contacts = JSON.parse(localStorage.getItem("contact-book-contacts") || "null") || seedContacts;
let groups = JSON.parse(localStorage.getItem("contact-book-groups") || "null") || defaultGroups;
let activeView = "contacts";
let searchTerm = "";

const $ = (selector) => document.querySelector(selector);
const initials = (name) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const save = () => { localStorage.setItem("contact-book-contacts", JSON.stringify(contacts)); localStorage.setItem("contact-book-groups", JSON.stringify(groups)); };
const colourClass = (name) => `avatar-${[...name].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 4}`;

function renderNavigation() {
  $("#allCount").textContent = contacts.length;
  $("#favouriteCount").textContent = contacts.filter((contact) => contact.favourite).length;
  $("#groupNav").innerHTML = groups.map((group, index) => `<button class="nav-item group-link ${activeView === `group:${group}` ? "active" : ""}" type="button" data-view="group:${escapeHtml(group)}"><span class="group-dot dot-${index % 4}"></span>${escapeHtml(group)}<span class="nav-count">${contacts.filter((contact) => contact.group === group).length}</span></button>`).join("");
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { activeView = button.dataset.view; searchTerm = ""; $("#searchInput").value = ""; render(); }));
}

function visibleContacts() {
  let result = contacts;
  if (activeView === "favourites") result = result.filter((contact) => contact.favourite);
  if (activeView.startsWith("group:")) result = result.filter((contact) => contact.group === activeView.slice(6));
  if (searchTerm) result = result.filter((contact) => [contact.name, contact.phone, contact.email, contact.group].join(" ").toLowerCase().includes(searchTerm.toLowerCase()));
  return result;
}

function render() {
  const viewContacts = visibleContacts();
  const groupName = activeView.startsWith("group:") ? activeView.slice(6) : "";
  $("#viewEyebrow").textContent = activeView === "favourites" ? "YOUR SHORTLIST" : groupName ? "GROUP" : "CONTACTS";
  $("#viewTitle").textContent = activeView === "favourites" ? "Favourites" : groupName || "All contacts";
  $("#totalStat").textContent = contacts.length;
  $("#favouriteStat").textContent = contacts.filter((contact) => contact.favourite).length;
  $("#groupStat").textContent = groups.length;
  $("#resultLabel").textContent = searchTerm ? "SEARCH RESULTS" : activeView === "favourites" ? "FAVOURITES" : "CONTACTS";
  $("#resultCount").textContent = `${viewContacts.length} ${viewContacts.length === 1 ? "person" : "people"}`;
  $("#contactList").innerHTML = viewContacts.map((contact, index) => `<article class="contact-row" style="animation-delay:${index * 35}ms"><div class="contact-main"><span class="contact-avatar ${colourClass(contact.name)}">${escapeHtml(initials(contact.name))}</span><div><div class="contact-name">${escapeHtml(contact.name)}</div><div class="contact-email">${escapeHtml(contact.email || "No email added")}</div></div></div><div class="contact-phone">${escapeHtml(contact.phone)}</div><div class="contact-group"><span class="group-dot"></span>${escapeHtml(contact.group || "Unsorted")}</div><button class="icon-button favourite-button ${contact.favourite ? "is-favourite" : ""}" type="button" data-favourite="${contact.id}" aria-label="${contact.favourite ? "Remove from favourites" : "Add to favourites"}">${contact.favourite ? "★" : "☆"}</button><button class="icon-button" type="button" data-edit="${contact.id}" aria-label="Edit ${escapeHtml(contact.name)}">⋯</button></article>`).join("");
  $("#emptyState").classList.toggle("hidden", viewContacts.length > 0);
  document.querySelectorAll("[data-favourite]").forEach((button) => button.addEventListener("click", () => { const contact = contacts.find((item) => item.id === button.dataset.favourite); contact.favourite = !contact.favourite; save(); render(); }));
  document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => openContactModal(button.dataset.edit)));
  renderNavigation();
}

function openContactModal(id = "") {
  const contact = contacts.find((item) => item.id === id);
  $("#contactForm").reset(); $("#contactId").value = id; $("#modalTitle").textContent = contact ? "Edit contact" : "Add a contact";
  $("#groupInput").innerHTML = `<option value="">Unsorted</option>${groups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join("")}`;
  if (contact) { $("#nameInput").value = contact.name; $("#phoneInput").value = contact.phone; $("#emailInput").value = contact.email; $("#groupInput").value = contact.group; $("#notesInput").value = contact.notes; }
  $("#contactModal").showModal(); $("#nameInput").focus();
}

$("#contactForm").addEventListener("submit", (event) => { event.preventDefault(); const id = $("#contactId").value; const payload = { id: id || Date.now().toString(), name: $("#nameInput").value.trim(), phone: $("#phoneInput").value.trim(), email: $("#emailInput").value.trim(), group: $("#groupInput").value, notes: $("#notesInput").value.trim(), favourite: id ? contacts.find((contact) => contact.id === id).favourite : false }; if (id) contacts = contacts.map((contact) => contact.id === id ? payload : contact); else contacts.unshift(payload); save(); $("#contactModal").close(); render(); });
$("#groupForm").addEventListener("submit", (event) => { event.preventDefault(); const name = $("#groupNameInput").value.trim(); if (name && !groups.includes(name)) { groups.push(name); save(); } $("#groupModal").close(); $("#groupNameInput").value = ""; render(); });
$("#searchInput").addEventListener("input", (event) => { searchTerm = event.target.value.trim(); render(); });
$("#addContactButton").addEventListener("click", () => openContactModal()); $("#emptyAddButton").addEventListener("click", () => openContactModal()); $("#addGroupButton").addEventListener("click", () => $("#groupModal").showModal());
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => $("#${button.dataset.close}").close()));
render();
