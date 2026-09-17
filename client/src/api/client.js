import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, //this will include cookies while making a request to the server

  headers: {
    //this will tell server that client is sending data in json format
    'Content-Type': 'application/json',
  },
});

export default api;
