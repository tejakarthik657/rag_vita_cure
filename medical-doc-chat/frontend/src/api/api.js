import axios from 'axios';

const BASE_URL = "http://localhost:4000/api";

export const api = {
  // User Routes
  getDocuments: () => axios.get(`${BASE_URL}/documents`),
  chat: (documentId, question) => axios.post(`${BASE_URL}/chat`, { documentId, question }),
  generalChat: (question) => axios.post(`${BASE_URL}/chat/general`, { question }),
  
  // Admin Routes
  uploadFile: (file, creds) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${BASE_URL}/admin/upload`, formData, {
      headers: { ...creds, "Content-Type": "multipart/form-data" }
    });
  },
  reingest: (creds) => axios.post(`${BASE_URL}/admin/reingest`, {}, { headers: creds })
};