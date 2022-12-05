import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_SERVER,
  // headers: {'Authorization': `Bearer ${token}`}
}
);