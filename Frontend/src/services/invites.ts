import axios from "axios";

const API_BASE = "http://localhost:5069";

export type GetInvitesResult = {
	id: number;
	familyId: number;
	familyName: string;
	inviterName: string;
	createdAt: string;
}

export type AcceptInviteResult = {
	familyId: number;
	userId: number;
	role: string;
}

export type DeclineInviteResult = {

}

export type ApiError = {
	detail: string;
	statusCode: number;
	title: string;
	type: string;
}

export async function getInvites() {
	try {
		const res = await axios.get<GetInvitesResult[]>(
			`${API_BASE}/families/invitations`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);
		return res.data; // Successfully retrieved invitations
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
};

export async function acceptInvite(data: { familyId: number, inviteId: number }) {
	try {
		const res = await axios.post<AcceptInviteResult>(
			`${API_BASE}/families/${data.familyId}/invite/${data.inviteId}/accept`,
			null,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);
		return res.data;
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
}

export async function declineInvite(data: { familyId: number, inviteId: number }) {
	try {
		const res = await axios.post<DeclineInviteResult>(
			`${API_BASE}/families/${data.familyId}/invite/${data.inviteId}/decline`,
			null,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);
		return res.data;
	}
	catch (err: any) {
		const errorData: ApiError = err.response?.data || { message: "Unknown error" };
		throw errorData; // Unsuccessful
	}
}