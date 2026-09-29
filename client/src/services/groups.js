import api from "./api";

export const getGroups = (page = 1, limit = 100) => api.get(`/groups?page=${page}&limit=${limit}`);
export const createGroup = (group) => api.post("/groups", group);
export const updateGroup = (id, group) => api.put(`/groups/${id}`, group);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
