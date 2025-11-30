import { api } from "./api";

export const personApi = {
  async list() {
    const res = await api.get("/person");
    return res.data;
  },

  async get(id: number) {
    const res = await api.get(`/person/${id}`);
    return res.data;
  },

  async update(id: number, payload: Record<string, unknown>) {
    const res = await api.put(`/person/${id}`, payload);
    return res.data;
  },

  async adminResetPassword(id: number, newPassword: string) {
    const res = await api.post(`/person/${id}/reset-password`, { newPassword });
    return res.data;
  }
};
