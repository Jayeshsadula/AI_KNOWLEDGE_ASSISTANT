import api from "./api";

export const chatService = {
  async getSessions()            { return (await api.get("/api/chat/history")).data; },
  async getSession(id)           { return (await api.get(`/api/chat/session/${id}`)).data; },
  async sendMessage(payload)     { return (await api.post("/api/chat", payload)).data; },
};
