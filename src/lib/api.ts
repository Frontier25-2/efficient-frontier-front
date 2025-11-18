import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // 꼭 127.0.0.1 로!
  timeout: 15000,
});

export default api;
