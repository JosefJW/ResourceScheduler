import axios from "axios";

const API_BASE = "http://localhost:5069";

export type ApiError = {
	detail: string;
	statusCode: number;
	title: string;
	type: string;
}



export type SignupResult = {
	token: string;
};

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



export type LoginResult = {
	token: string;
}

export async function login(data: { username: string; password: string }) {
	try {
		const res = await axios.post<LoginResult>(`${API_BASE}/login`, data);
		return res.data; // Successful login
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful login
	}
}



export type GetUserResult = {
	username: string;
	email: string;
}

export async function getUser() {
	try {
		const res = await axios.get<GetUserResult>(`${API_BASE}/user`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data; // Successfully got user
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
}



export type UpdateUsernameResult = {

}

export async function updateUsername(data: { username: string }) {
	try {
		const res = await axios.put<UpdateUsernameResult>(`${API_BASE}/user/name`,
			{ newName: data.username },
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data; // Successfully updated username
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
}



export type UpdateEmailResult = {

}

export async function updateEmail(data: { email: string }) {
	try {
		const res = await axios.put<UpdateEmailResult>(
			`${API_BASE}/user/email`,
			{ newEmail: data.email },
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data; // Successfully updated email
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
}



export type UpdatePasswordResult = {

}

export async function updatePassword(data: { oldPassword: string, newPassword: string }) {
	try {
		const res = await axios.put<UpdatePasswordResult>(
			`${API_BASE}/user/password`,
			data,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data; // Successfully updated password
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" }
		throw errorData;
	}
}