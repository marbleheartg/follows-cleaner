import axiosInstance from "../config"

export default function login() {
  return axiosInstance.get("/api/login").then(res => res.data)
}
