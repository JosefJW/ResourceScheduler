import axios from "axios";

const API_BASE = "http://localhost:5069";

export type GetFamilyItemsResult = {
	id: number;
	name: string;
	type: string;
	isActive: boolean;
}

export async function getFamilyItems(data: { familyId: number }) {
	try {
		const res = await axios.get<GetFamilyItemsResult[]>(
			`${API_BASE}/items/family/${data.familyId}`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);
		return res.data;
	}
	catch (err: any) {
		throw err.response?.data ?? { message: "Unknown error" };
	}
}



export type AddItemResult = {

}

export async function addItem(data: { familyId: number, name: string, type: string }) {
	try {
		const res = await axios.post<AddItemResult>(
			`${API_BASE}/items`,
			data,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("JWT")}`
				}
			}
		);
		return res.data;
	}
	catch (err: any) {
		throw err.response?.data ?? { message: "Unknown error" };
	}
}