import api from "./api";

export const documentService = {
  async list()       { return (await api.get("/api/documents")).data; },
  async remove(id)   { return (await api.delete(`/api/documents/${id}`)).data; },

  async upload(file, onProgress) {
    const fd = new FormData();
    fd.append("file", file);
    return (
      await api.post("/api/documents/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      })
    ).data;
  },
};
