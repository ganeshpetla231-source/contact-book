import api from "./api";

export const getContacts = (page = 1, limit = 8, favourite = false) => api.get(`/contacts?page=${page}&limit=${limit}${favourite ? "&favourite=true" : ""}`);
export const getContact = (id) => api.get(`/contacts/${id}`);
export const searchContacts = (query, page = 1, limit = 8) => api.get(`/contacts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
export const getContactsByGroup = (groupId, page = 1, limit = 8) => api.get(`/contacts/group/${groupId}?page=${page}&limit=${limit}`);
export const getContactStats = () => api.get("/contacts/stats");
export const createContact = (contact) => api.post("/contacts", contact);
export const updateContact = (id, contact) => api.put(`/contacts/${id}`, contact);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);
export const toggleFavourite = (id) => api.patch(`/contacts/${id}/favourite`);
