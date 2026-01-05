import axios from "axios";

const API_BASE = "http://localhost:5069/api";

export async function signup(data: { username: string; email: string; password: string }) {
	const res = await axios.post(`${API_BASE}/auth/signup`, data);
	return res.data;
}

export async function login(data: { username: string; password: string }) {
	const res = await axios.post(`${API_BASE}/auth/login`, data);
	return res.data;
}