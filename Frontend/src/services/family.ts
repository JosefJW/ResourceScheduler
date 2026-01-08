import axios from "axios";

const API_BASE = "http://localhost:5069";

export type ApiError = {
	detail: string;
	statusCode: number;
	title: string;
	type: string;
}



export type CreateFamilyResult = {
	id: number;
	name: string;
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



export type GetFamilyResult = {
	familyName: string;
}

export async function getFamily(data: { familyId: number }) {
	try {
		const res = await axios.get<GetFamilyResult>(
			`${API_BASE}/families/${data.familyId}`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data;
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
}


export type GetFamiliesResult = {
	id: number;
	name: string;
}

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
		return res.data; // Successfully retrieved family
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
};



export type GetFamilyMembersResult = {
	id: number;
	name: string;
	email: string;
	role: string;
}

export async function getFamilyMembers(data: { familyId: number }) {
	try {
		const res = await axios.get<GetFamilyMembersResult[]>(
			`${API_BASE}/families/${data.familyId}/users`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);

		return res.data;
	} catch (err: any) {
		throw err.response?.data ?? { message: "Unknown error" };
	}
}