import { adminapi, userapi } from '../lib/api';

export const fetchAnalytics = async () => {
  const res = await adminapi.get('/analytics');
  return res.data || [];
};

export const fetchUsers = async () => {
  const [usersRes, adminsRes] = await Promise.all([
    userapi.get('/users').catch(() => ({ data: [] })),
    adminapi.get('/auth/admin-users').catch(() => ({ data: [] }))
  ]);
  const users = usersRes.data || [];
  const admins = (adminsRes.data || []).map((admin: any) => ({ ...admin, role: 'admin' }));
  return [...users, ...admins];
};

export const fetchEvents = async () => {
  const res = await userapi.get('/events');
  return res.data || [];
};

export const addEvent = async (data: any) => {
  const res = await userapi.post('/events', data);
  return res.data;
};

export const editEvent = async (id: string, data: any) => {
  const res = await userapi.put(`/events/${id}`, data);
  return res.data;
};

export const deleteEvent = async (id: string) => {
  await userapi.delete(`/events/${id}`);
};

export const makePdf = async (data: { events: any[]; date: string }) => {
  const res = await userapi.post('/makePdf', data);
  return res.data;
};

export const fetchTemplates = async () => {
  const res = await adminapi.get('/templates');
  return res.data || [];
};

export const addTemplate = async (data: any) => {
  const res = await adminapi.post('/templates', data);
  return res.data;
};

export const editTemplate = async (id: string, data: any) => {
  const res = await adminapi.put(`/templates/${id}`, data);
  return res.data;
};

export const deleteTemplate = async (id: string) => {
  await adminapi.delete(`/templates/${id}`);
};

export const fetchWaStatus = async () => {
  const res = await adminapi.get('/openwa-session/status');
  return res.data || { authenticated: false };
};

export const addUser = async (data: any) => {
  if (data.role === 'admin') {
    const res = await adminapi.post('/auth/admin-users', data);
    return res.data;
  }
  const res = await userapi.post('/users', data);
  return res.data;
};

export const editUser = async (id: string, data: any) => {
  if (data.role === 'admin') {
    const res = await adminapi.put(`/auth/admin-users/${id}`, data);
    return res.data;
  }
  const res = await userapi.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async ({ id, role }: { id: string; role?: string }) => {
  if (role === 'admin') {
    await adminapi.delete(`/auth/admin-users/${id}`);
  } else {
    await userapi.delete(`/users/${id}`);
  }
};

export const bulkDeleteUsers = async (ids: string[]) => {
  await userapi.post('/users/bulk-delete', { ids });
};
