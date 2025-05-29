import axios from "axios"

const http = axios.create({
  baseURL: "https://server.dinosaurusrex.icu",
});

export default http