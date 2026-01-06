import axios from "axios";

const API_BASE = "http://localhost:5069";

export type CreateFamilyResult = {
	id: number;
	name: string;
}

export type GetFamiliesResult = {
	id: number;
	name: string;
}

export type ApiError = {
	detail: string;
	statusCode: number;
	title: string;
	type: string;
}

export async function createFamily(data: { name: string }) {
	try {
		const res = await axios.post<CreateFamilyResult>(
			`${API_BASE}/families`,
			data,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);
		return res.data; // Successfully created family
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
};

export async function getFamilies() {
	try {
		const res = await axios.get<GetFamiliesResult[]>(
			`${API_BASE}/families`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);
		return res.data; // Successfully created family
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
};