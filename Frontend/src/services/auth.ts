import axios from "axios";

const API_BASE = "http://localhost:5069";

export type SignupResult = {
	token: string;
};

export type LoginResult = {
	token: string;
}

export type ApiError = {
	detail: string;
	statusCode: number;
	title: string;
	type: string;
}

export async function signup(data: { username: string; email: string; password: string }) {
	try {
		const res = await axios.post<SignupResult>(`${API_BASE}/signup`, data);
		return res.data; // Successful signup
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful signup
	}

}

export async function login(data: { username: string; password: string }) {
	try {
		const res = await axios.post<LoginResult>(`${API_BASE}/login`, data);
		return res.data; // Successful login
	}
	catch (err: any) {
		console.log(err);
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful login
	}
}