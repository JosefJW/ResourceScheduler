import axios from "axios";

const API_BASE = "http://localhost:5069";

export type ApiError = {
	detail: string;
	statusCode: number;
	title: string;
	type: string;
}



export type GetUserReservationsResult = {
	id: number;
	familyId: number;
	itemId: number;
	itemName: string;
	startTime: string;
	endTime: string;
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



export type GetFamilyReservationsResult = {
	id: number;
	familyId: number;
	itemId: number;
	itemName: string;
	startTime: string;
	endTime: string;
}

export async function getFamilyReservations(data: { familyId: number }) {
	try {
		const res = await axios.get<GetFamilyReservationsResult[]>(
			`${API_BASE}/reservations/family/${data.familyId}`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data;
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" }
		throw errorData;
	}
}



export type CheckItemAvailabilityResult = {
	available: boolean;
}

export async function checkItemAvailability(data: { itemId: number, startTime: string, endTime: string }) {
	try {
		const start = encodeURIComponent(data.startTime);
		const end = encodeURIComponent(data.endTime);
		const res = await axios.get<CheckItemAvailabilityResult>(
			`${API_BASE}/reservations/item/${data.itemId}/from/${start}/to/${end}`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data;
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" }
		throw errorData;
	}
}



export type MakeReservationResult = {

}

export async function makeReservation( data: { itemId: number, startTime: string, endTime: string }) {
	try {
		const res = await axios.post<MakeReservationResult>(
			`${API_BASE}/reservations`,
			data,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data;
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { detail: "Unknown error" }
		throw errorData;
	}
}



export type GetReservationResult = {
	reservationId: number,
	itemName: string,
	userId: number,
	username: string,
	startTime: string,
	endTime: string,
}

export async function getReservation( data: { reservationId: number }) {
	try {
		const res = await axios.get<GetReservationResult>(
			`${API_BASE}/reservations/${data.reservationId}`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		)
		return res.data;
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { detail: "Unknown error" }
		throw errorData;
	}
}