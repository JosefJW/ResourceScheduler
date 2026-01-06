import axios from "axios";

const API_BASE = "http://localhost:5069";

export type GetUserReservationsResult = {
	id: number;
	familyId: number;
	itemId: number;
	itemName: string;
	startTime: string;
	endTime: string;
}

export type ApiError = {
	detail: string;
	statusCode: number;
	title: string;
	type: string;
}

export async function getUserReservations() {
	try {
		const res = await axios.get<GetUserReservationsResult[]>(
			`${API_BASE}/reservations/user`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);
		return res.data; // Successfully retrieved reservations
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
}