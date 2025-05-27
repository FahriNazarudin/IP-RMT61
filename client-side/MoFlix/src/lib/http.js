import axios from "axios"

const http = axios.create({
  baseURL: "https://localhost:3000/",
});

export default http